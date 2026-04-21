import React, { useState } from 'react';

const CLAN_HEX = {
  Gray: '#9CA3AF', Blue: '#60A5FA', Green: '#34D399', Yellow: '#FBBF24',
  Orange: '#FB923C', Red: '#F87171', Purple: '#A78BFA',
};

const TYPE_SYMBOLS = {
  army: 'A', navy: 'N', shinobi: 'S', diplomacy: 'D',
  raid: 'R', blessing: 'B', bluff: '?', hidden: '?',
};

const SPECIAL_COLORS = {
  peace: '#60A5FA', scorched_earth: '#F87171', shrine: '#D4AF37',
  battlefield: '#9CA3AF', harbor: '#34D399',
};

// Combat token with image fallback
export function CombatToken({ token, color, faceUp, size, style, className }) {
  const [imgError, setImgError] = useState(false);

  const folder = color || 'Gray';
  let src;
  if (!faceUp || token.type === 'hidden') {
    src = `/assets/combat/${folder}/back.png`;
  } else if (token.type === 'bluff') {
    src = `/assets/combat/${folder}/bluff.png`;
  } else if (token.type === 'diplomacy') {
    src = `/assets/combat/${folder}/diplomacy.png`;
  } else if (token.type === 'raid') {
    src = `/assets/combat/${folder}/raid.png`;
  } else if (token.type === 'blessing') {
    src = `/assets/combat/${folder}/blessing${token.strength}.png`;
  } else {
    src = `/assets/combat/${folder}/${token.type}${token.strength}.png`;
  }

  const hex = CLAN_HEX[folder] || '#666';

  if (imgError) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          backgroundColor: faceUp ? `${hex}33` : `${hex}55`,
          border: `2px solid ${hex}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 'bold', color: hex,
          ...style,
        }}
        className={className}
        title={faceUp ? `${token.type} ${token.strength}` : 'Hidden'}
      >
        {faceUp ? (TYPE_SYMBOLS[token.type] || '?') + (token.strength > 0 ? token.strength : '') : '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={faceUp ? `${token.type} ${token.strength}` : 'hidden'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${hex}`,
        boxShadow: `0 0 ${Math.max(size * 0.12, 5)}px ${hex}66`,
        ...style,
      }}
      className={className}
      onError={() => setImgError(true)}
      draggable={false}
    />
  );
}

// Control token with image fallback
export function ControlToken({ ct, players, size, style }) {
  const [imgError, setImgError] = useState(false);
  const player = players?.[ct.player_index];
  const color = player?.color || 'Gray';
  const hex = CLAN_HEX[color] || '#666';
  const src = `/assets/control/${color}/${ct.face_up ? 'front' : 'back'}.png`;

  if (imgError) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '3px',
          backgroundColor: ct.face_up ? hex : `${hex}66`,
          border: `2px solid ${hex}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.5, fontWeight: 'bold',
          color: ct.face_up ? '#0A0A0A' : '#FFF',
          ...style,
        }}
        title={`${player?.clan || 'Unknown'} control (${ct.face_up ? 'face-up' : 'face-down'})`}
      >
        {ct.face_up ? '+' : ''}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${player?.clan || 'Unknown'} control`}
      style={{
        width: size,
        height: size,
        borderRadius: '3px',
        border: `2px solid ${hex}`,
        boxShadow: `0 0 ${Math.max(size * 0.12, 5)}px ${hex}99`,
        ...style,
      }}
      onError={() => setImgError(true)}
      draggable={false}
    />
  );
}

// Special token with image fallback
export function SpecialToken({ type, size, style }) {
  const [imgError, setImgError] = useState(false);
  const nameMap = {
    scorched_earth: 'ScorchedEarth', peace: 'Peace',
    shrine: 'Shrine', battlefield: 'Battlefield', harbor: 'Harbor',
  };
  const src = `/assets/special/${nameMap[type] || type}.png`;
  const hex = SPECIAL_COLORS[type] || '#D4AF37';

  if (imgError) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '3px',
          backgroundColor: `${hex}33`, border: `2px solid ${hex}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.35, fontWeight: 'bold', color: hex,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          ...style,
        }}
        title={type}
      >
        {type === 'scorched_earth' ? 'SE' : type.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src} alt={type}
      style={{
        width: size,
        height: size,
        borderRadius: '3px',
        border: `2px solid ${hex}`,
        boxShadow: `0 0 ${Math.max(size * 0.12, 5)}px ${hex}88`,
        ...style,
      }}
      onError={() => setImgError(true)}
      draggable={false}
    />
  );
}

export function HandToken({ token, color, size, selected, onClick, disabled }) {
  const [imgError, setImgError] = useState(false);
  const folder = color || 'Gray';
  const hex = CLAN_HEX[folder] || '#666';
  let src;
  if (token.type === 'bluff') src = `/assets/combat/${folder}/bluff.png`;
  else if (token.type === 'diplomacy') src = `/assets/combat/${folder}/diplomacy.png`;
  else if (token.type === 'raid') src = `/assets/combat/${folder}/raid.png`;
  else if (token.type === 'blessing') src = `/assets/combat/${folder}/blessing${token.strength}.png`;
  else src = `/assets/combat/${folder}/${token.type}${token.strength}.png`;

  const label = `${token.type}${token.strength > 0 ? ' ' + token.strength : ''}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative shrink-0 rounded-full overflow-hidden transition-all duration-200 ${
        !disabled ? 'token-selectable' : 'opacity-60 cursor-not-allowed'
      } ${selected ? 'token-selected' : ''}`}
      style={{ width: size, height: size }}
      data-testid={`hand-token-${token.type}-${token.strength}`}
    >
      {imgError ? (
        <div
          style={{
            width: '100%', height: '100%', borderRadius: '50%',
            backgroundColor: `${hex}33`, border: `3px solid ${hex}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: size * 0.25, fontWeight: 'bold', color: hex }}>
            {TYPE_SYMBOLS[token.type]}{token.strength > 0 ? token.strength : ''}
          </span>
        </div>
      ) : (
        <img
          src={src} alt={label}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] text-center py-0.5 text-white font-bold capitalize">
        {label}
      </div>
    </button>
  );
}
