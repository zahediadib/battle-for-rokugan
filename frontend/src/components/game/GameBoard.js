import React, { useEffect, useRef, useState, useMemo } from 'react';
import { CombatToken, ControlToken, SpecialToken } from './TokenImages';
import { BOARD_W, BOARD_H, SEA_RECT, CLANS } from '../../constants/gameConstants';

const PROVINCES_DATA = [
  { id: "shadowland_bottom", center: { x: 672, y: 342 } }, { id: "shadowland_top", center: { x: 1363, y: 180 } },
  { id: "crab_1", center: { x: 2047, y: 291 } }, { id: "crab_2", center: { x: 1467, y: 664 } },
  { id: "crab_3", center: { x: 881, y: 775 } }, { id: "crab_4", center: { x: 1960, y: 746 } },
  { id: "wind_1", center: { x: 937, y: 990 } }, { id: "wind_2", center: { x: 1540, y: 1023 } },
  { id: "wind_3", center: { x: 1529, y: 1339 } }, { id: "crane_1", center: { x: 1854, y: 1200 } },
  { id: "crane_2", center: { x: 2075, y: 1396 } }, { id: "crane_3", center: { x: 2307, y: 1550 } },
  { id: "lion_1", center: { x: 2645, y: 1589 } }, { id: "lion_2", center: { x: 2508, y: 1294 } },
  { id: "lion_3", center: { x: 2910, y: 956 } }, { id: "scorpion_1", center: { x: 2142, y: 1081 } },
  { id: "scorpion_2", center: { x: 2491, y: 924 } }, { id: "scorpion_3", center: { x: 2399, y: 554 } },
  { id: "unicorn_1", center: { x: 2745, y: 332 } }, { id: "unicorn_2", center: { x: 3071, y: 446 } },
  { id: "unicorn_3", center: { x: 2799, y: 696 } }, { id: "dragon_1", center: { x: 3341, y: 716 } },
  { id: "dragon_2", center: { x: 3134, y: 1201 } }, { id: "dragon_3", center: { x: 2840, y: 1330 } },
  { id: "phoenix_1", center: { x: 3221, y: 1851 } }, { id: "phoenix_2", center: { x: 3263, y: 1711 } },
  { id: "phoenix_3", center: { x: 3238, y: 1526 } }, { id: "island_1", center: { x: 775, y: 1551 } },
  { id: "island_2", center: { x: 748, y: 1807 } }, { id: "island_3", center: { x: 1196, y: 1913 } },
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

export default function GameBoard({
  gameState, myPlayerIndex, selectedToken, sourceProvince, placementStep,
  onProvinceClick, onBorderClick, onSeaClick, abilityMode, blessingMode,
  onCombatTokenClick, unicornSwitchMode, unicornSelectedTokens = [],
  tokenAnimationByKey = {}, tokenMovementByKey = {}, highlightedTokenKey = null,
  highlightTone = 'blue', shugenjaBlastKey = null,
}) {
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
  const canInteract = (isMyTurn && (isPlacement || isSetup)) || abilityMode || blessingMode;

  // Token sizes: 2x base
  const tokenSize = Math.max(s(72), 24);
  const controlSize = Math.max(s(50), 16);
  // Direction pointer: 3x
  const pointerSize = Math.max(s(30), 10);

  const provinceInfo = useMemo(() => {
    const info = {};
    PROVINCES_DATA.forEach(p => {
      const ps = gameState.provinces?.[p.id];
      const ci = ps?.controlled_by;
      const clan = ci !== null && ci !== undefined && gameState.players[ci] ? gameState.players[ci].clan : null;
      info[p.id] = { ...p, controllerClan: clan, controllerColor: clan ? CLANS[clan]?.color : null, provState: ps };
    });
    return info;
  }, [gameState]);

  const selectedTokenKeys = useMemo(
    () => new Set(unicornSelectedTokens.map(t => `${t.location.type}:${t.location.id}:${t.token.id}`)),
    [unicornSelectedTokens]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    Object.entries(tokenMovementByKey || {}).forEach(([key, delta]) => {
      if (!delta) return;
      const el = containerRef.current.querySelector(`[data-token-key="${key}"]`);
      if (!el) return;
      try {
        el.animate(
          [{ transform: `translate(${delta.x}px, ${delta.y}px)` }, { transform: 'translate(0px, 0px)' }],
          { duration: 520, easing: 'cubic-bezier(.16,.84,.44,1)', fill: 'both' }
        );
      } catch (_) {}
    });
  }, [tokenMovementByKey]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto flex items-center justify-center bg-[#0A0A0A] relative" data-testid="game-board">
      <div style={{ width: s(BOARD_W), height: s(BOARD_H), position: 'relative' }} className="shrink-0">
        <img src="/assets/board.png" alt="Battle Map" style={{ width: '100%', height: '100%' }} className="select-none pointer-events-none" draggable={false} />

        {/* Provinces */}
        {PROVINCES_DATA.map(prov => {
          const info = provinceInfo[prov.id];
          const provState = info?.provState;
          const isSource = sourceProvince === prov.id;
          const showClickable = canInteract || !selectedToken;

          return (
            <React.Fragment key={prov.id}>
              {info?.controllerColor && (
                <div style={{
                  position: 'absolute', left: s(prov.center.x) - s(40), top: s(prov.center.y) - s(40),
                  width: s(80), height: s(80), borderRadius: '50%',
                  backgroundColor: info.controllerColor, opacity: 0.18, pointerEvents: 'none',
                }} />
              )}

              <div data-testid={`province-${prov.id}`}
                onClick={() => onProvinceClick(prov.id)}
                style={{
                  position: 'absolute', left: s(prov.center.x) - s(50), top: s(prov.center.y) - s(50),
                  width: s(100), height: s(100), borderRadius: '50%',
                   cursor: 'pointer', zIndex: 10,
                   border: isSource ? '3px solid #D4AF37' : abilityMode ? '2px dashed rgba(196,30,58,0.4)' : blessingMode ? '2px dashed rgba(212,175,55,0.4)' : 'none',
                   backgroundColor: isSource ? 'rgba(212,175,55,0.2)' : 'transparent',
                   userSelect: 'none',
                 }}
                className="province-clickable"
                title={prov.id}
              />

              {/* Control tokens */}
              {provState?.control_tokens?.map((ct, idx) => {
                const count = provState.control_tokens.length;
                const angle = (idx / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
                const r = count > 1 ? 30 : 0;
                return (
                  <div key={`ct-${prov.id}-${idx}`} style={{
                    position: 'absolute',
                    left: s(prov.center.x + Math.cos(angle) * r) - controlSize / 2,
                    top: s(prov.center.y + Math.sin(angle) * r) - controlSize / 2,
                    zIndex: 5, pointerEvents: 'none',
                  }} className={tokenAnimationByKey[`control:${prov.id}`] || tokenAnimationByKey[`control:${prov.id}:${idx}`] || ''}>
                    <ControlToken ct={ct} players={gameState.players} size={controlSize} />
                  </div>
                );
              })}

              {/* Combat tokens in province */}
              {provState?.combat_tokens?.map((ct, idx) => {
                const count = provState.combat_tokens.length;
                const angle = ((idx + 1) / (count + 1)) * Math.PI * 2 - Math.PI / 2;
                const r = 50;
                const playerColor = ct.player_index !== undefined && gameState.players[ct.player_index]
                  ? gameState.players[ct.player_index].color : 'Gray';
                const isOwnToken = ct.player_index === myPlayerIndex && ct.type !== 'hidden';
                const isClickableForBlessing = blessingMode && isOwnToken;
                const isClickableForInfo = isOwnToken && !isClickableForBlessing;
                const selectedKey = `province:${prov.id}:${ct.id}`;
                const isSelectedForUnicorn = selectedTokenKeys.has(selectedKey);
                const isHighlighted = highlightedTokenKey === selectedKey;
                const isBlast = shugenjaBlastKey === selectedKey;
                const animClass = tokenAnimationByKey[selectedKey] || '';
                return (
                  <div key={`combat-${prov.id}-${idx}`} style={{
                    position: 'absolute',
                    left: s(prov.center.x + Math.cos(angle) * r) - tokenSize / 2,
                    top: s(prov.center.y + Math.sin(angle) * r) - tokenSize / 2,
                    zIndex: 15, pointerEvents: (isClickableForBlessing || isClickableForInfo) ? 'auto' : 'none',
                    cursor: (isClickableForBlessing || isClickableForInfo) ? 'pointer' : 'default',
                    userSelect: 'none',
                  }} onClick={() => {
                    if (isClickableForBlessing) onProvinceClick(prov.id);
                    else if (isClickableForInfo && onCombatTokenClick) onCombatTokenClick({ token: ct, location: { type: 'province', id: prov.id } });
                  }} data-token-key={selectedKey}
                    className={`${animClass} ${isBlast ? 'animate-shugenja-blast' : ''}`}>
                    <CombatToken token={ct} color={playerColor} faceUp={ct.face_up} size={tokenSize} />
                    {isClickableForBlessing && (
                      <div style={{
                        position: 'absolute', inset: -3, borderRadius: '50%',
                        border: '2px dashed #D4AF37', animation: 'pulse-gold 1.5s ease-in-out infinite',
                      }} />
                    )}
                    {unicornSwitchMode && isSelectedForUnicorn && (
                      <div style={{
                        position: 'absolute', inset: -3, borderRadius: '50%',
                        border: '2px solid #A78BFA', boxShadow: '0 0 10px rgba(167,139,250,0.75)',
                      }} />
                    )}
                    {isHighlighted && (
                      <div className={highlightTone === 'red' ? 'token-highlight-red' : 'token-highlight-blue'} style={{ position: 'absolute', inset: -4 }} />
                    )}
                  </div>
                );
              })}

              {/* Special token */}
              {provState?.special_token && (
                <div style={{
                  position: 'absolute', left: s(prov.center.x) - s(22), top: s(prov.center.y) - s(65),
                  zIndex: 20, pointerEvents: 'none',
                }}>
                  <SpecialToken type={provState.special_token} size={Math.max(s(88), 36)} />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* All Borders (land + sea) */}
        {BORDERS_DATA.map(border => {
          const borderState = gameState.borders?.[border.id];
          const hasCombat = borderState?.combat_token;
          const isClickable = canInteract && !hasCombat && selectedToken;
          const isAbilityTarget = abilityMode && hasCombat;
          const isBlessingTarget = blessingMode && hasCombat && hasCombat.player_index === myPlayerIndex;
          const isOwnToken = hasCombat && hasCombat.player_index === myPlayerIndex && hasCombat.type !== 'hidden';
          const selectedKey = hasCombat ? `border:${border.id}:${hasCombat.id}` : null;
          const isSelectedForUnicorn = selectedKey ? selectedTokenKeys.has(selectedKey) : false;

          // Direction pointer: based on isUpDown and which province the attacker controls
          let pointerDir = null; // 'top' | 'bottom' | 'left' | 'right'
          const showPointer = !!hasCombat;
          if (showPointer) {
            const p1id = border.provinces[0];
            const p2id = border.provinces[1];
            const p1Controlled = gameState.provinces?.[p1id]?.controlled_by === hasCombat.player_index;
            // Provinces are sorted: first is "Up" or "Left", second is "Down" or "Right"
            if (border.isUpDown) {
              pointerDir = p1Controlled ? 'bottom' : 'top'; // Attacking from p1 (up) to p2 (down)
            } else {
              pointerDir = p1Controlled ? 'right' : 'left'; // Attacking from p1 (left) to p2 (right)
            }
          }
          const ownerClan = hasCombat?.player_index !== undefined ? gameState.players?.[hasCombat.player_index]?.clan : null;
          const pointerColor = ownerClan ? (CLANS[ownerClan]?.color || '#D4AF37') : '#D4AF37';
          const borderTokenKey = hasCombat ? `border:${border.id}:${hasCombat.id}` : null;
          const isHighlightedBorder = highlightedTokenKey === borderTokenKey;
          const isBlastBorder = shugenjaBlastKey === borderTokenKey;
          const borderAnimClass = borderTokenKey ? (tokenAnimationByKey[borderTokenKey] || '') : '';

          return (
            <React.Fragment key={`border-${border.id}`}>
              {/* Clickable area */}
              <div data-testid={`border-${border.id}`}
                onClick={() => {
                  if (isBlessingTarget) onBorderClick(border.id);
                  else if (isAbilityTarget) onBorderClick(border.id);
                  else if (isClickable) onBorderClick(border.id);
                }}
                style={{
                  position: 'absolute', left: s(border.point.x) - s(22), top: s(border.point.y) - s(22),
                  width: s(44), height: s(44), borderRadius: '50%',
                  cursor: (isClickable || isAbilityTarget || isBlessingTarget) ? 'pointer' : 'default', zIndex: 12,
                  backgroundColor: isAbilityTarget ? 'rgba(196,30,58,0.25)' : isBlessingTarget ? 'rgba(212,175,55,0.25)' : isClickable ? 'rgba(196,30,58,0.12)' : 'transparent',
                  border: isClickable ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                  userSelect: 'none',
                }}
              />

              {/* Combat token on border */}
              {hasCombat && (
                <div style={{
                  position: 'absolute',
                  left: s(border.point.x) - tokenSize / 2,
                  top: s(border.point.y) - tokenSize / 2,
                  zIndex: 15,
                  pointerEvents: (isAbilityTarget || isBlessingTarget || isOwnToken) ? 'auto' : 'none',
                  cursor: (isAbilityTarget || isBlessingTarget || isOwnToken) ? 'pointer' : 'default',
                  userSelect: 'none',
                }} onClick={() => {
                  if (isAbilityTarget || isBlessingTarget) onBorderClick(border.id);
                  else if (isOwnToken && onCombatTokenClick) onCombatTokenClick({ token: hasCombat, location: { type: 'border', id: border.id } });
                }} data-token-key={borderTokenKey || undefined}
                  className={`${borderAnimClass} ${isBlastBorder ? 'animate-shugenja-blast' : ''}`}>
                  <CombatToken
                    token={hasCombat}
                    color={hasCombat.player_index !== undefined && gameState.players[hasCombat.player_index] ? gameState.players[hasCombat.player_index].color : 'Gray'}
                    faceUp={hasCombat.face_up} size={tokenSize}
                  />
                  {/* Direction pointer - 3x size, positioned at top/bottom/left/right */}
                  {pointerDir && (
                    <div style={{
                      position: 'absolute',
                      ...(pointerDir === 'top' ? { top: -Math.max(pointerSize * 0.45, 4), left: '50%', transform: 'translateX(-50%)' } :
                         pointerDir === 'bottom' ? { bottom: -Math.max(pointerSize * 0.45, 4), left: '50%', transform: 'translateX(-50%) rotate(180deg)' } :
                         pointerDir === 'left' ? { left: -Math.max(pointerSize * 0.45, 4), top: '50%', transform: 'translateY(-50%) rotate(-90deg)' } :
                         { right: -Math.max(pointerSize * 0.45, 4), top: '50%', transform: 'translateY(-50%) rotate(90deg)' }),
                      width: 0, height: 0,
                      borderLeft: `${pointerSize * 0.5}px solid transparent`,
                      borderRight: `${pointerSize * 0.5}px solid transparent`,
                      borderBottom: `${pointerSize}px solid ${pointerColor}`,
                      filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.6))',
                    }} />
                  )}
                  {isBlessingTarget && (
                    <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px dashed #D4AF37' }} />
                  )}
                  {unicornSwitchMode && isSelectedForUnicorn && (
                    <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid #A78BFA', boxShadow: '0 0 10px rgba(167,139,250,0.75)' }} />
                  )}
                  {isHighlightedBorder && (
                    <div className={highlightTone === 'red' ? 'token-highlight-red' : 'token-highlight-blue'} style={{ position: 'absolute', inset: -4 }} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Sea clickable area */}
        {selectedToken && !blessingMode && !abilityMode && (
          <div data-testid="sea-area" onClick={onSeaClick}
            style={{
              position: 'absolute', left: s(SEA_RECT.x1), top: s(SEA_RECT.y1),
              width: s(SEA_RECT.x2 - SEA_RECT.x1), height: s(SEA_RECT.y2 - SEA_RECT.y1),
              backgroundColor: sourceProvince === 'sea' ? 'rgba(96,165,250,0.2)' : 'rgba(96,165,250,0.06)',
              border: sourceProvince === 'sea' ? '2px solid rgba(96,165,250,0.5)' : '2px dashed rgba(96,165,250,0.2)',
              borderRadius: '4px', cursor: 'pointer', zIndex: 8,
              userSelect: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
