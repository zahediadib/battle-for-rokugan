import asyncio
import websockets
import json
import sys
import requests

API_URL = "http://localhost:8001"

def login(username, password):
    r = requests.post(f"{API_URL}/api/auth/login", json={"username": username, "password": password})
    return r.json()["token"]

def get_state(token, game_id):
    r = requests.get(f"{API_URL}/api/game/{game_id}", headers={"Authorization": f"Bearer {token}"})
    return r.json()

async def main():
    t1 = login("player1", "p1")
    t2 = login("player2", "p2")
    game_id = sys.argv[1]
    
    state = get_state(t1, game_id)
    print(f"Start: status={state['status']}, phase={state['phase']}, turn={state['current_turn_index']}")
    
    ws1 = await websockets.connect(f"ws://localhost:8001/api/ws/{game_id}?token={t1}")
    ws2 = await websockets.connect(f"ws://localhost:8001/api/ws/{game_id}?token={t2}")
    
    # Drain initial
    for w in [ws1, ws2]:
        for _ in range(3):
            try: await asyncio.wait_for(w.recv(), timeout=0.3)
            except: break
    
    provinces = [
        'crab_2', 'crane_1', 'wind_1', 'phoenix_1', 'scorpion_2', 'island_1',
        'wind_2', 'island_2', 'unicorn_1', 'island_3', 'shadowland_bottom',
        'wind_3', 'crane_2', 'scorpion_3', 'lion_1', 'phoenix_2',
        'lion_3', 'dragon_3', 'unicorn_3', 'dragon_1',
    ]
    
    for prov in provinces:
        state = get_state(t1, game_id)
        if state['status'] != 'setup':
            print(f"Setup done! status={state['status']}, phase={state['phase']}, round={state['round']}")
            for p in state['players']:
                print(f"  {p['clan']}: hand={p.get('hand_count',0)}, provinces={p['provinces_controlled']}")
            break
        
        turn = state['current_turn_index']
        ws = ws1 if turn == 0 else ws2
        
        await ws.send(json.dumps({"action": "place_control_token", "province_id": prov}))
        await asyncio.sleep(0.1)
        
        # Drain
        for w in [ws1, ws2]:
            for _ in range(5):
                try: await asyncio.wait_for(w.recv(), timeout=0.1)
                except: break
        
        print(f"Placed {prov} (turn was {turn})")
    
    await ws1.close()
    await ws2.close()

asyncio.run(main())
