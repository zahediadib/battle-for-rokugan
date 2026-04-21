"""Battle for Rokugan - Game Engine"""
import random
import uuid
import copy
from datetime import datetime, timezone
from game_data import (
    CLAN_COLORS, CLAN_LIST, SETUP_TOKENS_BY_PLAYER_COUNT, DEFAULT_COMBAT_TOKENS,
    CLAN_EXTRA_TOKENS, PROVINCES, PROVINCE_MAP, BORDERS, BORDER_MAP, TERRITORIES,
    TERRITORY_MAP, CLAN_CAPITALS, TERRITORY_CARDS, SECRET_OBJECTIVES, ADJACENCY,
    get_provinces_for_territory, get_coastal_borders_for_province, get_land_borders_between,
)


def generate_combat_tokens(clan):
    """Generate all combat tokens for a clan."""
    tokens = []
    # Start with default tokens
    all_tokens = {}
    for token_type, strengths in DEFAULT_COMBAT_TOKENS.items():
        all_tokens[token_type] = dict(strengths)
    # Add clan extras
    if clan in CLAN_EXTRA_TOKENS:
        for token_type, strengths in CLAN_EXTRA_TOKENS[clan].items():
            if token_type not in all_tokens:
                all_tokens[token_type] = {}
            for strength, count in strengths.items():
                all_tokens[token_type][strength] = all_tokens[token_type].get(strength, 0) + count
    # Generate token list
    idx = 0
    for token_type, strengths in all_tokens.items():
        for strength, count in strengths.items():
            for i in range(count):
                tokens.append({
                    "id": f"{token_type}_{strength}_{idx}",
                    "type": token_type,
                    "strength": strength,
                })
                idx += 1
    # Bluff token always in hand
    tokens.append({"id": "bluff_0", "type": "bluff", "strength": 0})
    return tokens


def create_game_state(room_data):
    """Create initial game state from room data."""
    game_id = str(uuid.uuid4())
    player_count = len(room_data["players"])
    setup_tokens = SETUP_TOKENS_BY_PLAYER_COUNT.get(player_count, 4)

    # Randomly assign territory cards (1 per territory)
    territory_state = {}
    for t in TERRITORIES:
        cards = TERRITORY_CARDS.get(t["id"], [])
        if t["id"] == "shadowland":
            # Shadowlands has 4 cards (2 per sub-territory), pick 1 for each
            bottom_cards = [c for c in cards if "bottom" in c["id"]]
            top_cards = [c for c in cards if "top" in c["id"]]
            chosen_bottom = random.choice(bottom_cards) if bottom_cards else None
            chosen_top = random.choice(top_cards) if top_cards else None
            territory_state["shadowland_bottom"] = {
                "card": chosen_bottom,
                "card_owner": None,
                "card_used": False,
            }
            territory_state["shadowland_top"] = {
                "card": chosen_top,
                "card_owner": None,
                "card_used": False,
            }
        else:
            chosen = random.choice(cards) if cards else None
            territory_state[t["id"]] = {
                "card": chosen,
                "card_owner": None,
                "card_used": False,
            }

    # Initialize provinces
    province_state = {}
    for p in PROVINCES:
        if p["id"] == "sea":
            continue
        province_state[p["id"]] = {
            "controlled_by": None,
            "control_tokens": [],
            "special_token": None,
            "bonus_tokens": [],
            "combat_tokens": [],
        }

    # Initialize borders
    border_state = {}
    for b in BORDERS:
        border_state[b["id"]] = {"combat_token": None}

    # Determine secret objectives (deal 2, pick 1)
    shuffled_objectives = random.sample(SECRET_OBJECTIVES, len(SECRET_OBJECTIVES))

    players = []
    for i, p in enumerate(room_data["players"]):
        obj_start = (i * 2) % len(shuffled_objectives)
        obj1 = shuffled_objectives[obj_start]
        obj2 = shuffled_objectives[(obj_start + 1) % len(shuffled_objectives)]
        players.append({
            "user_id": p["user_id"],
            "username": p["username"],
            "clan": None,
            "color": None,
            "token_pool": [],
            "hand": [],
            "discard_pile": [],
            "control_tokens_total": 30,
            "control_tokens_placed": 0,
            "setup_tokens_remaining": setup_tokens,
            "scout_cards": 2,
            "shugenja_cards": 1,
            "secret_objective": None,
            "secret_objective_options": [obj1["id"], obj2["id"]],
            "territory_cards": [],
            "is_ronin": False,
            "tokens_placed_this_round": 0,
            "passed_territory_card": False,
        })

    # Random first player
    first_player_index = random.randint(0, player_count - 1)

    return {
        "game_id": game_id,
        "room_id": room_data["room_id"],
        "status": "clan_selection",
        "round": 0,
        "phase": "setup",
        "players": players,
        "provinces": province_state,
        "borders": border_state,
        "territories": territory_state,
        "first_player_index": first_player_index,
        "current_turn_index": first_player_index,
        "turn_order": list(range(player_count)),
        "all_passed_territory": False,
        "host_user_id": room_data["host_user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolution_revealed": False,
        "resolution_step": 0,
        "log": [],
    }


def get_player_index(game, user_id):
    for i, p in enumerate(game["players"]):
        if p["user_id"] == user_id:
            return i
    return -1


def process_action(game, user_id, action):
    """Process a game action and return (success, message, updated_game)."""
    action_type = action.get("action")
    player_idx = get_player_index(game, user_id)

    if action_type == "select_clan":
        return process_select_clan(game, player_idx, action)
    elif action_type == "select_objective":
        return process_select_objective(game, player_idx, action)
    elif action_type == "place_control_token":
        return process_place_control_token(game, player_idx, action)
    elif action_type == "place_combat_token":
        return process_place_combat_token(game, player_idx, action)
    elif action_type == "pass_territory_card":
        return process_pass_territory(game, player_idx)
    elif action_type == "play_territory_card":
        return process_play_territory_card(game, player_idx, action)
    elif action_type == "proceed":
        return process_proceed(game, player_idx)
    elif action_type == "use_scout":
        return process_use_scout(game, player_idx, action)
    elif action_type == "use_shugenja":
        return process_use_shugenja(game, player_idx, action)
    elif action_type == "use_scorpion_ability":
        return process_scorpion_ability(game, player_idx, action)
    elif action_type == "use_unicorn_ability":
        return process_unicorn_ability(game, player_idx, action)
    elif action_type == "edit_positions":
        return process_edit_positions(game, player_idx, action)
    elif action_type == "dragon_return_token":
        return process_dragon_return(game, player_idx, action)
    elif action_type == "admin_skip_turn":
        return process_admin_skip_turn(game, player_idx)
    elif action_type == "admin_end_game":
        return process_admin_end_game(game, player_idx)
    elif action_type == "admin_force_proceed":
        return process_admin_force_proceed(game, player_idx)
    elif action_type == "select_token":
        return True, "Token selected", game
    else:
        return False, f"Unknown action: {action_type}", game


def process_select_clan(game, player_idx, action):
    if game["status"] != "clan_selection":
        return False, "Not in clan selection phase", game
    if player_idx < 0:
        return False, "Player not in game", game

    clan = action.get("clan")
    if clan not in CLAN_LIST:
        return False, f"Invalid clan: {clan}", game

    # Check not already taken
    for p in game["players"]:
        if p["clan"] == clan:
            return False, f"Clan {clan} already taken", game

    game["players"][player_idx]["clan"] = clan
    game["players"][player_idx]["color"] = CLAN_COLORS[clan]

    # Check if all players have selected clans
    all_selected = all(p["clan"] is not None for p in game["players"])
    if all_selected:
        game["status"] = "objective_selection"
        # Place capital control tokens
        for p in game["players"]:
            capital = CLAN_CAPITALS[p["clan"]]
            game["provinces"][capital]["controlled_by"] = game["players"].index(p)
            game["provinces"][capital]["control_tokens"].append({
                "face_up": False,
                "player_index": game["players"].index(p),
            })
            p["control_tokens_placed"] = 1
        # Generate token pools
        for p in game["players"]:
            all_tokens = generate_combat_tokens(p["clan"])
            bluff = [t for t in all_tokens if t["type"] == "bluff"]
            non_bluff = [t for t in all_tokens if t["type"] != "bluff"]
            random.shuffle(non_bluff)
            p["token_pool"] = non_bluff
            p["hand"] = bluff  # bluff always in hand
        game["log"].append(f"All clans selected. Capitals claimed.")

    return True, f"Selected clan: {clan}", game


def process_select_objective(game, player_idx, action):
    if game["status"] != "objective_selection":
        return False, "Not in objective selection phase", game

    obj_id = action.get("objective")
    player = game["players"][player_idx]

    if obj_id not in player["secret_objective_options"]:
        return False, "Invalid objective", game

    player["secret_objective"] = obj_id

    # Check if all selected
    all_selected = all(p["secret_objective"] is not None for p in game["players"])
    if all_selected:
        game["status"] = "setup"
        game["round"] = 0
        game["phase"] = "setup"
        game["log"].append("Objectives selected. Setup phase begins.")

    return True, "Objective selected", game


def process_place_control_token(game, player_idx, action):
    if game["status"] != "setup" or game["phase"] != "setup":
        return False, "Not in setup phase", game

    # Check it's this player's turn
    if player_idx != game["current_turn_index"]:
        return False, "Not your turn", game

    province_id = action.get("province_id")
    if province_id not in game["provinces"]:
        return False, f"Invalid province: {province_id}", game

    player = game["players"][player_idx]
    if player["setup_tokens_remaining"] <= 0:
        return False, "No setup tokens remaining", game

    province = game["provinces"][province_id]
    # Can place in any empty province (no control tokens from other players)
    # Actually: any empty province including capitals, shadowlands
    # Province is "empty" if no one controls it OR we can still place here
    # Rule: place in any empty province. An empty province has no control tokens.
    has_other_tokens = any(ct["player_index"] != player_idx for ct in province["control_tokens"])
    if has_other_tokens:
        return False, "Province has another player's tokens", game

    # Place control token
    province["control_tokens"].append({
        "face_up": False,
        "player_index": player_idx,
    })
    province["controlled_by"] = player_idx
    player["setup_tokens_remaining"] -= 1
    player["control_tokens_placed"] += 1

    # Advance turn
    advance_setup_turn(game)

    return True, f"Control token placed in {province_id}", game


def advance_setup_turn(game):
    """Advance to next player in setup phase."""
    player_count = len(game["players"])

    # Find next player with setup tokens
    for _ in range(player_count):
        game["current_turn_index"] = (game["current_turn_index"] + 1) % player_count
        if game["players"][game["current_turn_index"]]["setup_tokens_remaining"] > 0:
            return

    # All setup tokens placed - move to round 1
    start_round(game, 1)


def start_round(game, round_num):
    """Start a new round."""
    game["round"] = round_num
    game["status"] = "playing"

    if round_num > 5:
        end_game(game)
        return

    # Determine first player randomly each round
    game["first_player_index"] = random.randint(0, len(game["players"]) - 1)
    game["current_turn_index"] = game["first_player_index"]

    # Upkeep phase
    game["phase"] = "upkeep"

    # Return bluff tokens to hand
    for p in game["players"]:
        has_bluff = any(t["type"] == "bluff" for t in p["hand"])
        if not has_bluff:
            p["hand"].append({"id": "bluff_0", "type": "bluff", "strength": 0})

    # Draw combat tokens until 6 in hand
    for p in game["players"]:
        while len(p["hand"]) < 6 and len(p["token_pool"]) > 0:
            p["hand"].append(p["token_pool"].pop(0))

    # Reset round state
    for p in game["players"]:
        p["tokens_placed_this_round"] = 0
        p["passed_territory_card"] = False
        p["scorpion_ability_used"] = False
        p["dragon_must_return"] = False

    game["all_passed_territory"] = False
    game["resolution_revealed"] = False
    game["resolution_step"] = 0

    # Check ronin status
    for i, p in enumerate(game["players"]):
        controlled_count = sum(1 for prov in game["provinces"].values() if prov["controlled_by"] == i)
        p["is_ronin"] = controlled_count == 0

    # Skip territory card phase in round 1, go straight to placement
    if round_num == 1:
        game["phase"] = "placement"
        game["log"].append(f"Round {round_num} begins. Placement phase.")
    else:
        game["phase"] = "upkeep"
        game["all_passed_territory"] = False
        for p in game["players"]:
            p["passed_territory_card"] = False
        game["log"].append(f"Round {round_num} begins. Upkeep - play territory cards or pass.")

    # Dragon ability: draw 1 additional, return 1 non-bluff
    for p in game["players"]:
        if p["clan"] == "dragon" and len(p["token_pool"]) > 0:
            p["hand"].append(p["token_pool"].pop(0))
            p["dragon_must_return"] = True
            game["log"].append(f"Dragon draws an extra token (must return 1).")


def process_place_combat_token(game, player_idx, action):
    if game["status"] != "playing" or game["phase"] != "placement":
        return False, "Not in placement phase", game
    if player_idx != game["current_turn_index"]:
        return False, "Not your turn", game

    player = game["players"][player_idx]

    # Dragon must return token first
    if player.get("dragon_must_return"):
        return False, "Dragon must return a token first", game

    token_id = action.get("token_id")
    target_type = action.get("target_type")  # "province" or "border" or "blessing"
    target_id = action.get("target_id")

    # Must have at least 2 tokens (keep 1 at end)
    if len(player["hand"]) <= 1:
        return False, "Must keep 1 token behind screen", game

    # Find token in hand
    token = None
    for t in player["hand"]:
        if t["id"] == token_id:
            token = t
            break
    if not token:
        return False, "Token not in hand", game

    # Blessing special case
    if token["type"] == "blessing":
        blessing_target_id = action.get("blessing_target_id")
        placed = False
        # Check province combat tokens
        for prov_id, prov in game["provinces"].items():
            for ct in prov["combat_tokens"]:
                if ct.get("id") == blessing_target_id and ct["player_index"] == player_idx:
                    if ct["type"] in ("army", "navy", "shinobi") and not ct.get("face_up", False):
                        ct["blessing"] = {"id": token["id"], "strength": token["strength"]}
                        ct["face_up"] = True
                        placed = True
                        break
            if placed:
                break
        # Check borders
        if not placed:
            for bid, bstate in game["borders"].items():
                bt = bstate.get("combat_token")
                if bt and bt.get("id") == blessing_target_id and bt["player_index"] == player_idx:
                    if bt["type"] in ("army", "navy", "shinobi"):
                        bt["blessing"] = {"id": token["id"], "strength": token["strength"]}
                        placed = True
                        break
        if not placed:
            return False, "Invalid blessing target", game
        player["hand"].remove(token)
        player["tokens_placed_this_round"] += 1
        advance_placement_turn(game)
        return True, "Blessing placed", game

    # ANY token type can be placed in province center or on a border
    # Players can bluff by placing any token anywhere (server validates at resolution)

    if target_type == "blessing":
        # Handled above - this shouldn't be reached
        return False, "Blessing must target a placed token", game

    if target_type == "province":
        if target_id not in game["provinces"]:
            return False, f"Invalid province: {target_id}", game

        combat_token = {
            "id": token["id"],
            "type": token["type"],
            "strength": token["strength"],
            "player_index": player_idx,
            "face_up": False,
            "blessing": None,
        }
        game["provinces"][target_id]["combat_tokens"].append(combat_token)
        player["hand"].remove(token)
        player["tokens_placed_this_round"] += 1
        advance_placement_turn(game)
        return True, f"Token placed in {target_id}", game

    elif target_type == "border":
        if target_id not in game["borders"]:
            return False, f"Invalid border: {target_id}", game
        border = game["borders"][target_id]
        if border["combat_token"] is not None:
            return False, "Border already occupied", game

        combat_token = {
            "id": token["id"],
            "type": token["type"],
            "strength": token["strength"],
            "player_index": player_idx,
            "face_up": False,
            "blessing": None,
        }
        border["combat_token"] = combat_token
        player["hand"].remove(token)
        player["tokens_placed_this_round"] += 1
        advance_placement_turn(game)
        return True, f"Token placed on border {target_id}", game

    return False, "Invalid target type", game


def advance_placement_turn(game):
    """Advance to next player in placement phase."""
    player_count = len(game["players"])

    # Check if all players have 1 token left (5 placed)
    all_done = all(len(p["hand"]) <= 1 for p in game["players"])
    if all_done:
        game["phase"] = "resolution"
        game["resolution_revealed"] = False
        game["resolution_step"] = 0
        game["log"].append("Placement complete. Resolution phase begins.")
        return

    # Find next player who can still place
    for _ in range(player_count):
        game["current_turn_index"] = (game["current_turn_index"] + 1) % player_count
        if len(game["players"][game["current_turn_index"]]["hand"]) > 1:
            return


def process_proceed(game, player_idx):
    """Host proceeds to next step."""
    player = game["players"][player_idx]
    if player["user_id"] != game["host_user_id"]:
        return False, "Only host can proceed", game

    if game["phase"] == "resolution":
        if not game["resolution_revealed"]:
            # Step 1: Reveal all tokens
            reveal_all_tokens(game)
            game["resolution_revealed"] = True
            game["log"].append("All combat tokens revealed!")
            return True, "Tokens revealed", game
        elif game["resolution_step"] == 0:
            # Step 2: Resolve battles
            resolve_battles(game)
            game["resolution_step"] = 1
            game["log"].append("Battles resolved!")
            return True, "Battles resolved", game
        elif game["resolution_step"] == 1:
            # Step 3: Check territory claims + advance round
            check_territory_claims(game)
            next_round = game["round"] + 1
            if next_round > 5:
                end_game(game)
                return True, "Game over!", game
            start_round(game, next_round)
            return True, f"Round {next_round} begins!", game

    return False, "Cannot proceed at this time", game


def process_pass_territory(game, player_idx):
    game["players"][player_idx]["passed_territory_card"] = True
    if all(p["passed_territory_card"] for p in game["players"]):
        game["phase"] = "placement"
        game["log"].append("All players passed. Placement phase begins.")
    else:
        advance_upkeep_turn(game)
    return True, "Passed", game


def advance_upkeep_turn(game):
    player_count = len(game["players"])
    for _ in range(player_count):
        game["current_turn_index"] = (game["current_turn_index"] + 1) % player_count
        if not game["players"][game["current_turn_index"]]["passed_territory_card"]:
            return
    game["phase"] = "placement"


def reveal_all_tokens(game):
    """Reveal all face-down combat tokens."""
    for prov_id, prov in game["provinces"].items():
        for ct in prov["combat_tokens"]:
            ct["face_up"] = True
            # Discard bluffs
    for border_id, border in game["borders"].items():
        if border["combat_token"]:
            border["combat_token"]["face_up"] = True


def resolve_battles(game):
    """Resolve all battles simultaneously."""
    # Step 1: Remove bluffs (except Lion's bluff which acts as +2 defense)
    remove_bluffs(game)

    # Step 2: Remove illegal tokens
    remove_illegal_tokens(game)

    # Step 3: Resolve raids
    resolve_raids(game)

    # Step 4: Resolve diplomacy
    resolve_diplomacy(game)

    # Step 5: Resolve all battles
    resolve_all_province_battles(game)

    # Step 6: Clean up all combat tokens
    cleanup_combat_tokens(game)


def remove_bluffs(game):
    """Remove bluff tokens. Lion's bluff has +2 defense and stays when defending."""
    for prov_id, prov in game["provinces"].items():
        new_tokens = []
        for ct in prov["combat_tokens"]:
            if ct["type"] == "bluff":
                # Lion ability: bluff stays as +2 defense when placed in controlled province
                is_lion = ct["player_index"] < len(game["players"]) and game["players"][ct["player_index"]].get("clan") == "lion"
                is_defending = prov["controlled_by"] == ct["player_index"]
                if is_lion and is_defending:
                    ct["strength"] = 2  # Lion bluff = +2 defense
                    new_tokens.append(ct)
                    continue
                # Normal bluff: discard
                continue
            new_tokens.append(ct)
        prov["combat_tokens"] = new_tokens
    for border_id, border in game["borders"].items():
        if border["combat_token"] and border["combat_token"]["type"] == "bluff":
            border["combat_token"] = None


def remove_illegal_tokens(game):
    """Remove illegally placed tokens."""
    # Blessing on raid/diplomacy/bluff is illegal
    for prov_id, prov in game["provinces"].items():
        valid = []
        for ct in prov["combat_tokens"]:
            if ct.get("blessing") and ct["type"] in ("raid", "diplomacy", "bluff"):
                continue  # illegal - remove entire stack
            valid.append(ct)
        prov["combat_tokens"] = valid

    for border_id, border in game["borders"].items():
        ct = border["combat_token"]
        if ct and ct.get("blessing") and ct["type"] in ("raid", "diplomacy", "bluff"):
            border["combat_token"] = None
        # Shinobi on border is illegal
        if ct and ct["type"] == "shinobi":
            border["combat_token"] = None


def resolve_raids(game):
    """Resolve raid tokens."""
    for prov_id, prov in game["provinces"].items():
        raids = [ct for ct in prov["combat_tokens"] if ct["type"] == "raid"]
        for raid in raids:
            pi = raid["player_index"]
            # Raid is valid if adjacent to a controlled province OR shinobi in same province
            has_adjacency = False
            for adj_id in ADJACENCY.get(prov_id, set()):
                adj_prov = game["provinces"].get(adj_id)
                if adj_prov and adj_prov["controlled_by"] == pi:
                    has_adjacency = True
                    break
            has_shinobi = any(
                ct["type"] == "shinobi" and ct["player_index"] == pi
                for ct in prov["combat_tokens"] if ct["id"] != raid["id"]
            )
            if has_adjacency or has_shinobi:
                # Raid succeeds: remove all tokens, scorched earth
                prov["combat_tokens"] = []
                prov["control_tokens"] = []
                prov["controlled_by"] = None
                prov["special_token"] = "scorched_earth"
                # Remove border tokens too
                for b in BORDERS:
                    if prov_id in b["provinces"]:
                        game["borders"][b["id"]]["combat_token"] = None
                game["log"].append(f"Raid successful in {prov_id}! Scorched earth placed.")
                break


def resolve_diplomacy(game):
    """Resolve diplomacy tokens."""
    for prov_id, prov in game["provinces"].items():
        diplo = [ct for ct in prov["combat_tokens"] if ct["type"] == "diplomacy"]
        for d in diplo:
            if prov["controlled_by"] == d["player_index"]:
                # Valid diplomacy: remove all combat tokens, place peace
                prov["combat_tokens"] = []
                prov["special_token"] = "peace"
                for b in BORDERS:
                    if prov_id in b["provinces"]:
                        game["borders"][b["id"]]["combat_token"] = None
                game["log"].append(f"Diplomacy in {prov_id}. Peace token placed.")
                break


def resolve_all_province_battles(game):
    """Resolve battles for all provinces."""
    for prov_id, prov in game["provinces"].items():
        if prov.get("special_token") in ("peace", "scorched_earth"):
            continue

        # Collect attackers from borders
        attackers = {}  # player_index -> total_strength
        for b in BORDERS:
            if prov_id in b["provinces"]:
                bt = game["borders"][b["id"]]["combat_token"]
                if bt and bt["type"] in ("army", "navy"):
                    # Determine if attacking this province
                    other_provinces = [p for p in b["provinces"] if p != prov_id and p != "sea"]
                    other_province = other_provinces[0] if other_provinces else None
                    
                    if other_province:
                        # Token on border between other_province and this province
                        # It's an attack if the player controls the other province
                        other_prov = game["provinces"].get(other_province)
                        if other_prov and other_prov["controlled_by"] == bt["player_index"]:
                            strength = bt["strength"]
                            if bt.get("blessing"):
                                strength += bt["blessing"]["strength"]
                            attackers[bt["player_index"]] = attackers.get(bt["player_index"], 0) + strength
                    elif b["type"] == "sea":
                        # Sea attack
                        if bt["type"] == "navy":
                            strength = bt["strength"]
                            if bt.get("blessing"):
                                strength += bt["blessing"]["strength"]
                            attackers[bt["player_index"]] = attackers.get(bt["player_index"], 0) + strength

        # Collect shinobi attackers in province
        for ct in prov["combat_tokens"]:
            if ct["type"] == "shinobi" and ct["player_index"] != prov.get("controlled_by"):
                strength = ct["strength"]
                if ct.get("blessing"):
                    strength += ct["blessing"]["strength"]
                attackers[ct["player_index"]] = attackers.get(ct["player_index"], 0) + strength

        if not attackers:
            # No attackers - check for successful defense (defender placed tokens but no attack)
            defender_idx = prov.get("controlled_by")
            if defender_idx is not None:
                has_defense = any(
                    ct["type"] in ("army", "navy", "shinobi") and ct["player_index"] == defender_idx
                    for ct in prov["combat_tokens"]
                )
                if has_defense:
                    # Successful defense - add faceup control token
                    prov["control_tokens"].append({"face_up": True, "player_index": defender_idx})
                    game["players"][defender_idx]["control_tokens_placed"] += 1
            continue

        # Calculate defender strength
        defender_idx = prov.get("controlled_by")
        defender_strength = 0

        # Province base defense (Phoenix ignores capital defense)
        prov_data = PROVINCE_MAP.get(prov_id, {})
        if prov_data.get("isCapital"):
            # Check if any attacker is Phoenix - they ignore capital base defense
            any_phoenix_attacker = any(
                pi < len(game["players"]) and game["players"][pi].get("clan") == "phoenix"
                for pi in attackers.keys()
            )
            if not any_phoenix_attacker:
                defender_strength += prov_data.get("baseDefense", 0)
            else:
                game["log"].append(f"Phoenix ignores capital defense in {prov_id}!")

        # Defense from face-up control tokens (+1 each, +2 for Crab)
        for ct in prov["control_tokens"]:
            if ct["face_up"]:
                # Check if Crab ability
                if ct["player_index"] < len(game["players"]):
                    if game["players"][ct["player_index"]].get("clan") == "crab":
                        defender_strength += 2
                    else:
                        defender_strength += 1
                else:
                    defender_strength += 1

        # Defense bonus tokens
        for bt in prov.get("bonus_tokens", []):
            if bt.get("type") == "defense":
                defender_strength += bt.get("value", 0)

        # Defensive combat tokens
        if defender_idx is not None:
            for ct in prov["combat_tokens"]:
                if ct["player_index"] == defender_idx and ct["type"] in ("army", "navy", "shinobi"):
                    strength = ct["strength"]
                    if ct.get("blessing"):
                        strength += ct["blessing"]["strength"]
                    defender_strength += strength

        # Find strongest attacker
        if not attackers:
            continue

        max_attack = max(attackers.values())
        max_attackers = [pi for pi, s in attackers.items() if s == max_attack]

        if len(max_attackers) > 1:
            # Tie among attackers - defender wins
            if defender_idx is not None:
                prov["control_tokens"].append({"face_up": True, "player_index": defender_idx})
                game["players"][defender_idx]["control_tokens_placed"] += 1
                game["log"].append(f"Battle in {prov_id}: Attacker tie, defender wins!")
            continue

        attacker_idx = max_attackers[0]
        attacker_strength = max_attack

        # Crane ability: ties go to Crane (if Crane is attacking)
        crane_attacking = False
        if attacker_idx < len(game["players"]) and game["players"][attacker_idx].get("clan") == "crane":
            crane_attacking = True

        if attacker_strength > defender_strength or (crane_attacking and attacker_strength == defender_strength):
            # Attacker wins
            prov["control_tokens"] = []
            prov["controlled_by"] = attacker_idx
            prov["control_tokens"].append({"face_up": False, "player_index": attacker_idx})
            game["players"][attacker_idx]["control_tokens_placed"] += 1
            if defender_idx is not None:
                game["log"].append(f"Battle in {prov_id}: {game['players'][attacker_idx]['clan']} conquers from {game['players'][defender_idx]['clan']}!")
            else:
                game["log"].append(f"Battle in {prov_id}: {game['players'][attacker_idx]['clan']} claims empty province!")
        else:
            # Defender wins (ties go to defender)
            if defender_idx is not None:
                prov["control_tokens"].append({"face_up": True, "player_index": defender_idx})
                game["players"][defender_idx]["control_tokens_placed"] += 1
                game["log"].append(f"Battle in {prov_id}: Defender {game['players'][defender_idx]['clan']} holds!")


def cleanup_combat_tokens(game):
    """Remove all combat tokens from the board."""
    for prov_id, prov in game["provinces"].items():
        # Move to discard
        for ct in prov["combat_tokens"]:
            if ct["player_index"] < len(game["players"]):
                game["players"][ct["player_index"]]["discard_pile"].append({
                    "id": ct["id"], "type": ct["type"], "strength": ct["strength"]
                })
        prov["combat_tokens"] = []
    for border_id, border in game["borders"].items():
        if border["combat_token"]:
            ct = border["combat_token"]
            if ct["player_index"] < len(game["players"]):
                game["players"][ct["player_index"]]["discard_pile"].append({
                    "id": ct["id"], "type": ct["type"], "strength": ct["strength"]
                })
            border["combat_token"] = None


def check_territory_claims(game):
    """Check if any player controls entire territories."""
    for t in TERRITORIES:
        tid = t["id"]
        if tid == "shadowland":
            # Handle shadowlands separately
            for sub_tid in ["shadowland_bottom", "shadowland_top"]:
                prov_ids = [sub_tid]
                controller = check_single_territory(game, prov_ids)
                if controller is not None and sub_tid in game["territories"]:
                    game["territories"][sub_tid]["card_owner"] = controller
                elif sub_tid in game["territories"]:
                    terr = game["territories"][sub_tid]
                    if terr["card_owner"] is not None and not terr["card_used"]:
                        # Check if owner still controls
                        current = check_single_territory(game, prov_ids)
                        if current != terr["card_owner"]:
                            terr["card_owner"] = current
        else:
            prov_ids = get_provinces_for_territory(tid)
            valid_provs = [pid for pid in prov_ids if game["provinces"].get(pid, {}).get("special_token") != "scorched_earth"]
            controller = check_single_territory(game, valid_provs)
            if tid in game["territories"]:
                old_owner = game["territories"][tid]["card_owner"]
                game["territories"][tid]["card_owner"] = controller
                if controller is not None and controller != old_owner:
                    game["log"].append(f"{game['players'][controller]['clan']} claims {tid} territory!")


def check_single_territory(game, prov_ids):
    """Check if one player controls all given provinces."""
    if not prov_ids:
        return None
    controllers = set()
    for pid in prov_ids:
        prov = game["provinces"].get(pid)
        if not prov or prov["controlled_by"] is None:
            return None
        controllers.add(prov["controlled_by"])
    if len(controllers) == 1:
        return controllers.pop()
    return None


def end_game(game):
    """Calculate final scores and end the game."""
    game["status"] = "finished"
    game["phase"] = "finished"

    scores = []
    for i, player in enumerate(game["players"]):
        honor = 0

        # Flowers in controlled provinces
        for prov_id, prov in game["provinces"].items():
            if prov["controlled_by"] == i:
                prov_data = PROVINCE_MAP.get(prov_id, {})
                honor += prov_data.get("flowers", 0)
                # Bonus token flowers/honor
                for bt in prov.get("bonus_tokens", []):
                    if bt.get("type") == "honor":
                        honor += bt.get("value", 0)

        # Face-up control tokens (not in shadowlands)
        for prov_id, prov in game["provinces"].items():
            prov_data = PROVINCE_MAP.get(prov_id, {})
            if prov_data.get("territoryId") != "shadowland":
                for ct in prov["control_tokens"]:
                    if ct["face_up"] and ct["player_index"] == i:
                        honor += 1

        # Territory bonuses (+5 each, excluding shadowlands)
        for tid, terr in game["territories"].items():
            t_data = TERRITORY_MAP.get(tid)
            if t_data and t_data.get("type") != "shadowlands" and terr["card_owner"] == i:
                honor += 5

        # Secret objective
        obj_honor = check_secret_objective(game, i)
        honor += obj_honor

        scores.append({
            "player_index": i,
            "clan": player["clan"],
            "username": player["username"],
            "honor": honor,
            "objective_honor": obj_honor,
        })

    # Sort by honor descending
    scores.sort(key=lambda x: x["honor"], reverse=True)
    game["scores"] = scores
    game["log"].append("Game over! Final scores calculated.")


def check_secret_objective(game, player_idx):
    """Check if player's secret objective is met."""
    player = game["players"][player_idx]
    obj_id = player.get("secret_objective")
    if not obj_id:
        return 0

    obj = next((o for o in SECRET_OBJECTIVES if o["id"] == obj_id), None)
    if not obj:
        return 0

    check = obj["check"]
    controlled_provinces = [pid for pid, prov in game["provinces"].items() if prov["controlled_by"] == player_idx]

    if check["type"] == "clan_territory":
        clan = check["clan"]
        capital = check["capital"]
        territory_provs = get_provinces_for_territory(clan)
        controlled_in_territory = [pid for pid in territory_provs if pid in controlled_provinces]
        if capital in controlled_provinces or len(controlled_in_territory) >= check["provinces_needed"]:
            return obj["honor"]

    elif check["type"] == "fewest_provinces":
        my_count = len(controlled_provinces)
        for i, p in enumerate(game["players"]):
            if i != player_idx:
                other_count = sum(1 for pid, prov in game["provinces"].items() if prov["controlled_by"] == i)
                if other_count < my_count:
                    return 0
        return obj["honor"]

    elif check["type"] == "shadowlands":
        if "shadowland_bottom" in controlled_provinces and "shadowland_top" in controlled_provinces:
            return obj["honor"]

    elif check["type"] == "territory_count":
        territories_with_control = set()
        for pid in controlled_provinces:
            prov_data = PROVINCE_MAP.get(pid)
            if prov_data:
                territories_with_control.add(prov_data["territoryId"])
        if len(territories_with_control) >= check["count"]:
            return obj["honor"]

    elif check["type"] == "coastal_provinces":
        coastal_controlled = [pid for pid in controlled_provinces if PROVINCE_MAP.get(pid, {}).get("isCoastal")]
        if len(coastal_controlled) >= check["count"]:
            return obj["honor"]

    elif check["type"] == "consecutive_provinces":
        # Check for 6 consecutively adjacent provinces spanning 3 territories
        if check_consecutive_provinces(game, player_idx, check["count"], check["territories_needed"]):
            return obj["honor"]

    return 0


def check_consecutive_provinces(game, player_idx, count, territories_needed):
    """Check for consecutively adjacent provinces spanning multiple territories."""
    controlled = set(pid for pid, prov in game["provinces"].items() if prov["controlled_by"] == player_idx)

    def dfs(current, visited, territories):
        if len(visited) >= count and len(territories) >= territories_needed:
            return True
        for neighbor in ADJACENCY.get(current, set()):
            if neighbor in controlled and neighbor not in visited:
                prov_data = PROVINCE_MAP.get(neighbor, {})
                new_territories = territories | {prov_data.get("territoryId")}
                if dfs(neighbor, visited | {neighbor}, new_territories):
                    return True
        return False

    for start_pid in controlled:
        prov_data = PROVINCE_MAP.get(start_pid, {})
        if dfs(start_pid, {start_pid}, {prov_data.get("territoryId")}):
            return True
    return False


def get_player_view(game, user_id, is_spectator=False):
    """Get filtered game state for a specific player."""
    view = {
        "game_id": game["game_id"],
        "room_id": game["room_id"],
        "status": game["status"],
        "round": game["round"],
        "phase": game["phase"],
        "first_player_index": game["first_player_index"],
        "current_turn_index": game["current_turn_index"],
        "host_user_id": game["host_user_id"],
        "resolution_revealed": game.get("resolution_revealed", False),
        "resolution_step": game.get("resolution_step", 0),
        "log": game.get("log", [])[-20:],  # last 20 log entries
        "scores": game.get("scores"),
        "position_overrides": game.get("position_overrides", {}),
        "scout_result": game.get("_scout_result") if game.get("_scout_result", {}).get("player_index") == (get_player_index(game, user_id) if not is_spectator else -1) else None,
        "shugenja_result": game.get("_shugenja_result"),
        "scorpion_result": game.get("_scorpion_result") if game.get("_scorpion_result", {}).get("player_index") == (get_player_index(game, user_id) if not is_spectator else -1) else None,
    }

    player_idx = get_player_index(game, user_id) if not is_spectator else -1

    # Players info (hide hands of others)
    view_players = []
    for i, p in enumerate(game["players"]):
        player_view = {
            "user_id": p["user_id"],
            "username": p["username"],
            "clan": p["clan"],
            "color": p["color"],
            "hand_count": len(p["hand"]),
            "token_pool_count": len(p["token_pool"]),
            "discard_count": len(p["discard_pile"]),
            "control_tokens_placed": p["control_tokens_placed"],
            "setup_tokens_remaining": p.get("setup_tokens_remaining", 0),
            "scout_cards": p["scout_cards"],
            "shugenja_cards": p["shugenja_cards"],
            "is_ronin": p["is_ronin"],
            "tokens_placed_this_round": p["tokens_placed_this_round"],
            "territory_cards": [],
            "scorpion_ability_used": p.get("scorpion_ability_used", False),
            "dragon_must_return": p.get("dragon_must_return", False),
        }

        # Show hand only to the player themselves
        if i == player_idx:
            player_view["hand"] = p["hand"]
            player_view["secret_objective"] = p["secret_objective"]
            player_view["secret_objective_options"] = p.get("secret_objective_options", [])
            player_view["territory_cards"] = p.get("territory_cards", [])
        else:
            player_view["hand"] = None
            player_view["secret_objective"] = None

        # Count controlled provinces and honor
        controlled = sum(1 for prov in game["provinces"].values() if prov["controlled_by"] == i)
        player_view["provinces_controlled"] = controlled

        # Calculate live honor
        honor = 0
        for prov_id, prov in game["provinces"].items():
            if prov["controlled_by"] == i:
                prov_data = PROVINCE_MAP.get(prov_id, {})
                honor += prov_data.get("flowers", 0)
        for prov_id, prov in game["provinces"].items():
            prov_data = PROVINCE_MAP.get(prov_id, {})
            if prov_data.get("territoryId") != "shadowland":
                for ct in prov["control_tokens"]:
                    if ct["face_up"] and ct["player_index"] == i:
                        honor += 1
        # Territory bonuses
        for tid, terr in game["territories"].items():
            t_data = TERRITORY_MAP.get(tid)
            if t_data and t_data.get("type") != "shadowlands" and terr.get("card_owner") == i:
                honor += 5
        player_view["live_honor"] = honor

        view_players.append(player_view)

    view["players"] = view_players

    # Provinces (show combat tokens face-down to non-owners during placement)
    view_provinces = {}
    for prov_id, prov in game["provinces"].items():
        view_prov = {
            "controlled_by": prov["controlled_by"],
            "control_tokens": prov["control_tokens"],
            "special_token": prov["special_token"],
            "bonus_tokens": prov.get("bonus_tokens", []),
            "combat_tokens": [],
        }
        for ct in prov["combat_tokens"]:
            if ct.get("face_up") or game["phase"] == "resolution":
                view_prov["combat_tokens"].append(ct)
            elif ct["player_index"] == player_idx:
                # Show own tokens
                view_prov["combat_tokens"].append(ct)
            else:
                # Hide other players' tokens
                view_prov["combat_tokens"].append({
                    "id": "hidden",
                    "type": "hidden",
                    "strength": 0,
                    "player_index": ct["player_index"],
                    "face_up": False,
                    "blessing": None,
                })
        view_provinces[prov_id] = view_prov
    view["provinces"] = view_provinces

    # Borders
    view_borders = {}
    for border_id, border in game["borders"].items():
        bt = border["combat_token"]
        if bt is None:
            view_borders[border_id] = {"combat_token": None}
        elif bt.get("face_up") or game["phase"] == "resolution":
            view_borders[border_id] = {"combat_token": bt}
        elif bt["player_index"] == player_idx:
            view_borders[border_id] = {"combat_token": bt}
        else:
            view_borders[border_id] = {"combat_token": {
                "id": "hidden",
                "type": "hidden",
                "strength": 0,
                "player_index": bt["player_index"],
                "face_up": False,
                "blessing": None,
            }}
    view["borders"] = view_borders

    # Territories (hide card content from non-owners)
    view_territories = {}
    for tid, terr in game["territories"].items():
        view_terr = {
            "card_owner": terr["card_owner"],
            "card_used": terr["card_used"],
        }
        # Show card details only to owner
        if terr["card_owner"] == player_idx and terr["card"]:
            view_terr["card"] = terr["card"]
        elif terr["card_used"] and terr["card"]:
            view_terr["card"] = {"name": terr["card"]["name"], "description": terr["card"]["description"]}
        else:
            view_terr["card"] = {"name": "Hidden", "description": "Territory card content is hidden."}
        view_territories[tid] = view_terr
    view["territories"] = view_territories

    return view


# ===== Phase 2: Scout, Shugenja, Clan Abilities, Territory Cards =====

def process_use_scout(game, player_idx, action):
    """Scout: Look at one opponent's combat token on the board."""
    if game["phase"] != "placement":
        return False, "Can only use Scout during placement", game
    if player_idx != game["current_turn_index"]:
        return False, "Not your turn", game
    player = game["players"][player_idx]
    if player["scout_cards"] <= 0:
        return False, "No Scout cards remaining", game

    target_location = action.get("target_location")  # "province" or "border"
    target_id = action.get("target_id")
    target_token_idx = action.get("target_token_idx", 0)

    token_info = None
    if target_location == "province" and target_id in game["provinces"]:
        tokens = game["provinces"][target_id]["combat_tokens"]
        for ct in tokens:
            if ct["player_index"] != player_idx and not ct.get("face_up"):
                token_info = {"type": ct["type"], "strength": ct["strength"],
                              "player_index": ct["player_index"], "location": "province", "province_id": target_id}
                break
    elif target_location == "border" and target_id in game["borders"]:
        bt = game["borders"][target_id]["combat_token"]
        if bt and bt["player_index"] != player_idx and not bt.get("face_up"):
            token_info = {"type": bt["type"], "strength": bt["strength"],
                          "player_index": bt["player_index"], "location": "border", "border_id": target_id}

    if not token_info:
        return False, "No valid hidden opponent token at that location", game

    player["scout_cards"] -= 1
    clan_name = game["players"][player_idx]["clan"]
    game["log"].append(f"{clan_name} used Scout to peek at a token.")

    # Return the peeked token info - only the acting player sees this via action_result
    game["_scout_result"] = {"player_index": player_idx, "token": token_info}
    return True, f"Scout used|{json.dumps(token_info)}", game


def process_use_shugenja(game, player_idx, action):
    """Shugenja: Reveal and discard one opponent's combat token."""
    if game["phase"] != "placement":
        return False, "Can only use Shugenja during placement", game
    if player_idx != game["current_turn_index"]:
        return False, "Not your turn", game
    player = game["players"][player_idx]
    if player["shugenja_cards"] <= 0:
        return False, "No Shugenja cards remaining", game

    target_location = action.get("target_location")
    target_id = action.get("target_id")

    removed_token = None
    if target_location == "province" and target_id in game["provinces"]:
        tokens = game["provinces"][target_id]["combat_tokens"]
        for i, ct in enumerate(tokens):
            if ct["player_index"] != player_idx and not ct.get("face_up"):
                # Check blessing protection
                if ct.get("blessing"):
                    continue
                removed_token = tokens.pop(i)
                # Return to owner's discard
                owner_idx = removed_token["player_index"]
                game["players"][owner_idx]["discard_pile"].append({
                    "id": removed_token["id"], "type": removed_token["type"], "strength": removed_token["strength"]
                })
                break
    elif target_location == "border" and target_id in game["borders"]:
        bt = game["borders"][target_id]["combat_token"]
        if bt and bt["player_index"] != player_idx and not bt.get("face_up"):
            if not bt.get("blessing"):
                removed_token = bt
                game["borders"][target_id]["combat_token"] = None
                owner_idx = removed_token["player_index"]
                game["players"][owner_idx]["discard_pile"].append({
                    "id": removed_token["id"], "type": removed_token["type"], "strength": removed_token["strength"]
                })

    if not removed_token:
        return False, "No valid target token (may be blessed)", game

    player["shugenja_cards"] -= 1
    clan_name = game["players"][player_idx]["clan"]
    victim_clan = game["players"][removed_token["player_index"]]["clan"]
    game["log"].append(f"{clan_name} used Shugenja! Revealed and discarded {victim_clan}'s {removed_token['type']} {removed_token['strength']}.")

    # All players see the revealed token
    game["_shugenja_result"] = {
        "actor": player_idx,
        "token": {"type": removed_token["type"], "strength": removed_token["strength"],
                  "player_index": removed_token["player_index"]},
        "location": target_location, "target_id": target_id,
    }
    return True, "Shugenja used", game


def process_scorpion_ability(game, player_idx, action):
    """Scorpion: Once per round, look at one token after placing."""
    player = game["players"][player_idx]
    if player["clan"] != "scorpion":
        return False, "Only Scorpion can use this ability", game
    if game["phase"] != "placement":
        return False, "Can only use during placement", game
    if player.get("scorpion_ability_used"):
        return False, "Already used Scorpion ability this round", game

    target_location = action.get("target_location")
    target_id = action.get("target_id")

    token_info = None
    if target_location == "province" and target_id in game["provinces"]:
        for ct in game["provinces"][target_id]["combat_tokens"]:
            if ct["player_index"] != player_idx and not ct.get("face_up"):
                token_info = {"type": ct["type"], "strength": ct["strength"],
                              "player_index": ct["player_index"]}
                break
    elif target_location == "border" and target_id in game["borders"]:
        bt = game["borders"][target_id]["combat_token"]
        if bt and bt["player_index"] != player_idx and not bt.get("face_up"):
            token_info = {"type": bt["type"], "strength": bt["strength"],
                          "player_index": bt["player_index"]}

    if not token_info:
        return False, "No valid hidden opponent token found", game

    player["scorpion_ability_used"] = True
    game["log"].append(f"Scorpion used spy ability to peek at a token.")
    game["_scorpion_result"] = {"player_index": player_idx, "token": token_info}
    return True, f"Scorpion spy|{json.dumps(token_info)}", game


def process_unicorn_ability(game, player_idx, action):
    """Unicorn: Before reveal, switch two of their placed combat tokens."""
    player = game["players"][player_idx]
    if player["clan"] != "unicorn":
        return False, "Only Unicorn can use this ability", game
    if game["phase"] != "resolution" or game.get("resolution_revealed"):
        return False, "Can only use before tokens are revealed", game

    # Get two locations to swap
    loc1 = action.get("location1")  # {type: "province"|"border", id: "..."}
    loc2 = action.get("location2")

    token1 = _extract_unicorn_token(game, player_idx, loc1)
    token2 = _extract_unicorn_token(game, player_idx, loc2)

    if not token1 or not token2:
        return False, "Could not find your tokens at those locations", game

    # Place them swapped
    _place_unicorn_token(game, token2, loc1)
    _place_unicorn_token(game, token1, loc2)

    game["log"].append(f"Unicorn swapped two combat tokens.")
    return True, "Tokens swapped", game


def _extract_unicorn_token(game, player_idx, loc):
    if not loc:
        return None
    if loc["type"] == "province" and loc["id"] in game["provinces"]:
        tokens = game["provinces"][loc["id"]]["combat_tokens"]
        for i, ct in enumerate(tokens):
            if ct["player_index"] == player_idx:
                return tokens.pop(i)
    elif loc["type"] == "border" and loc["id"] in game["borders"]:
        bt = game["borders"][loc["id"]]["combat_token"]
        if bt and bt["player_index"] == player_idx:
            game["borders"][loc["id"]]["combat_token"] = None
            return bt
    return None


def _place_unicorn_token(game, token, loc):
    if loc["type"] == "province":
        game["provinces"][loc["id"]]["combat_tokens"].append(token)
    elif loc["type"] == "border":
        game["borders"][loc["id"]]["combat_token"] = token


def process_play_territory_card(game, player_idx, action):
    """Play a territory card during upkeep (non-shadowlands) or placement (shadowlands)."""
    player = game["players"][player_idx]
    territory_id = action.get("territory_id")

    if territory_id not in game["territories"]:
        return False, "Invalid territory", game

    terr = game["territories"][territory_id]
    if terr["card_owner"] != player_idx:
        return False, "You don't own this territory card", game
    if terr["card_used"]:
        return False, "Card already used", game

    is_shadowland = territory_id.startswith("shadowland")

    if is_shadowland and game["phase"] != "placement":
        return False, "Shadowlands cards can only be played during placement phase", game
    if not is_shadowland and game["phase"] not in ("upkeep", "placement"):
        return False, "Territory cards played during upkeep or placement", game

    # Mark card as used
    terr["card_used"] = True
    card = terr["card"]
    card_name = card["name"] if card else "Unknown"
    card_desc = card.get("description", "") if card else ""
    clan_name = player["clan"]
    game["log"].append(f"{clan_name} played territory card: {card_name} - {card_desc}")

    # Store for broadcast notification to all players
    game["_territory_card_played"] = {
        "player_index": player_idx,
        "clan": clan_name,
        "card_name": card_name,
        "card_description": card_desc,
        "territory_id": territory_id,
    }

    return True, f"territory_card|{card_name}|{card_desc}|{clan_name}", game


def process_edit_positions(game, player_idx, action):
    """Host edit mode: update visual positions of tokens."""
    player = game["players"][player_idx]
    if player["user_id"] != game["host_user_id"]:
        return False, "Only host can edit positions", game

    positions = action.get("positions", {})
    # Store position overrides in game state
    if "position_overrides" not in game:
        game["position_overrides"] = {}
    game["position_overrides"].update(positions)
    game["log"].append("Host adjusted token positions.")
    return True, "Positions updated", game


import json  # needed for scout result serialization


def process_dragon_return(game, player_idx, action):
    """Dragon must return 1 non-bluff token to pool after drawing extra."""
    player = game["players"][player_idx]
    if player["clan"] != "dragon":
        return False, "Only Dragon can use this", game
    if not player.get("dragon_must_return"):
        return False, "No token needs to be returned", game

    token_id = action.get("token_id")
    token = None
    for t in player["hand"]:
        if t["id"] == token_id and t["type"] != "bluff":
            token = t
            break
    if not token:
        return False, "Invalid token (cannot return bluff)", game

    player["hand"].remove(token)
    player["token_pool"].append(token)
    player["dragon_must_return"] = False
    game["log"].append(f"Dragon returned a token to pool.")
    return True, "Token returned to pool", game


# ===== Admin/Host Actions =====

def process_admin_skip_turn(game, player_idx):
    """Host skips current player's turn."""
    if game["players"][player_idx]["user_id"] != game["host_user_id"]:
        return False, "Only host can skip turns", game

    current = game["current_turn_index"]
    clan_name = game["players"][current]["clan"]

    if game["phase"] == "placement":
        # Place nothing, advance turn
        advance_placement_turn(game)
        game["log"].append(f"Host skipped {clan_name}'s turn.")
        return True, f"Skipped {clan_name}'s turn", game
    elif game["phase"] == "setup":
        advance_setup_turn(game)
        game["log"].append(f"Host skipped {clan_name}'s setup turn.")
        return True, f"Skipped {clan_name}'s setup turn", game
    elif game["phase"] == "upkeep":
        game["players"][current]["passed_territory_card"] = True
        if all(p["passed_territory_card"] for p in game["players"]):
            game["phase"] = "placement"
            game["log"].append("All players passed. Placement begins.")
        else:
            advance_upkeep_turn(game)
        game["log"].append(f"Host skipped {clan_name}'s upkeep turn.")
        return True, f"Skipped {clan_name}'s upkeep turn", game

    return False, "Cannot skip turn in current phase", game


def process_admin_end_game(game, player_idx):
    """Host forces game to end immediately with current scores."""
    if game["players"][player_idx]["user_id"] != game["host_user_id"]:
        return False, "Only host can end the game", game
    end_game(game)
    game["log"].append("Host ended the game early.")
    return True, "Game ended by host", game


def process_admin_force_proceed(game, player_idx):
    """Host forces game to proceed to next phase regardless of state."""
    if game["players"][player_idx]["user_id"] != game["host_user_id"]:
        return False, "Only host can force proceed", game

    if game["phase"] == "upkeep":
        game["phase"] = "placement"
        for p in game["players"]:
            p["passed_territory_card"] = True
        game["log"].append("Host forced transition to placement phase.")
        return True, "Forced to placement phase", game
    elif game["phase"] == "placement":
        game["phase"] = "resolution"
        game["resolution_revealed"] = False
        game["resolution_step"] = 0
        game["log"].append("Host forced transition to resolution phase.")
        return True, "Forced to resolution phase", game
    elif game["phase"] == "resolution":
        return process_proceed(game, player_idx)

    return False, "Cannot force proceed in current state", game
