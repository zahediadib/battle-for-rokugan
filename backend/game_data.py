"""Battle for Rokugan - Game Data Constants"""

CLAN_COLORS = {
    "crab": "Gray",
    "crane": "Blue",
    "dragon": "Green",
    "lion": "Yellow",
    "phoenix": "Orange",
    "scorpion": "Red",
    "unicorn": "Purple",
}

CLAN_LIST = ["crab", "crane", "dragon", "lion", "phoenix", "scorpion", "unicorn"]

SETUP_TOKENS_BY_PLAYER_COUNT = {2: 11, 3: 7, 4: 5, 5: 4}

DEFAULT_COMBAT_TOKENS = {
    "army": {1: 6, 2: 4, 3: 3, 4: 2, 5: 1},
    "navy": {1: 2, 2: 1},
    "shinobi": {1: 1, 2: 1},
    "diplomacy": {1: 1},
    "raid": {1: 1},
    "blessing": {2: 2},
}

CLAN_EXTRA_TOKENS = {
    "crane": {"diplomacy": {1: 1}},
    "crab": {"navy": {3: 1}},
    "dragon": {"blessing": {3: 1}},
    "phoenix": {"blessing": {3: 1}},
    "unicorn": {"raid": {1: 1}},
    "scorpion": {"shinobi": {3: 1}},
    "lion": {"army": {6: 1}},
}

PROVINCES = [
    {"id": "shadowland_bottom", "territoryId": "shadowland", "center": {"x": 672, "y": 342}, "isCoastal": True, "baseDefense": 1, "flowers": 0, "isCapital": False},
    {"id": "shadowland_top", "territoryId": "shadowland", "center": {"x": 1363, "y": 180}, "isCoastal": False, "baseDefense": 1, "flowers": 0, "isCapital": False},
    {"id": "crab_1", "territoryId": "crab", "center": {"x": 2047, "y": 291}, "isCoastal": False, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "crab_2", "territoryId": "crab", "center": {"x": 1467, "y": 664}, "isCoastal": False, "baseDefense": 0, "flowers": 2, "isCapital": False},
    {"id": "crab_3", "territoryId": "crab", "center": {"x": 881, "y": 775}, "isCoastal": True, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "crab_4", "territoryId": "crab", "center": {"x": 1960, "y": 746}, "isCoastal": False, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "wind_1", "territoryId": "wind", "center": {"x": 937, "y": 990}, "isCoastal": True, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "wind_2", "territoryId": "wind", "center": {"x": 1540, "y": 1023}, "isCoastal": False, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "wind_3", "territoryId": "wind", "center": {"x": 1529, "y": 1339}, "isCoastal": True, "baseDefense": 0, "flowers": 2, "isCapital": False},
    {"id": "crane_1", "territoryId": "crane", "center": {"x": 1854, "y": 1200}, "isCoastal": True, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "crane_2", "territoryId": "crane", "center": {"x": 2075, "y": 1396}, "isCoastal": True, "baseDefense": 0, "flowers": 2, "isCapital": False},
    {"id": "crane_3", "territoryId": "crane", "center": {"x": 2307, "y": 1550}, "isCoastal": True, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "lion_1", "territoryId": "lion", "center": {"x": 2645, "y": 1589}, "isCoastal": True, "baseDefense": 0, "flowers": 2, "isCapital": False},
    {"id": "lion_2", "territoryId": "lion", "center": {"x": 2508, "y": 1294}, "isCoastal": False, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "lion_3", "territoryId": "lion", "center": {"x": 2910, "y": 956}, "isCoastal": False, "baseDefense": 0, "flowers": 2, "isCapital": False},
    {"id": "scorpion_1", "territoryId": "scorpion", "center": {"x": 2142, "y": 1081}, "isCoastal": False, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "scorpion_2", "territoryId": "scorpion", "center": {"x": 2491, "y": 924}, "isCoastal": False, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "scorpion_3", "territoryId": "scorpion", "center": {"x": 2399, "y": 554}, "isCoastal": False, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "unicorn_1", "territoryId": "unicorn", "center": {"x": 2745, "y": 332}, "isCoastal": False, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "unicorn_2", "territoryId": "unicorn", "center": {"x": 3071, "y": 446}, "isCoastal": False, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "unicorn_3", "territoryId": "unicorn", "center": {"x": 2799, "y": 696}, "isCoastal": False, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "dragon_1", "territoryId": "dragon", "center": {"x": 3341, "y": 716}, "isCoastal": False, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "dragon_2", "territoryId": "dragon", "center": {"x": 3134, "y": 1201}, "isCoastal": False, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "dragon_3", "territoryId": "dragon", "center": {"x": 2840, "y": 1330}, "isCoastal": False, "baseDefense": 0, "flowers": 3, "isCapital": False},
    {"id": "phoenix_1", "territoryId": "phoenix", "center": {"x": 3221, "y": 1851}, "isCoastal": True, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "phoenix_2", "territoryId": "phoenix", "center": {"x": 3263, "y": 1711}, "isCoastal": False, "baseDefense": 0, "flowers": 2, "isCapital": False},
    {"id": "phoenix_3", "territoryId": "phoenix", "center": {"x": 3238, "y": 1526}, "isCoastal": False, "baseDefense": 2, "flowers": 2, "isCapital": True},
    {"id": "island_1", "territoryId": "island", "center": {"x": 775, "y": 1551}, "isCoastal": True, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "island_2", "territoryId": "island", "center": {"x": 748, "y": 1807}, "isCoastal": True, "baseDefense": 0, "flowers": 1, "isCapital": False},
    {"id": "island_3", "territoryId": "island", "center": {"x": 1196, "y": 1913}, "isCoastal": True, "baseDefense": 0, "flowers": 2, "isCapital": False},
]

PROVINCE_MAP = {p["id"]: p for p in PROVINCES}

BORDERS = [
    {"id": "1", "provinces": ["shadowland_bottom", "shadowland_top"], "type": "land", "point": {"x": 1006, "y": 280}, "isUpDown": False},
    {"id": "2", "provinces": ["shadowland_top", "crab_1"], "type": "land", "point": {"x": 1774, "y": 207}, "isUpDown": False},
    {"id": "3", "provinces": ["shadowland_top", "crab_2"], "type": "land", "point": {"x": 1602, "y": 412}, "isUpDown": True},
    {"id": "4", "provinces": ["shadowland_top", "crab_3"], "type": "land", "point": {"x": 1278, "y": 432}, "isUpDown": True},
    {"id": "5", "provinces": ["shadowland_bottom", "crab_3"], "type": "land", "point": {"x": 895, "y": 531}, "isUpDown": True},
    {"id": "6", "provinces": ["crab_3", "crab_2"], "type": "land", "point": {"x": 1106, "y": 673}, "isUpDown": False},
    {"id": "7", "provinces": ["crab_3", "wind_1"], "type": "land", "point": {"x": 831, "y": 917}, "isUpDown": True},
    {"id": "8", "provinces": ["crab_2", "wind_1"], "type": "land", "point": {"x": 1091, "y": 935}, "isUpDown": True},
    {"id": "9", "provinces": ["wind_2", "wind_1"], "type": "land", "point": {"x": 1263, "y": 1016}, "isUpDown": True},
    {"id": "10", "provinces": ["wind_1", "wind_3"], "type": "land", "point": {"x": 1354, "y": 1193}, "isUpDown": False},
    {"id": "11", "provinces": ["wind_2", "wind_3"], "type": "land", "point": {"x": 1558, "y": 1212}, "isUpDown": True},
    {"id": "12", "provinces": ["crab_2", "wind_2"], "type": "land", "point": {"x": 1490, "y": 895}, "isUpDown": True},
    {"id": "13", "provinces": ["crab_4", "wind_2"], "type": "land", "point": {"x": 1708, "y": 898}, "isUpDown": True},
    {"id": "14", "provinces": ["crab_2", "crab_4"], "type": "land", "point": {"x": 1757, "y": 715}, "isUpDown": False},
    {"id": "15", "provinces": ["crab_1", "crab_2"], "type": "land", "point": {"x": 1811, "y": 541}, "isUpDown": True},
    {"id": "16", "provinces": ["crab_1", "crab_4"], "type": "land", "point": {"x": 2090, "y": 601}, "isUpDown": True},
    {"id": "17", "provinces": ["crab_1", "scorpion_3"], "type": "land", "point": {"x": 2308, "y": 413}, "isUpDown": False},
    {"id": "18", "provinces": ["crab_1", "unicorn_1"], "type": "land", "point": {"x": 2518, "y": 120}, "isUpDown": False},
    {"id": "19", "provinces": ["scorpion_3", "unicorn_1"], "type": "land", "point": {"x": 2563, "y": 436}, "isUpDown": False},
    {"id": "20", "provinces": ["crab_4", "scorpion_3"], "type": "land", "point": {"x": 2235, "y": 651}, "isUpDown": False},
    {"id": "21", "provinces": ["crab_4", "scorpion_1"], "type": "land", "point": {"x": 2135, "y": 832}, "isUpDown": True},
    {"id": "22", "provinces": ["crab_4", "crane_1"], "type": "land", "point": {"x": 1906, "y": 845}, "isUpDown": True},
    {"id": "23", "provinces": ["scorpion_3", "scorpion_1"], "type": "land", "point": {"x": 2285, "y": 769}, "isUpDown": True},
    {"id": "24", "provinces": ["scorpion_3", "scorpion_2"], "type": "land", "point": {"x": 2443, "y": 771}, "isUpDown": True},
    {"id": "25", "provinces": ["scorpion_3", "unicorn_3"], "type": "land", "point": {"x": 2559, "y": 694}, "isUpDown": False},
    {"id": "26", "provinces": ["unicorn_1", "unicorn_3"], "type": "land", "point": {"x": 2777, "y": 512}, "isUpDown": True},
    {"id": "27", "provinces": ["unicorn_1", "unicorn_2"], "type": "land", "point": {"x": 3080, "y": 247}, "isUpDown": True},
    {"id": "28", "provinces": ["unicorn_3", "unicorn_2"], "type": "land", "point": {"x": 2973, "y": 598}, "isUpDown": False},
    {"id": "29", "provinces": ["unicorn_2", "dragon_1"], "type": "land", "point": {"x": 3282, "y": 375}, "isUpDown": False},
    {"id": "30", "provinces": ["scorpion_2", "unicorn_3"], "type": "land", "point": {"x": 2662, "y": 797}, "isUpDown": False},
    {"id": "31", "provinces": ["unicorn_3", "lion_3"], "type": "land", "point": {"x": 2892, "y": 821}, "isUpDown": True},
    {"id": "32", "provinces": ["lion_3", "dragon_1"], "type": "land", "point": {"x": 3096, "y": 855}, "isUpDown": False},
    {"id": "33", "provinces": ["unicorn_2", "lion_3"], "type": "land", "point": {"x": 3070, "y": 748}, "isUpDown": True},
    {"id": "34", "provinces": ["dragon_1", "dragon_2"], "type": "land", "point": {"x": 3453, "y": 922}, "isUpDown": True},
    {"id": "35", "provinces": ["lion_3", "dragon_2"], "type": "land", "point": {"x": 3067, "y": 1018}, "isUpDown": True},
    {"id": "36", "provinces": ["dragon_2", "phoenix_3"], "type": "land", "point": {"x": 3248, "y": 1310}, "isUpDown": True},
    {"id": "37", "provinces": ["phoenix_3", "phoenix_2"], "type": "land", "point": {"x": 3431, "y": 1497}, "isUpDown": True},
    {"id": "38", "provinces": ["phoenix_2", "phoenix_1"], "type": "land", "point": {"x": 3400, "y": 1773}, "isUpDown": True},
    {"id": "39", "provinces": ["lion_1", "phoenix_2"], "type": "land", "point": {"x": 2933, "y": 1648}, "isUpDown": False},
    {"id": "40", "provinces": ["dragon_3", "phoenix_3"], "type": "land", "point": {"x": 2983, "y": 1500}, "isUpDown": True},
    {"id": "41", "provinces": ["dragon_3", "dragon_2"], "type": "land", "point": {"x": 2960, "y": 1253}, "isUpDown": False},
    {"id": "42", "provinces": ["dragon_3", "lion_1"], "type": "land", "point": {"x": 2737, "y": 1520}, "isUpDown": True},
    {"id": "43", "provinces": ["crane_3", "lion_1"], "type": "land", "point": {"x": 2486, "y": 1579}, "isUpDown": False},
    {"id": "44", "provinces": ["lion_2", "lion_1"], "type": "land", "point": {"x": 2589, "y": 1391}, "isUpDown": True},
    {"id": "45", "provinces": ["crane_2", "crane_3"], "type": "land", "point": {"x": 2194, "y": 1431}, "isUpDown": False},
    {"id": "46", "provinces": ["crane_1", "crane_2"], "type": "land", "point": {"x": 1954, "y": 1388}, "isUpDown": False},
    {"id": "47", "provinces": ["wind_3", "crane_1"], "type": "land", "point": {"x": 1753, "y": 1370}, "isUpDown": False},
    {"id": "48", "provinces": ["wind_2", "crane_1"], "type": "land", "point": {"x": 1739, "y": 1095}, "isUpDown": False},
    {"id": "49", "provinces": ["crane_1", "scorpion_1"], "type": "land", "point": {"x": 2063, "y": 1049}, "isUpDown": False},
    {"id": "50", "provinces": ["scorpion_1", "crane_2"], "type": "land", "point": {"x": 2159, "y": 1225}, "isUpDown": True},
    {"id": "51", "provinces": ["scorpion_1", "scorpion_2"], "type": "land", "point": {"x": 2310, "y": 944}, "isUpDown": False},
    {"id": "52", "provinces": ["scorpion_1", "lion_2"], "type": "land", "point": {"x": 2376, "y": 1183}, "isUpDown": False},
    {"id": "53", "provinces": ["scorpion_2", "lion_2"], "type": "land", "point": {"x": 2567, "y": 1100}, "isUpDown": True},
    {"id": "54", "provinces": ["scorpion_2", "lion_3"], "type": "land", "point": {"x": 2693, "y": 975}, "isUpDown": False},
    {"id": "55", "provinces": ["lion_2", "lion_3"], "type": "land", "point": {"x": 2752, "y": 1058}, "isUpDown": False},
    {"id": "56", "provinces": ["lion_3", "dragon_3"], "type": "land", "point": {"x": 2884, "y": 1102}, "isUpDown": True},
    {"id": "57", "provinces": ["lion_2", "dragon_3"], "type": "land", "point": {"x": 2721, "y": 1263}, "isUpDown": False},
    {"id": "58", "provinces": ["island_1", "island_2"], "type": "land", "point": {"x": 687, "y": 1702}, "isUpDown": True},
    {"id": "59", "provinces": ["island_1", "island_3"], "type": "land", "point": {"x": 966, "y": 1658}, "isUpDown": True},
    {"id": "60", "provinces": ["island_2", "island_3"], "type": "land", "point": {"x": 952, "y": 1870}, "isUpDown": False},
    {"id": "61", "provinces": ["lion_2", "crane_3"], "type": "land", "point": {"x": 2415, "y": 1333}, "isUpDown": True},
    {"id": "62", "provinces": ["crane_2", "lion_2"], "type": "land", "point": {"x": 2300, "y": 1267}, "isUpDown": False},
    {"id": "63", "provinces": ["lion_1", "phoenix_3"], "type": "land", "point": {"x": 2884, "y": 1554}, "isUpDown": False},
    {"id": "64", "provinces": ["lion_1", "phoenix_1"], "type": "land", "point": {"x": 2886, "y": 1733}, "isUpDown": True},
    {"id": "65", "provinces": ["sea", "island_1"], "type": "sea", "point": {"x": 771, "y": 1475}, "isUpDown": True},
    {"id": "66", "provinces": ["island_3", "sea"], "type": "sea", "point": {"x": 1325, "y": 1805}, "isUpDown": False},
    {"id": "67", "provinces": ["island_2", "sea"], "type": "sea", "point": {"x": 802, "y": 1996}, "isUpDown": True},
    {"id": "68", "provinces": ["sea", "shadowland_bottom"], "type": "sea", "point": {"x": 392, "y": 527}, "isUpDown": False},
    {"id": "69", "provinces": ["sea", "crab_3"], "type": "sea", "point": {"x": 551, "y": 691}, "isUpDown": False},
    {"id": "70", "provinces": ["wind_1", "sea"], "type": "sea", "point": {"x": 854, "y": 1072}, "isUpDown": True},
    {"id": "71", "provinces": ["wind_3", "sea"], "type": "sea", "point": {"x": 1471, "y": 1471}, "isUpDown": True},
    {"id": "72", "provinces": ["crane_1", "sea"], "type": "sea", "point": {"x": 1855, "y": 1556}, "isUpDown": True},
    {"id": "73", "provinces": ["crane_2", "sea"], "type": "sea", "point": {"x": 2048, "y": 1568}, "isUpDown": True},
    {"id": "74", "provinces": ["crane_3", "sea"], "type": "sea", "point": {"x": 2269, "y": 1675}, "isUpDown": True},
    {"id": "75", "provinces": ["lion_1", "sea"], "type": "sea", "point": {"x": 2678, "y": 1721}, "isUpDown": True},
    {"id": "76", "provinces": ["phoenix_1", "sea"], "type": "sea", "point": {"x": 3213, "y": 1927}, "isUpDown": True},
]

BORDER_MAP = {b["id"]: b for b in BORDERS}

TERRITORIES = [
    {"id": "shadowland", "provinceCount": 2, "capitalProvinceId": None, "type": "shadowlands"},
    {"id": "crab", "provinceCount": 4, "capitalProvinceId": "crab_3", "type": "clan"},
    {"id": "wind", "provinceCount": 3, "capitalProvinceId": None, "type": "neutral"},
    {"id": "crane", "provinceCount": 3, "capitalProvinceId": "crane_3", "type": "clan"},
    {"id": "lion", "provinceCount": 3, "capitalProvinceId": "lion_2", "type": "clan"},
    {"id": "scorpion", "provinceCount": 3, "capitalProvinceId": "scorpion_1", "type": "clan"},
    {"id": "unicorn", "provinceCount": 3, "capitalProvinceId": "unicorn_2", "type": "clan"},
    {"id": "dragon", "provinceCount": 3, "capitalProvinceId": "dragon_2", "type": "clan"},
    {"id": "phoenix", "provinceCount": 3, "capitalProvinceId": "phoenix_3", "type": "clan"},
    {"id": "island", "provinceCount": 3, "capitalProvinceId": None, "type": "neutral"},
]

TERRITORY_MAP = {t["id"]: t for t in TERRITORIES}

# Capital provinces per clan
CLAN_CAPITALS = {
    "crab": "crab_3",
    "crane": "crane_3",
    "dragon": "dragon_2",
    "lion": "lion_2",
    "phoenix": "phoenix_3",
    "scorpion": "scorpion_1",
    "unicorn": "unicorn_2",
}

# Territory card definitions (2 per territory, 1 randomly assigned per game)
TERRITORY_CARDS = {
    "wind": [
        {"id": "wind_1_card", "name": "Bountiful Harvest", "territory": "wind",
         "description": "Choose one province you control and place two of your control tokens face-up in that province."},
        {"id": "wind_2_card", "name": "Ashigaru Levies", "territory": "wind",
         "description": "Choose three different non-Shadowlands provinces and place one +1 defense token in each province."},
    ],
    "crab": [
        {"id": "crab_1_card", "name": "Feats of Engineering", "territory": "crab",
         "description": "Choose a landlocked province and place the harbor token in it."},
        {"id": "crab_2_card", "name": "Promotion", "territory": "crab",
         "description": "Choose one army, navy, or shinobi token in your discard pile and return it to your hand. Then choose one combat token in your hand and either discard it or return it to your token pool."},
    ],
    "dragon": [
        {"id": "dragon_1_card", "name": "Strength of Purpose", "territory": "dragon",
         "description": "Choose two different provinces you control and add one of your control tokens face-up to each."},
        {"id": "dragon_2_card", "name": "Sacred Ground", "territory": "dragon",
         "description": "Choose a province and place the shrine token in it."},
    ],
    "crane": [
        {"id": "crane_1_card", "name": "Code of Honor", "territory": "crane",
         "description": "Choose two different non-Shadowlands provinces and place one +1 honor token in each."},
        {"id": "crane_2_card", "name": "Diplomatic Mission", "territory": "crane",
         "description": "Place one peace token in any province. If in opponent's province, add two control tokens face-up to a province you control."},
    ],
    "island": [
        {"id": "island_1_card", "name": "Port of Prosperity", "territory": "island",
         "description": "Choose a non-Shadowlands province and place one +2 honor token in it."},
        {"id": "island_2_card", "name": "Pirate Raids", "territory": "island",
         "description": "Place one scorched earth token in any province. If in your province, place three control tokens face-up in another province you control."},
    ],
    "unicorn": [
        {"id": "unicorn_1_card", "name": "Cultural Exchange", "territory": "unicorn",
         "description": "Swap all control tokens between a province you control and an opponent's province."},
        {"id": "unicorn_2_card", "name": "Reinforcements", "territory": "unicorn",
         "description": "Choose two army tokens in your discard pile and return them to your hand. Then choose two combat tokens in your hand and discard or return them."},
    ],
    "lion": [
        {"id": "lion_1_card", "name": "Bushido", "territory": "lion",
         "description": "Choose a non-Shadowlands province and place the 4-honor token in it."},
        {"id": "lion_2_card", "name": "Honorable Fight", "territory": "lion",
         "description": "Choose a province and place the battlefield token in it."},
    ],
    "phoenix": [
        {"id": "phoenix_1_card", "name": "Bless the Lands", "territory": "phoenix",
         "description": "Remove one scorched earth token. Then place two control tokens and flip one face-up."},
        {"id": "phoenix_2_card", "name": "Aid of the Kami", "territory": "phoenix",
         "description": "Choose a non-Shadowlands province and place one +2 defense token in it."},
    ],
    "scorpion": [
        {"id": "scorpion_1_card", "name": "Foment Rebellion", "territory": "scorpion",
         "description": "Remove one peace token. If from your province, add two control tokens face-up."},
        {"id": "scorpion_2_card", "name": "Spy Network", "territory": "scorpion",
         "description": "Look at another player's hand. That player cannot use their bluff token this round."},
    ],
    "shadowland": [
        {"id": "shadowland_bottom_1_card", "name": "Purge the Weak", "territory": "shadowland",
         "description": "Discard one combat token from hand. Then reveal and discard two combat tokens on the board. Play at start of turn in placement phase."},
        {"id": "shadowland_bottom_2_card", "name": "Dark Favors", "territory": "shadowland",
         "description": "Remove one control token from non-Shadowlands province. Look at up to four tokens on board. Reveal and discard one. Play at start of turn in placement phase."},
        {"id": "shadowland_top_1_card", "name": "Animate the Dead", "territory": "shadowland",
         "description": "Remove one control token from non-Shadowlands province. Place one combat token from discard pile face-up on board. Play at start of turn in placement phase."},
        {"id": "shadowland_top_2_card", "name": "Inspire Fear", "territory": "shadowland",
         "description": "Remove one control token from non-Shadowlands province. Remove up to two special tokens from the board. Play at start of turn in placement phase."},
    ],
}

SECRET_OBJECTIVES = [
    {"id": "rice_bowl", "name": "The Rice Bowl of the Empire", "description": "Control either the Crane capital or two provinces in the Crane territory.", "honor": 6,
     "check": {"type": "clan_territory", "clan": "crane", "capital": "crane_3", "provinces_needed": 2}},
    {"id": "plains_of_battle", "name": "The Plains of Battle", "description": "Control either the Lion capital or two provinces in the Lion territory.", "honor": 7,
     "check": {"type": "clan_territory", "clan": "lion", "capital": "lion_2", "provinces_needed": 2}},
    {"id": "last_line_defense", "name": "The Last Line of Defense", "description": "Control either the Crab capital or two provinces in the Crab territory.", "honor": 5,
     "check": {"type": "clan_territory", "clan": "crab", "capital": "crab_3", "provinces_needed": 2}},
    {"id": "emerald_empire", "name": "Emerald Empire", "description": "Control six consecutively adjacent provinces spanning three different territories.", "honor": 10,
     "check": {"type": "consecutive_provinces", "count": 6, "territories_needed": 3}},
    {"id": "great_library", "name": "The Great Library", "description": "Control either the Phoenix capital or two provinces in the Phoenix territory.", "honor": 7,
     "check": {"type": "clan_territory", "clan": "phoenix", "capital": "phoenix_3", "provinces_needed": 2}},
    {"id": "way_humility", "name": "Way of Humility", "description": "Control the fewest provinces.", "honor": 10,
     "check": {"type": "fewest_provinces"}},
    {"id": "court_five_winds", "name": "The Court of Five Winds", "description": "Control either the Unicorn capital or two provinces in the Unicorn territory.", "honor": 6,
     "check": {"type": "clan_territory", "clan": "unicorn", "capital": "unicorn_2", "provinces_needed": 2}},
    {"id": "den_of_secrets", "name": "The Den of Secrets", "description": "Control either the Scorpion capital or two provinces in the Scorpion territory.", "honor": 7,
     "check": {"type": "clan_territory", "clan": "scorpion", "capital": "scorpion_1", "provinces_needed": 2}},
    {"id": "reclaiming_lost_lands", "name": "Reclaiming Lost Lands", "description": "Control both Shadowlands provinces.", "honor": 3,
     "check": {"type": "shadowlands"}},
    {"id": "web_of_influence", "name": "Web of Influence", "description": "Control at least one province in each of seven different territories.", "honor": 10,
     "check": {"type": "territory_count", "count": 7}},
    {"id": "way_of_sail", "name": "Way of the Sail", "description": "Control six coastal provinces.", "honor": 10,
     "check": {"type": "coastal_provinces", "count": 6}},
    {"id": "great_wall_north", "name": "The Great Wall of the North", "description": "Control either the Dragon capital or two provinces in the Dragon territory.", "honor": 6,
     "check": {"type": "clan_territory", "clan": "dragon", "capital": "dragon_2", "provinces_needed": 2}},
]

# Build adjacency map from borders (excluding sea)
def build_adjacency():
    adj = {}
    for p in PROVINCES:
        if p["id"] != "sea":
            adj[p["id"]] = set()
    for b in BORDERS:
        p1, p2 = b["provinces"]
        if p1 != "sea" and p2 != "sea":
            adj[p1].add(p2)
            adj[p2].add(p1)
    return adj

ADJACENCY = build_adjacency()

def get_provinces_for_territory(territory_id):
    return [p["id"] for p in PROVINCES if p.get("territoryId") == territory_id and p["id"] != "sea"]

def get_coastal_borders_for_province(province_id):
    return [b for b in BORDERS if b["type"] == "sea" and province_id in b["provinces"]]

def get_land_borders_between(p1_id, p2_id):
    for b in BORDERS:
        if b["type"] == "land" and p1_id in b["provinces"] and p2_id in b["provinces"]:
            return b
    return None
