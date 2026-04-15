import React, { useState, useEffect } from 'react';
import { X, Eye, Flame, Search } from 'lucide-react';

const CLAN_LABELS = {
  crab: 'Crab', crane: 'Crane', dragon: 'Dragon', lion: 'Lion',
  phoenix: 'Phoenix', scorpion: 'Scorpion', unicorn: 'Unicorn',
};

// Full-screen calligraphy modal for Scout/Shugenja/Scorpion abilities
export function AbilityModal({ type, isOpen, onClose, result, actorClan }) {
  const [phase, setPhase] = useState('intro'); // intro -> result -> done

  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      const t1 = setTimeout(() => setPhase('result'), 1500);
      const t2 = setTimeout(() => setPhase('done'), 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const imgSrc = type === 'scout' ? '/assets/scout.png'
    : type === 'shugenja' ? '/assets/shugenja.png'
    : '/assets/scorpion.png';

  const title = type === 'scout' ? 'Scout Deployed'
    : type === 'shugenja' ? 'Shugenja Invoked'
    : 'Scorpion Spy';

  const subtitle = type === 'scout' ? 'A hidden token has been observed...'
    : type === 'shugenja' ? 'A token has been revealed and destroyed!'
    : 'The shadows reveal their secrets...';

  const tokenInfo = result?.token;
  const ownerClan = tokenInfo?.player_index !== undefined
    ? CLAN_LABELS[actorClan] || 'Unknown'
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" data-testid={`ability-modal-${type}`}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={phase === 'done' ? onClose : undefined} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        {/* Calligraphy image with dramatic entrance */}
        <div className={`transition-all duration-1000 ease-out ${
          phase === 'intro' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <div className="relative">
            <img
              src={imgSrc}
              alt={title}
              className="w-48 h-48 object-contain mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {/* Glow ring */}
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              phase !== 'intro' ? 'animate-pulse opacity-30' : 'opacity-0'
            }`} style={{
              background: type === 'shugenja'
                ? 'radial-gradient(circle, rgba(196,30,58,0.3) 0%, transparent 70%)'
                : type === 'scorpion'
                  ? 'radial-gradient(circle, rgba(248,113,113,0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)',
            }} />
          </div>
        </div>

        {/* Title */}
        <h2 className={`font-heading text-3xl font-black mt-6 transition-all duration-700 delay-300 ${
          phase === 'intro' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`} style={{
          color: type === 'shugenja' ? '#C41E3A' : type === 'scorpion' ? '#F87171' : '#60A5FA',
        }}>
          {title}
        </h2>

        <p className={`text-[#A1A1AA] text-sm mt-2 transition-all duration-700 delay-500 ${
          phase === 'intro' ? 'opacity-0' : 'opacity-100'
        }`}>
          {subtitle}
        </p>

        {/* Token result */}
        {tokenInfo && phase !== 'intro' && (
          <div className={`mt-6 glass-panel rounded-sm p-5 text-center transition-all duration-500 delay-700 ${
            phase === 'result' || phase === 'done' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            {type === 'scout' || type === 'scorpion' ? (
              <>
                <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2">Token Observed</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center">
                    <span className="text-[#D4AF37] font-bold text-lg uppercase">
                      {tokenInfo.type?.charAt(0)}{tokenInfo.strength > 0 ? tokenInfo.strength : ''}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-[#F5F5F0] font-bold capitalize">{tokenInfo.type} {tokenInfo.strength > 0 ? tokenInfo.strength : ''}</div>
                    <div className="text-xs text-[#A1A1AA]">Only you can see this</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-[#C41E3A] uppercase tracking-wider mb-2 font-bold">Token Destroyed</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#C41E3A]/20 border-2 border-[#C41E3A] flex items-center justify-center line-through">
                    <span className="text-[#C41E3A] font-bold text-lg uppercase">
                      {tokenInfo.type?.charAt(0)}{tokenInfo.strength > 0 ? tokenInfo.strength : ''}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-[#F5F5F0] font-bold capitalize">{tokenInfo.type} {tokenInfo.strength > 0 ? tokenInfo.strength : ''}</div>
                    <div className="text-xs text-[#C41E3A]">Revealed to all players</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Close button */}
        {phase === 'done' && (
          <button
            onClick={onClose}
            data-testid="ability-modal-close"
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors text-sm font-bold uppercase tracking-wider"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

// Ability buttons for the player hand area
export function AbilityButtons({ player, gameState, myPlayerIndex, onUseScout, onUseShugenja, onUseScorpionAbility }) {
  const isMyTurn = myPlayerIndex === gameState.current_turn_index;
  const isPlacement = gameState.phase === 'placement';
  const canAct = isMyTurn && isPlacement;

  return (
    <div className="flex gap-2 shrink-0">
      {player.scout_cards > 0 && (
        <button
          data-testid="use-scout-btn"
          onClick={onUseScout}
          disabled={!canAct}
          className={`glass-panel rounded-sm px-3 py-2 text-center transition-all ${
            canAct ? 'hover:border-[#60A5FA]/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Search className="w-4 h-4 text-[#60A5FA] mx-auto mb-1" />
          <div className="text-[10px] text-[#60A5FA] uppercase font-bold">Scout</div>
          <div className="text-sm font-bold text-white">{player.scout_cards}</div>
        </button>
      )}
      {player.shugenja_cards > 0 && (
        <button
          data-testid="use-shugenja-btn"
          onClick={onUseShugenja}
          disabled={!canAct}
          className={`glass-panel rounded-sm px-3 py-2 text-center transition-all ${
            canAct ? 'hover:border-[#C41E3A]/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Flame className="w-4 h-4 text-[#C41E3A] mx-auto mb-1" />
          <div className="text-[10px] text-[#C41E3A] uppercase font-bold">Shugenja</div>
          <div className="text-sm font-bold text-white">{player.shugenja_cards}</div>
        </button>
      )}
      {player.clan === 'scorpion' && !player.scorpion_ability_used && (
        <button
          data-testid="use-scorpion-btn"
          onClick={onUseScorpionAbility}
          disabled={!canAct}
          className={`glass-panel rounded-sm px-3 py-2 text-center transition-all ${
            canAct ? 'hover:border-[#F87171]/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Eye className="w-4 h-4 text-[#F87171] mx-auto mb-1" />
          <div className="text-[10px] text-[#F87171] uppercase font-bold">Spy</div>
          <div className="text-sm font-bold text-white">1</div>
        </button>
      )}
    </div>
  );
}
