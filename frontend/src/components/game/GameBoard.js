import React, { useEffect, useRef, useState, useMemo } from 'react';
import { CombatToken, ControlToken, SpecialToken } from './TokenImages';

const BOARD_W = 3737;
const BOARD_H = 2313;
const SEA_RECT = { x1: 1488, y1: 1832, x2: 2806, y2: 2154 };

const PROVINCES_DATA = [
  { id: "shadowland_bottom", center: { x: 672, y: 342 }, territoryId: "shadowland" },
  { id: "shadowland_top", center: { x: 1363, y: 180 }, territoryId: "shadowland" },
  { id: "crab_1", center: { x: 2047, y: 291 }, territoryId: "crab" },
  { id: "crab_2", center: { x: 1467, y: 664 }, territoryId: "crab" },
  { id: "crab_3", center: { x: 881, y: 775 }, territoryId: "crab" },
  { id: "crab_4", center: { x: 1960, y: 746 }, territoryId: "crab" },
  { id: "wind_1", center: { x: 937, y: 990 }, territoryId: "wind" },
  { id: "wind_2", center: { x: 1540, y: 1023 }, territoryId: "wind" },
  { id: "wind_3", center: { x: 1529, y: 1339 }, territoryId: "wind" },
  { id: "crane_1", center: { x: 1854, y: 1200 }, territoryId: "crane" },
  { id: "crane_2", center: { x: 2075, y: 1396 }, territoryId: "crane" },
  { id: "crane_3", center: { x: 2307, y: 1550 }, territoryId: "crane" },
  { id: "lion_1", center: { x: 2645, y: 1589 }, territoryId: "lion" },
  { id: "lion_2", center: { x: 2508, y: 1294 }, territoryId: "lion" },
  { id: "lion_3", center: { x: 2910, y: 956 }, territoryId: "lion" },
  { id: "scorpion_1", center: { x: 2142, y: 1081 }, territoryId: "scorpion" },
  { id: "scorpion_2", center: { x: 2491, y: 924 }, territoryId: "scorpion" },
  { id: "scorpion_3", center: { x: 2399, y: 554 }, territoryId: "scorpion" },
  { id: "unicorn_1", center: { x: 2745, y: 332 }, territoryId: "unicorn" },
  { id: "unicorn_2", center: { x: 3071, y: 446 }, territoryId: "unicorn" },
  { id: "unicorn_3", center: { x: 2799, y: 696 }, territoryId: "unicorn" },
  { id: "dragon_1", center: { x: 3341, y: 716 }, territoryId: "dragon" },
  { id: "dragon_2", center: { x: 3134, y: 1201 }, territoryId: "dragon" },
  { id: "dragon_3", center: { x: 2840, y: 1330 }, territoryId: "dragon" },
  { id: "phoenix_1", center: { x: 3221, y: 1851 }, territoryId: "phoenix" },
  { id: "phoenix_2", center: { x: 3263, y: 1711 }, territoryId: "phoenix" },
  { id: "phoenix_3", center: { x: 3238, y: 1526 }, territoryId: "phoenix" },
  { id: "island_1", center: { x: 775, y: 1551 }, territoryId: "island" },
  { id: "island_2", center: { x: 748, y: 1807 }, territoryId: "island" },
  { id: "island_3", center: { x: 1196, y: 1913 }, territoryId: "island" },
];

const BORDERS_DATA = [
  { id: "1", provinces: ["shadowland_bottom", "shadowland_top"], type: "land", point: { x: 1006, y: 280 }, isUpDown: false },
  { id: "2", provinces: ["shadowland_top", "crab_1"], type: "land", point: { x: 1774, y: 207 }, isUpDown: false },
  { id: "3", provinces: ["shadowland_top", "crab_2"], type: "land", point: { x: 1602, y: 412 }, isUpDown: true },
  { id: "4", provinces: ["shadowland_top", "crab_3"], type: "land", point: { x: 1278, y: 432 }, isUpDown: true },
  { id: "5", provinces: ["shadowland_bottom", "crab_3"], type: "land", point: { x: 895, y: 531 }, isUpDown: true },
  { id: "6", provinces: ["crab_3", "crab_2"], type: "land", point: { x: 1106, y: 673 }, isUpDown: false },
  { id: "7", provinces: ["crab_3", "wind_1"], type: "land", point: { x: 831, y: 917 }, isUpDown: true },
  { id: "8", provinces: ["crab_2", "wind_1"], type: "land", point: { x: 1091, y: 935 }, isUpDown: true },
  { id: "9", provinces: ["wind_2", "wind_1"], type: "land", point: { x: 1263, y: 1016 }, isUpDown: true },
  { id: "10", provinces: ["wind_1", "wind_3"], type: "land", point: { x: 1354, y: 1193 }, isUpDown: false },
  { id: "11", provinces: ["wind_2", "wind_3"], type: "land", point: { x: 1558, y: 1212 }, isUpDown: true },
  { id: "12", provinces: ["crab_2", "wind_2"], type: "land", point: { x: 1490, y: 895 }, isUpDown: true },
  { id: "13", provinces: ["crab_4", "wind_2"], type: "land", point: { x: 1708, y: 898 }, isUpDown: true },
  { id: "14", provinces: ["crab_2", "crab_4"], type: "land", point: { x: 1757, y: 715 }, isUpDown: false },
  { id: "15", provinces: ["crab_1", "crab_2"], type: "land", point: { x: 1811, y: 541 }, isUpDown: true },
  { id: "16", provinces: ["crab_1", "crab_4"], type: "land", point: { x: 2090, y: 601 }, isUpDown: true },
  { id: "17", provinces: ["crab_1", "scorpion_3"], type: "land", point: { x: 2308, y: 413 }, isUpDown: false },
  { id: "18", provinces: ["crab_1", "unicorn_1"], type: "land", point: { x: 2518, y: 120 }, isUpDown: false },
  { id: "19", provinces: ["scorpion_3", "unicorn_1"], type: "land", point: { x: 2563, y: 436 }, isUpDown: false },
  { id: "20", provinces: ["crab_4", "scorpion_3"], type: "land", point: { x: 2235, y: 651 }, isUpDown: false },
  { id: "21", provinces: ["crab_4", "scorpion_1"], type: "land", point: { x: 2135, y: 832 }, isUpDown: true },
  { id: "22", provinces: ["crab_4", "crane_1"], type: "land", point: { x: 1906, y: 845 }, isUpDown: true },
  { id: "23", provinces: ["scorpion_3", "scorpion_1"], type: "land", point: { x: 2285, y: 769 }, isUpDown: true },
  { id: "24", provinces: ["scorpion_3", "scorpion_2"], type: "land", point: { x: 2443, y: 771 }, isUpDown: true },
  { id: "25", provinces: ["scorpion_3", "unicorn_3"], type: "land", point: { x: 2559, y: 694 }, isUpDown: false },
  { id: "26", provinces: ["unicorn_1", "unicorn_3"], type: "land", point: { x: 2777, y: 512 }, isUpDown: true },
  { id: "27", provinces: ["unicorn_1", "unicorn_2"], type: "land", point: { x: 3080, y: 247 }, isUpDown: true },
  { id: "28", provinces: ["unicorn_3", "unicorn_2"], type: "land", point: { x: 2973, y: 598 }, isUpDown: false },
  { id: "29", provinces: ["unicorn_2", "dragon_1"], type: "land", point: { x: 3282, y: 375 }, isUpDown: false },
  { id: "30", provinces: ["scorpion_2", "unicorn_3"], type: "land", point: { x: 2662, y: 797 }, isUpDown: false },
  { id: "31", provinces: ["unicorn_3", "lion_3"], type: "land", point: { x: 2892, y: 821 }, isUpDown: true },
  { id: "32", provinces: ["lion_3", "dragon_1"], type: "land", point: { x: 3096, y: 855 }, isUpDown: false },
  { id: "33", provinces: ["unicorn_2", "lion_3"], type: "land", point: { x: 3070, y: 748 }, isUpDown: true },
  { id: "34", provinces: ["dragon_1", "dragon_2"], type: "land", point: { x: 3453, y: 922 }, isUpDown: true },
  { id: "35", provinces: ["lion_3", "dragon_2"], type: "land", point: { x: 3067, y: 1018 }, isUpDown: true },
  { id: "36", provinces: ["dragon_2", "phoenix_3"], type: "land", point: { x: 3248, y: 1310 }, isUpDown: true },
  { id: "37", provinces: ["phoenix_3", "phoenix_2"], type: "land", point: { x: 3431, y: 1497 }, isUpDown: true },
  { id: "38", provinces: ["phoenix_2", "phoenix_1"], type: "land", point: { x: 3400, y: 1773 }, isUpDown: true },
  { id: "39", provinces: ["lion_1", "phoenix_2"], type: "land", point: { x: 2933, y: 1648 }, isUpDown: false },
  { id: "40", provinces: ["dragon_3", "phoenix_3"], type: "land", point: { x: 2983, y: 1500 }, isUpDown: true },
  { id: "41", provinces: ["dragon_3", "dragon_2"], type: "land", point: { x: 2960, y: 1253 }, isUpDown: false },
  { id: "42", provinces: ["dragon_3", "lion_1"], type: "land", point: { x: 2737, y: 1520 }, isUpDown: true },
  { id: "43", provinces: ["crane_3", "lion_1"], type: "land", point: { x: 2486, y: 1579 }, isUpDown: false },
  { id: "44", provinces: ["lion_2", "lion_1"], type: "land", point: { x: 2589, y: 1391 }, isUpDown: true },
  { id: "45", provinces: ["crane_2", "crane_3"], type: "land", point: { x: 2194, y: 1431 }, isUpDown: false },
  { id: "46", provinces: ["crane_1", "crane_2"], type: "land", point: { x: 1954, y: 1388 }, isUpDown: false },
  { id: "47", provinces: ["wind_3", "crane_1"], type: "land", point: { x: 1753, y: 1370 }, isUpDown: false },
  { id: "48", provinces: ["wind_2", "crane_1"], type: "land", point: { x: 1739, y: 1095 }, isUpDown: false },
  { id: "49", provinces: ["crane_1", "scorpion_1"], type: "land", point: { x: 2063, y: 1049 }, isUpDown: false },
  { id: "50", provinces: ["scorpion_1", "crane_2"], type: "land", point: { x: 2159, y: 1225 }, isUpDown: true },
  { id: "51", provinces: ["scorpion_1", "scorpion_2"], type: "land", point: { x: 2310, y: 944 }, isUpDown: false },
  { id: "52", provinces: ["scorpion_1", "lion_2"], type: "land", point: { x: 2376, y: 1183 }, isUpDown: false },
  { id: "53", provinces: ["scorpion_2", "lion_2"], type: "land", point: { x: 2567, y: 1100 }, isUpDown: true },
  { id: "54", provinces: ["scorpion_2", "lion_3"], type: "land", point: { x: 2693, y: 975 }, isUpDown: false },
  { id: "55", provinces: ["lion_2", "lion_3"], type: "land", point: { x: 2752, y: 1058 }, isUpDown: false },
  { id: "56", provinces: ["lion_3", "dragon_3"], type: "land", point: { x: 2884, y: 1102 }, isUpDown: true },
  { id: "57", provinces: ["lion_2", "dragon_3"], type: "land", point: { x: 2721, y: 1263 }, isUpDown: false },
  { id: "58", provinces: ["island_1", "island_2"], type: "land", point: { x: 687, y: 1702 }, isUpDown: true },
  { id: "59", provinces: ["island_1", "island_3"], type: "land", point: { x: 966, y: 1658 }, isUpDown: true },
  { id: "60", provinces: ["island_2", "island_3"], type: "land", point: { x: 952, y: 1870 }, isUpDown: false },
  { id: "61", provinces: ["lion_2", "crane_3"], type: "land", point: { x: 2415, y: 1333 }, isUpDown: true },
  { id: "62", provinces: ["crane_2", "lion_2"], type: "land", point: { x: 2300, y: 1267 }, isUpDown: false },
  { id: "63", provinces: ["lion_1", "phoenix_3"], type: "land", point: { x: 2884, y: 1554 }, isUpDown: false },
  { id: "64", provinces: ["lion_1", "phoenix_1"], type: "land", point: { x: 2886, y: 1733 }, isUpDown: true },
  { id: "65", provinces: ["sea", "island_1"], type: "sea", point: { x: 771, y: 1475 }, isUpDown: true },
  { id: "66", provinces: ["island_3", "sea"], type: "sea", point: { x: 1325, y: 1805 }, isUpDown: false },
  { id: "67", provinces: ["island_2", "sea"], type: "sea", point: { x: 802, y: 1996 }, isUpDown: true },
  { id: "68", provinces: ["sea", "shadowland_bottom"], type: "sea", point: { x: 392, y: 527 }, isUpDown: false },
  { id: "69", provinces: ["sea", "crab_3"], type: "sea", point: { x: 551, y: 691 }, isUpDown: false },
  { id: "70", provinces: ["wind_1", "sea"], type: "sea", point: { x: 854, y: 1072 }, isUpDown: true },
  { id: "71", provinces: ["wind_3", "sea"], type: "sea", point: { x: 1471, y: 1471 }, isUpDown: true },
  { id: "72", provinces: ["crane_1", "sea"], type: "sea", point: { x: 1855, y: 1556 }, isUpDown: true },
  { id: "73", provinces: ["crane_2", "sea"], type: "sea", point: { x: 2048, y: 1568 }, isUpDown: true },
  { id: "74", provinces: ["crane_3", "sea"], type: "sea", point: { x: 2269, y: 1675 }, isUpDown: true },
  { id: "75", provinces: ["lion_1", "sea"], type: "sea", point: { x: 2678, y: 1721 }, isUpDown: true },
  { id: "76", provinces: ["phoenix_1", "sea"], type: "sea", point: { x: 3213, y: 1927 }, isUpDown: true },
];

const CLAN_COLORS_MAP = {
  crab: '#9CA3AF', crane: '#60A5FA', dragon: '#34D399', lion: '#FBBF24',
  phoenix: '#FB923C', scorpion: '#F87171', unicorn: '#A78BFA',
};

export default function GameBoard({ gameState, myPlayerIndex, selectedToken, sourceProvince, placementStep, onProvinceClick, onBorderClick, onSeaClick }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        setScale(Math.min(cw / BOARD_W, ch / BOARD_H));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const s = (v) => v * scale;
  const isMyTurn = myPlayerIndex === gameState.current_turn_index;
  const isPlacement = gameState.phase === 'placement';
  const isSetup = gameState.status === 'setup' && gameState.phase === 'setup';
  const canInteract = isMyTurn && (isPlacement || isSetup);

  const provinceInfo = useMemo(() => {
    const info = {};
    PROVINCES_DATA.forEach(p => {
      const provState = gameState.provinces?.[p.id];
      const ci = provState?.controlled_by;
      const clan = ci !== null && ci !== undefined && gameState.players[ci] ? gameState.players[ci].clan : null;
      info[p.id] = { ...p, controllerClan: clan, controllerColor: clan ? CLAN_COLORS_MAP[clan] : null, provState };
    });
    return info;
  }, [gameState]);

  const tokenSize = Math.max(s(36), 14);
  const controlSize = Math.max(s(28), 10);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto flex items-center justify-center bg-[#0A0A0A] relative" data-testid="game-board">
      <div style={{ width: s(BOARD_W), height: s(BOARD_H), position: 'relative' }} className="shrink-0">
        <img src="/assets/board.png" alt="Battle Map" style={{ width: '100%', height: '100%' }} className="select-none pointer-events-none" draggable={false} />

        {/* Provinces */}
        {PROVINCES_DATA.map(prov => {
          const info = provinceInfo[prov.id];
          const provState = info?.provState;
          const isClickable = canInteract;
          const isSource = sourceProvince === prov.id;

          return (
            <React.Fragment key={prov.id}>
              {/* Ownership glow */}
              {info?.controllerColor && (
                <div style={{
                  position: 'absolute', left: s(prov.center.x) - s(35), top: s(prov.center.y) - s(35),
                  width: s(70), height: s(70), borderRadius: '50%',
                  backgroundColor: info.controllerColor, opacity: 0.18, pointerEvents: 'none',
                }} />
              )}

              {/* Clickable area */}
              <div
                data-testid={`province-${prov.id}`}
                onClick={() => isClickable && onProvinceClick(prov.id)}
                style={{
                  position: 'absolute', left: s(prov.center.x) - s(50), top: s(prov.center.y) - s(50),
                  width: s(100), height: s(100), borderRadius: '50%',
                  cursor: isClickable ? 'pointer' : 'default', zIndex: 10,
                  border: isSource ? '3px solid #D4AF37' : 'none',
                  backgroundColor: isSource ? 'rgba(212,175,55,0.2)' : 'transparent',
                }}
                className={isClickable && (selectedToken || isSetup) ? 'province-clickable' : 'province-hover'}
                title={prov.id}
              />

              {/* Control tokens */}
              {provState?.control_tokens?.map((ct, idx) => {
                const count = provState.control_tokens.length;
                const angle = (idx / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
                const r = count > 1 ? 25 : 0;
                return (
                  <div key={`ct-${prov.id}-${idx}`} style={{
                    position: 'absolute',
                    left: s(prov.center.x + Math.cos(angle) * r) - controlSize / 2,
                    top: s(prov.center.y + Math.sin(angle) * r) - controlSize / 2,
                    zIndex: 5, pointerEvents: 'none',
                  }}>
                    <ControlToken ct={ct} players={gameState.players} size={controlSize} />
                  </div>
                );
              })}

              {/* Combat tokens in province */}
              {provState?.combat_tokens?.map((ct, idx) => {
                const count = provState.combat_tokens.length;
                const angle = ((idx + 1) / (count + 1)) * Math.PI * 2 - Math.PI / 2;
                const r = 42;
                const playerColor = ct.player_index !== undefined && gameState.players[ct.player_index]
                  ? gameState.players[ct.player_index].color : 'Gray';
                return (
                  <div key={`combat-${prov.id}-${idx}`} style={{
                    position: 'absolute',
                    left: s(prov.center.x + Math.cos(angle) * r) - tokenSize / 2,
                    top: s(prov.center.y + Math.sin(angle) * r) - tokenSize / 2,
                    zIndex: 15, pointerEvents: 'none',
                  }}>
                    <CombatToken token={ct} color={playerColor} faceUp={ct.face_up} size={tokenSize} />
                  </div>
                );
              })}

              {/* Special token */}
              {provState?.special_token && (
                <div style={{
                  position: 'absolute',
                  left: s(prov.center.x) - s(18),
                  top: s(prov.center.y) - s(55),
                  zIndex: 20, pointerEvents: 'none',
                }}>
                  <SpecialToken type={provState.special_token} size={Math.max(s(36), 14)} />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Land Borders */}
        {BORDERS_DATA.filter(b => b.type === 'land').map(border => {
          const borderState = gameState.borders?.[border.id];
          const hasCombat = borderState?.combat_token;
          const isClickable = canInteract && selectedToken && !hasCombat;

          return (
            <React.Fragment key={`border-${border.id}`}>
              <div
                data-testid={`border-${border.id}`}
                onClick={() => isClickable && onBorderClick(border.id)}
                style={{
                  position: 'absolute', left: s(border.point.x) - s(18), top: s(border.point.y) - s(18),
                  width: s(36), height: s(36), borderRadius: '50%',
                  cursor: isClickable ? 'pointer' : 'default', zIndex: 12,
                  backgroundColor: isClickable ? 'rgba(196,30,58,0.2)' : 'transparent',
                  border: isClickable ? '1px dashed rgba(196,30,58,0.4)' : 'none',
                }}
                title={`Border: ${border.provinces.join(' <> ')}`}
              />
              {hasCombat && (
                <div style={{
                  position: 'absolute',
                  left: s(border.point.x) - tokenSize / 2,
                  top: s(border.point.y) - tokenSize / 2,
                  zIndex: 15, pointerEvents: 'none',
                }}>
                  <CombatToken
                    token={hasCombat}
                    color={hasCombat.player_index !== undefined && gameState.players[hasCombat.player_index]
                      ? gameState.players[hasCombat.player_index].color : 'Gray'}
                    faceUp={hasCombat.face_up}
                    size={tokenSize}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Sea Borders */}
        {BORDERS_DATA.filter(b => b.type === 'sea').map(border => {
          const borderState = gameState.borders?.[border.id];
          const hasCombat = borderState?.combat_token;
          const isClickable = canInteract && selectedToken && !hasCombat;

          return (
            <React.Fragment key={`sea-border-${border.id}`}>
              <div
                data-testid={`sea-border-${border.id}`}
                onClick={() => isClickable && onBorderClick(border.id)}
                style={{
                  position: 'absolute', left: s(border.point.x) - s(14), top: s(border.point.y) - s(14),
                  width: s(28), height: s(28), borderRadius: '50%',
                  cursor: isClickable ? 'pointer' : 'default', zIndex: 12,
                  backgroundColor: isClickable ? 'rgba(96,165,250,0.2)' : 'transparent',
                }}
              />
              {hasCombat && (
                <div style={{
                  position: 'absolute',
                  left: s(border.point.x) - tokenSize / 2,
                  top: s(border.point.y) - tokenSize / 2,
                  zIndex: 15, pointerEvents: 'none',
                }}>
                  <CombatToken
                    token={hasCombat}
                    color={hasCombat.player_index !== undefined && gameState.players[hasCombat.player_index]
                      ? gameState.players[hasCombat.player_index].color : 'Gray'}
                    faceUp={hasCombat.face_up}
                    size={tokenSize}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Sea area for navy */}
        {canInteract && selectedToken && (selectedToken.type === 'navy' || selectedToken.type === 'bluff') && (
          <div
            data-testid="sea-area"
            onClick={onSeaClick}
            style={{
              position: 'absolute', left: s(SEA_RECT.x1), top: s(SEA_RECT.y1),
              width: s(SEA_RECT.x2 - SEA_RECT.x1), height: s(SEA_RECT.y2 - SEA_RECT.y1),
              backgroundColor: 'rgba(96,165,250,0.08)', border: '2px dashed rgba(96,165,250,0.3)',
              borderRadius: '4px', cursor: 'pointer', zIndex: 8,
            }}
          />
        )}
      </div>
    </div>
  );
}
