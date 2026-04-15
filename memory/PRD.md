# Battle for Rokugan - Online Board Game PRD

## Problem Statement
Online multiplayer implementation of Battle for Rokugan board game. Strategic war game with 7 clans, 5 rounds, territory control, combat tokens, and honor scoring.

## Architecture
- Backend: FastAPI + MongoDB + WebSocket (Python)
- Frontend: React 19 + Tailwind CSS + Shadcn UI
- Database: MongoDB (games, rooms, users)
- Real-time: WebSocket at /api/ws/{game_id}?token={jwt}

## User Personas
- Host: Creates rooms, starts games, controls resolution proceed, edit mode
- Player: Joins rooms, plays the game with full clan abilities
- Spectator: Views games read-only

## Implemented Features (Phase 1+2+3) - Apr 15, 2026

### Phase 1 (MVP)
- JWT auth (register/login)
- Room system (create/join/list/start)
- Game board rendering (3737x2313 map, 30 provinces, 76 borders)
- Clan selection (7 clans), Secret objectives (12)
- Round 0 setup with control token placement
- Rounds 1-5: Upkeep → Placement → Resolution
- Combat token system, battle resolution
- Territory claiming, end-game scoring
- WebSocket real-time sync, spectator mode
- Dark theme, Cinzel/Manrope fonts

### Phase 2 (Abilities & Cards)
- Scout card (peek at opponent token, private result)
- Shugenja card (reveal + discard opponent token, all see result)
- Scorpion spy ability (once per round, peek at token)
- Unicorn swap ability (switch two own tokens before reveal)
- Dragon extra draw (draw 7, return 1)
- Territory card play (mark as used, logged)
- Calligraphy animation modals for Scout/Shugenja/Scorpion
- Upkeep phase with territory card passing
- Ability targeting mode (click province/border to target)

### Phase 3 (Polish)
- Edit Mode (host toggle, saves positions)
- Direction pointers on border tokens (gold arrows)
- Token images with fallback renderers
- Enhanced UI: ability buttons with icons, territory card play buttons

## Remaining Backlog
### P0
- Full territory card effects (complex multi-step interactions)
- Lion bluff defense (+2, not discarded)
- Phoenix ignore capital defense
- Ronin placement rules
- Adjacency validation for army attacks

### P1
- Upload actual token art (currently using placeholders)
- Edit mode drag-and-drop functionality
- Blessing token stacking UI
- Navy/sea attack flow improvement
- Popup descriptions for game elements

### P2
- Service worker for asset caching
- Sound effects
- Battle resolution animations
- Game history/replay
