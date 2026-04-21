/**
 * Battle for Rokugan - Game Constants
 * All editable configuration: colors, names, asset paths, labels
 */

// ===== CLAN CONFIGURATION =====
export const CLANS = {
  crab:     { id: 'crab',     name: 'Crab',     color: '#7e7c91', assetFolder: 'Gray',   capital: 'crab_3',     ability: 'Face-up control tokens have +2 defense instead of +1.' },
  crane:    { id: 'crane',    name: 'Crane',    color: '#4576b8', assetFolder: 'Blue',   capital: 'crane_3',    ability: 'When tied in battle, you win instead.' },
  dragon:   { id: 'dragon',   name: 'Dragon',   color: '#618778', assetFolder: 'Green',  capital: 'dragon_2',   ability: 'Draw 1 additional token, return 1 non-bluff.' },
  lion:     { id: 'lion',     name: 'Lion',     color: '#ccb25b', assetFolder: 'Yellow', capital: 'lion_2',     ability: 'Bluff token has +2 defense and is not discarded defending.' },
  phoenix:  { id: 'phoenix',  name: 'Phoenix',  color: '#cd8855', assetFolder: 'Orange', capital: 'phoenix_3',  ability: 'Ignore clan capital defenses when attacking.' },
  scorpion: { id: 'scorpion', name: 'Scorpion', color: '#a34a39', assetFolder: 'Red',    capital: 'scorpion_1', ability: 'Once per round, look at one combat token on the board.' },
  unicorn:  { id: 'unicorn',  name: 'Unicorn',  color: '#7b588e', assetFolder: 'Purple', capital: 'unicorn_2',  ability: 'Before reveal, switch two of your combat tokens.' },
};

export const CLAN_LIST = Object.keys(CLANS);

// ===== ASSET PATHS =====
export const ASSETS = {
  board: '/enhanced_board.png',
  music: '/assets/music.mp3',
  calligraphy: {
    shugenja: '/assets/shugenja.png',
    scout: '/assets/scout.png',
    scorpion: '/assets/scorpion.png',
  },
  combat: (color, tokenType, strength) => `/assets/combat/${color}/${tokenType}${strength}.png`,
  combatBack: (color) => `/assets/combat/${color}/back.png`,
  combatBluff: (color) => `/assets/combat/${color}/bluff.png`,
  combatDiplomacy: (color) => `/assets/combat/${color}/diplomacy.png`,
  combatRaid: (color) => `/assets/combat/${color}/raid.png`,
  control: (color, faceUp) => `/assets/control/${color}/${faceUp ? 'front' : 'back'}.png`,
  special: (type) => {
    const nameMap = { scorched_earth: 'ScorchedEarth', peace: 'Peace', shrine: 'Shrine', battlefield: 'Battlefield', harbor: 'Harbor' };
    return `/assets/special/${nameMap[type] || type}.png`;
  },
  bonus: (type, value) => `/assets/bonus/${type}${value}.png`,
};

// ===== TOKEN TYPE LABELS =====
export const TOKEN_LABELS = {
  army: 'Army', navy: 'Navy', shinobi: 'Shinobi',
  diplomacy: 'Diplomacy', raid: 'Raid', blessing: 'Blessing',
  bluff: 'Bluff', hidden: 'Hidden',
};

export const TOKEN_ABBREVIATIONS = {
  army: 'A', navy: 'N', shinobi: 'S', diplomacy: 'D',
  raid: 'R', blessing: 'B', bluff: '?', hidden: '?',
};

// ===== TERRITORY LABELS =====
export const TERRITORY_LABELS = {
  shadowland_bottom: 'Shadowlands (South)',
  shadowland_top: 'Shadowlands (North)',
  shadowland: 'Shadowlands',
  crab: 'Crab Lands',
  wind: 'Wind Lands',
  crane: 'Crane Lands',
  lion: 'Lion Lands',
  scorpion: 'Scorpion Lands',
  unicorn: 'Unicorn Lands',
  dragon: 'Dragon Lands',
  phoenix: 'Phoenix Lands',
  island: 'Island',
};

// ===== PROVINCE DATA =====
export const PROVINCES_DATA = [
  { id: "shadowland_bottom", territoryId: "shadowland", center: { x: 672, y: 342 }, isCoastal: true, baseDefense: 1, flowers: 0, isCapital: false, name: "Shadowlands South" },
  { id: "shadowland_top", territoryId: "shadowland", center: { x: 1363, y: 180 }, isCoastal: false, baseDefense: 1, flowers: 0, isCapital: false, name: "Shadowlands North" },
  { id: "crab_1", territoryId: "crab", center: { x: 2047, y: 291 }, isCoastal: false, baseDefense: 0, flowers: 1, isCapital: false, name: "Crab Province 1" },
  { id: "crab_2", territoryId: "crab", center: { x: 1467, y: 664 }, isCoastal: false, baseDefense: 0, flowers: 2, isCapital: false, name: "Crab Province 2" },
  { id: "crab_3", territoryId: "crab", center: { x: 881, y: 775 }, isCoastal: true, baseDefense: 2, flowers: 2, isCapital: true, name: "Crab Capital" },
  { id: "crab_4", territoryId: "crab", center: { x: 1960, y: 746 }, isCoastal: false, baseDefense: 0, flowers: 3, isCapital: false, name: "Crab Province 4" },
  { id: "wind_1", territoryId: "wind", center: { x: 937, y: 990 }, isCoastal: true, baseDefense: 0, flowers: 3, isCapital: false, name: "Wind Province 1" },
  { id: "wind_2", territoryId: "wind", center: { x: 1540, y: 1023 }, isCoastal: false, baseDefense: 0, flowers: 3, isCapital: false, name: "Wind Province 2" },
  { id: "wind_3", territoryId: "wind", center: { x: 1529, y: 1339 }, isCoastal: true, baseDefense: 0, flowers: 2, isCapital: false, name: "Wind Province 3" },
  { id: "crane_1", territoryId: "crane", center: { x: 1854, y: 1200 }, isCoastal: true, baseDefense: 0, flowers: 3, isCapital: false, name: "Crane Province 1" },
  { id: "crane_2", territoryId: "crane", center: { x: 2075, y: 1396 }, isCoastal: true, baseDefense: 0, flowers: 2, isCapital: false, name: "Crane Province 2" },
  { id: "crane_3", territoryId: "crane", center: { x: 2307, y: 1550 }, isCoastal: true, baseDefense: 2, flowers: 2, isCapital: true, name: "Crane Capital" },
  { id: "lion_1", territoryId: "lion", center: { x: 2645, y: 1589 }, isCoastal: true, baseDefense: 0, flowers: 2, isCapital: false, name: "Lion Province 1" },
  { id: "lion_2", territoryId: "lion", center: { x: 2508, y: 1294 }, isCoastal: false, baseDefense: 2, flowers: 2, isCapital: true, name: "Lion Capital" },
  { id: "lion_3", territoryId: "lion", center: { x: 2910, y: 956 }, isCoastal: false, baseDefense: 0, flowers: 2, isCapital: false, name: "Lion Province 3" },
  { id: "scorpion_1", territoryId: "scorpion", center: { x: 2142, y: 1081 }, isCoastal: false, baseDefense: 2, flowers: 2, isCapital: true, name: "Scorpion Capital" },
  { id: "scorpion_2", territoryId: "scorpion", center: { x: 2491, y: 924 }, isCoastal: false, baseDefense: 0, flowers: 3, isCapital: false, name: "Scorpion Province 2" },
  { id: "scorpion_3", territoryId: "scorpion", center: { x: 2399, y: 554 }, isCoastal: false, baseDefense: 0, flowers: 1, isCapital: false, name: "Scorpion Province 3" },
  { id: "unicorn_1", territoryId: "unicorn", center: { x: 2745, y: 332 }, isCoastal: false, baseDefense: 0, flowers: 1, isCapital: false, name: "Unicorn Province 1" },
  { id: "unicorn_2", territoryId: "unicorn", center: { x: 3071, y: 446 }, isCoastal: false, baseDefense: 2, flowers: 2, isCapital: true, name: "Unicorn Capital" },
  { id: "unicorn_3", territoryId: "unicorn", center: { x: 2799, y: 696 }, isCoastal: false, baseDefense: 0, flowers: 3, isCapital: false, name: "Unicorn Province 3" },
  { id: "dragon_1", territoryId: "dragon", center: { x: 3341, y: 716 }, isCoastal: false, baseDefense: 0, flowers: 1, isCapital: false, name: "Dragon Province 1" },
  { id: "dragon_2", territoryId: "dragon", center: { x: 3134, y: 1201 }, isCoastal: false, baseDefense: 2, flowers: 2, isCapital: true, name: "Dragon Capital" },
  { id: "dragon_3", territoryId: "dragon", center: { x: 2840, y: 1330 }, isCoastal: false, baseDefense: 0, flowers: 3, isCapital: false, name: "Dragon Province 3" },
  { id: "phoenix_1", territoryId: "phoenix", center: { x: 3221, y: 1851 }, isCoastal: true, baseDefense: 0, flowers: 1, isCapital: false, name: "Phoenix Province 1" },
  { id: "phoenix_2", territoryId: "phoenix", center: { x: 3263, y: 1711 }, isCoastal: false, baseDefense: 0, flowers: 2, isCapital: false, name: "Phoenix Province 2" },
  { id: "phoenix_3", territoryId: "phoenix", center: { x: 3238, y: 1526 }, isCoastal: false, baseDefense: 2, flowers: 2, isCapital: true, name: "Phoenix Capital" },
  { id: "island_1", territoryId: "island", center: { x: 775, y: 1551 }, isCoastal: true, baseDefense: 0, flowers: 1, isCapital: false, name: "Island Province 1" },
  { id: "island_2", territoryId: "island", center: { x: 748, y: 1807 }, isCoastal: true, baseDefense: 0, flowers: 1, isCapital: false, name: "Island Province 2" },
  { id: "island_3", territoryId: "island", center: { x: 1196, y: 1913 }, isCoastal: true, baseDefense: 0, flowers: 2, isCapital: false, name: "Island Province 3" },
];

export const PROVINCE_MAP = Object.fromEntries(PROVINCES_DATA.map(p => [p.id, p]));

// ===== SPECIAL TOKEN COLORS =====
export const SPECIAL_COLORS = {
  peace: '#60A5FA', scorched_earth: '#F87171', shrine: '#D4AF37',
  battlefield: '#9CA3AF', harbor: '#34D399',
};

// ===== BOARD DIMENSIONS =====
export const BOARD_W = 3737;
export const BOARD_H = 2313;
export const SEA_RECT = { x1: 1488, y1: 1832, x2: 2806, y2: 2154 };

// ===== UI THEME =====
export const THEME = {
  primary: '#C41E3A',
  primaryHover: '#A01830',
  secondary: '#D4AF37',
  secondaryHover: '#B5952F',
  bg: '#0A0A0A',
  surface: '#161618',
  text: '#F5F5F0',
  textMuted: '#A1A1AA',
  success: '#2E7D32',
  warning: '#F57C00',
  danger: '#D32F2F',
};

// ===== SPECIAL TOKEN LABELS =====
export const SPECIAL_LABELS = {
  peace: 'Peace', scorched_earth: 'Scorched Earth', shrine: 'Shrine',
  battlefield: 'Battlefield', harbor: 'Harbor',
};
