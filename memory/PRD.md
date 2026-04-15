# Battle for Rokugan - Online Board Game

## Original Problem Statement
Implement an online version of Battle for Rokugan, a strategic war board game. 5 rounds, 7 clans, complex combat system. Room-based multiplayer with WebSocket real-time sync.

## Architecture
- **Backend**: FastAPI + MongoDB + WebSocket (Python)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB (games, rooms, users collections)
- **Real-time**: WebSocket at /api/ws/{game_id}?token={jwt}

## User Personas
- **Host**: Creates rooms, starts games, controls resolution proceed
- **Player**: Joins rooms, selects clan, places tokens, plays the game
- **Spectator**: Views games in progress (read-only)

## Core Requirements (Static)
1. JWT auth with username/password
2. Room management (create/join/list/start)
3. 7 clans with unique abilities
4. 30 provinces, 76 borders, 10 territories
5. 5-round game with 3 phases per round
6. Combat token system (army, navy, shinobi, diplomacy, raid, blessing, bluff)
7. Battle resolution with attacker/defender strength calculation
8. Territory card system
9. Secret objectives
10. End-game honor scoring

## What's Been Implemented (Phase 1 MVP) - Apr 15, 2026
- [x] JWT authentication (register/login/me)
- [x] Room system (create/join/list/start)
- [x] Full game board rendering with 3737x2313 board image
- [x] Interactive provinces (30) and borders (76) with click handlers
- [x] Clan selection (7 clans with abilities)
- [x] Secret objective selection (12 objectives, 2 dealt per player)
- [x] Round 0 setup: Capital control tokens + set-aside token placement
- [x] Combat token generation per clan (with clan-specific extras)
- [x] Rounds 1-5: Upkeep (draw tokens to 6), Placement (5 per round), Resolution
- [x] Battle resolution (attacker vs defender strength calculation)
- [x] Territory card claiming
- [x] End-game honor scoring (flowers, faceup tokens, territories, objectives)
- [x] WebSocket real-time sync for all game actions
- [x] Spectator mode via query param
- [x] Status panel (round tracker, turn indicator, player stats, territory cards, game log)
- [x] Player hand (token selection, placement flow)
- [x] Fallback token rendering (colored circles/squares when images not uploaded)
- [x] Background music support
- [x] Reconnection support (WebSocket auto-reconnect)
- [x] Dark theme with Cinzel/Manrope fonts, feudal Japan aesthetic

## Prioritized Backlog

### P0 (Next Phase)
- [ ] Territory card effects (play during upkeep/placement)
- [ ] Scout/Shugenja card usage in placement phase
- [ ] Clan unique abilities (Crane tie-break, Dragon extra draw, etc.)
- [ ] Ronin mechanics
- [ ] Special token placement rules (Peace prevents attacks, Scorched Earth, etc.)

### P1 (Phase 2+)
- [ ] Upload and use actual token/control/special images
- [ ] Edit Mode (host drag tokens)
- [ ] Token direction pointer on border placements
- [ ] Blessing token stacking
- [ ] Adjacency validation for army attacks
- [ ] Navy/sea attack flow
- [ ] Popup descriptions for clans, territory cards, tokens

### P2 (Polish)
- [ ] Asset caching service worker
- [ ] Mobile-responsive improvements
- [ ] Sound effects for token placement/battle
- [ ] Animation for battle resolution
- [ ] Game replay/history
- [ ] Multiple games per room host
