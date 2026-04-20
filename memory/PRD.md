# Battle for Rokugan - Online Board Game PRD

## Architecture
- Backend: FastAPI + MongoDB + WebSocket
- Frontend: React + Tailwind CSS + Shadcn UI
- Real-time: WebSocket /api/ws/{game_id}?token={jwt}

## Implemented Features - Apr 20, 2026

### Core Game
- JWT auth, room system, 7-clan selection, 12 secret objectives
- Full game board (3737x2313 map, 30 provinces, 76 borders)
- 5-round game: Setup → (Upkeep → Placement → Resolution)x5 → Scoring
- Combat tokens, battle resolution, territory claiming, end-game honor

### Clan Abilities
- Dragon: Draw extra token + must return 1 (modal UI)
- Crane: Tie-break wins (resolution)
- Crab: Face-up control tokens +2 defense
- Lion: Bluff token +2 defense, stays when defending
- Phoenix: Ignore clan capital defense when attacking
- Scorpion: Spy ability (peek at token once/round)
- Unicorn: Swap two own tokens before reveal

### Cards & Abilities
- Scout cards (2/player): Peek at opponent token with big calligraphy modal
- Shugenja cards (1/player): Reveal+discard opponent token, broadcast to all
- Territory card play with full description broadcast to all players
- Upkeep phase territory card passing (rounds 2+)

### UI Features
- Province info popup (name, territory, owner, flowers, defense, coastal, special)
- Secret objective detail popup (click to view)
- Territory card details visible to owner, broadcast on play
- All players see Scout/Shugenja remaining for all players
- Big announcement modals for game events
- 2x enlarged tokens, 3x direction pointers (top/bottom/left/right based on isUpDown)
- Any token type placeable anywhere (province center or border)
- Navy from sea to coastal province placement
- Blessing targeting: click existing placed tokens
- Host admin: skip turn, force proceed, end game

### Technical
- Constants extracted to gameConstants.js
- .env.example files for backend and frontend
- Fallback token renderers when images not available

## Remaining Backlog
### P0
- Full territory card effects (complex multi-step province selection)
- Ronin mechanics (adjacency rules relaxed)
### P1
- Upload actual token art for all clans
- Sound effects for actions
- Battle resolution animations
