from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import json
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional, Dict
from game_engine import create_game_state, process_action, get_player_view, get_player_index

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"


# === Auth Helpers ===
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, username: str) -> str:
    payload = {"sub": user_id, "username": username, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"user_id": str(user["_id"]), "username": user["username"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None


# === Auth Models ===
class RegisterInput(BaseModel):
    username: str
    password: str

class LoginInput(BaseModel):
    username: str
    password: str

class RoomCreateInput(BaseModel):
    name: str
    max_players: int = 5


# === Auth Endpoints ===
@api_router.post("/auth/register")
async def register(inp: RegisterInput):
    existing = await db.users.find_one({"username": inp.username.lower()})
    if existing:
        raise HTTPException(400, "Username already taken")
    hashed = hash_password(inp.password)
    result = await db.users.insert_one({
        "username": inp.username.lower(),
        "password_hash": hashed,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, inp.username.lower())
    return {"user_id": user_id, "username": inp.username.lower(), "token": token}

@api_router.post("/auth/login")
async def login(inp: LoginInput):
    user = await db.users.find_one({"username": inp.username.lower()})
    if not user or not verify_password(inp.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    user_id = str(user["_id"])
    token = create_access_token(user_id, user["username"])
    return {"user_id": user_id, "username": user["username"], "token": token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user


# === Room Endpoints ===
@api_router.post("/rooms")
async def create_room(inp: RoomCreateInput, request: Request):
    user = await get_current_user(request)
    room_id = str(uuid.uuid4())
    room = {
        "room_id": room_id,
        "name": inp.name,
        "host_user_id": user["user_id"],
        "host_username": user["username"],
        "max_players": min(max(inp.max_players, 2), 5),
        "players": [{"user_id": user["user_id"], "username": user["username"]}],
        "status": "waiting",
        "game_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.rooms.insert_one(room)
    room.pop("_id", None)
    return room

@api_router.get("/rooms")
async def list_rooms(request: Request):
    await get_current_user(request)
    rooms = await db.rooms.find({"status": {"$in": ["waiting", "playing"]}}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return rooms

@api_router.get("/rooms/{room_id}")
async def get_room(room_id: str, request: Request):
    await get_current_user(request)
    room = await db.rooms.find_one({"room_id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(404, "Room not found")
    return room

@api_router.post("/rooms/{room_id}/join")
async def join_room(room_id: str, request: Request):
    user = await get_current_user(request)
    room = await db.rooms.find_one({"room_id": room_id})
    if not room:
        raise HTTPException(404, "Room not found")
    if room["status"] != "waiting":
        raise HTTPException(400, "Game already started")
    if len(room["players"]) >= room["max_players"]:
        raise HTTPException(400, "Room is full")
    if any(p["user_id"] == user["user_id"] for p in room["players"]):
        return {"message": "Already in room"}
    await db.rooms.update_one(
        {"room_id": room_id},
        {"$push": {"players": {"user_id": user["user_id"], "username": user["username"]}}}
    )
    return {"message": "Joined room"}

@api_router.post("/rooms/{room_id}/leave")
async def leave_room(room_id: str, request: Request):
    user = await get_current_user(request)
    room = await db.rooms.find_one({"room_id": room_id})
    if not room:
        raise HTTPException(404, "Room not found")
    if room["status"] != "waiting":
        raise HTTPException(400, "Cannot leave during game")
    await db.rooms.update_one(
        {"room_id": room_id},
        {"$pull": {"players": {"user_id": user["user_id"]}}}
    )
    return {"message": "Left room"}

@api_router.post("/rooms/{room_id}/start")
async def start_game(room_id: str, request: Request):
    user = await get_current_user(request)
    room = await db.rooms.find_one({"room_id": room_id})
    if not room:
        raise HTTPException(404, "Room not found")
    if room["host_user_id"] != user["user_id"]:
        raise HTTPException(403, "Only host can start")
    if len(room["players"]) < 2:
        raise HTTPException(400, "Need at least 2 players")
    if room["status"] != "waiting":
        raise HTTPException(400, "Game already started")

    game_state = create_game_state(room)
    await db.games.insert_one(game_state)
    game_state.pop("_id", None)
    await db.rooms.update_one({"room_id": room_id}, {"$set": {"status": "playing", "game_id": game_state["game_id"]}})

    # Broadcast to WebSocket connections
    await ws_manager.broadcast_state(game_state["game_id"])

    return {"game_id": game_state["game_id"]}


# === Game HTTP Endpoints ===
@api_router.get("/game/{game_id}")
async def get_game(game_id: str, request: Request):
    user = await get_current_user(request)
    game = await db.games.find_one({"game_id": game_id}, {"_id": 0})
    if not game:
        raise HTTPException(404, "Game not found")
    player_idx = get_player_index(game, user["user_id"])
    is_spectator = player_idx < 0
    return get_player_view(game, user["user_id"], is_spectator)

@api_router.get("/game/{game_id}/map")
async def get_map_data(game_id: str):
    from game_data import PROVINCES, BORDERS, TERRITORIES
    return {"provinces": PROVINCES, "borders": BORDERS, "territories": TERRITORIES}

@api_router.get("/game-data/objectives")
async def get_objectives():
    from game_data import SECRET_OBJECTIVES
    return [{"id": o["id"], "name": o["name"], "description": o["description"], "honor": o["honor"]} for o in SECRET_OBJECTIVES]

@api_router.get("/game-data/clans")
async def get_clans():
    from game_data import CLAN_LIST, CLAN_COLORS, CLAN_CAPITALS
    return [{"id": c, "color": CLAN_COLORS[c], "capital": CLAN_CAPITALS[c]} for c in CLAN_LIST]


# === WebSocket Manager ===
class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
        self.spectators: Dict[str, list] = {}

    async def connect(self, game_id: str, user_id: str, ws: WebSocket):
        await ws.accept()
        if game_id not in self.connections:
            self.connections[game_id] = {}
        self.connections[game_id][user_id] = ws

    async def connect_spectator(self, game_id: str, ws: WebSocket):
        await ws.accept()
        if game_id not in self.spectators:
            self.spectators[game_id] = []
        self.spectators[game_id].append(ws)

    def disconnect(self, game_id: str, user_id: str):
        if game_id in self.connections:
            self.connections[game_id].pop(user_id, None)

    def disconnect_spectator(self, game_id: str, ws: WebSocket):
        if game_id in self.spectators:
            self.spectators[game_id] = [s for s in self.spectators[game_id] if s != ws]

    async def broadcast_state(self, game_id: str):
        game = await db.games.find_one({"game_id": game_id}, {"_id": 0})
        if not game:
            return

        # Send to players
        if game_id in self.connections:
            for uid, ws in list(self.connections[game_id].items()):
                try:
                    view = get_player_view(game, uid)
                    await ws.send_json({"type": "game_state", "state": view})
                except Exception:
                    self.connections[game_id].pop(uid, None)

        # Send to spectators
        if game_id in self.spectators:
            spectator_view = get_player_view(game, "__spectator__", is_spectator=True)
            for ws in list(self.spectators[game_id]):
                try:
                    await ws.send_json({"type": "game_state", "state": spectator_view})
                except Exception:
                    self.spectators[game_id].remove(ws)

    async def send_notification(self, game_id: str, message: str):
        notification = {"type": "notification", "message": message}
        if game_id in self.connections:
            for uid, ws in list(self.connections[game_id].items()):
                try:
                    await ws.send_json(notification)
                except Exception:
                    pass
        if game_id in self.spectators:
            for ws in list(self.spectators[game_id]):
                try:
                    await ws.send_json(notification)
                except Exception:
                    pass


ws_manager = ConnectionManager()


@app.websocket("/api/ws/{game_id}")
async def websocket_endpoint(ws: WebSocket, game_id: str):
    token = ws.query_params.get("token")
    spectator = ws.query_params.get("spectator") == "true"

    if spectator:
        await ws_manager.connect_spectator(game_id, ws)
        # Send initial state
        game = await db.games.find_one({"game_id": game_id}, {"_id": 0})
        if game:
            view = get_player_view(game, "__spectator__", is_spectator=True)
            await ws.send_json({"type": "game_state", "state": view})
        try:
            while True:
                await ws.receive_text()
        except WebSocketDisconnect:
            ws_manager.disconnect_spectator(game_id, ws)
        return

    if not token:
        await ws.close(code=4001, reason="No token")
        return

    payload = decode_token(token)
    if not payload:
        await ws.close(code=4001, reason="Invalid token")
        return

    user_id = payload["sub"]
    username = payload.get("username", "unknown")

    await ws_manager.connect(game_id, user_id, ws)

    # Send initial game state
    game = await db.games.find_one({"game_id": game_id}, {"_id": 0})
    if game:
        view = get_player_view(game, user_id)
        await ws.send_json({"type": "game_state", "state": view})

    try:
        while True:
            data = await ws.receive_text()
            try:
                action = json.loads(data)
            except json.JSONDecodeError:
                await ws.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            # Load latest game state
            game = await db.games.find_one({"game_id": game_id}, {"_id": 0})
            if not game:
                await ws.send_json({"type": "error", "message": "Game not found"})
                continue

            success, message, updated_game = process_action(game, user_id, action)

            if success:
                # Save to DB
                await db.games.replace_one({"game_id": game_id}, updated_game)
                # Broadcast to all
                await ws_manager.broadcast_state(game_id)
                await ws.send_json({"type": "action_result", "success": True, "message": message})
                # Send notification if round changed
                if "begins" in message or "resolved" in message or "revealed" in message:
                    await ws_manager.send_notification(game_id, message)
            else:
                await ws.send_json({"type": "action_result", "success": False, "message": message})

    except WebSocketDisconnect:
        ws_manager.disconnect(game_id, user_id)
        logger.info(f"Player {username} disconnected from game {game_id}")


# === Startup ===
@app.on_event("startup")
async def startup():
    await db.users.create_index("username", unique=True)
    await db.rooms.create_index("room_id", unique=True)
    await db.games.create_index("game_id", unique=True)
    logger.info("Battle for Rokugan server started!")

@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
