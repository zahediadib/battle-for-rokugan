import React from 'react';
import { Swords, X } from 'lucide-react';
import { HandToken } from './TokenImages';

const TOKEN_TYPE_LABELS = {
  army: 'Army', navy: 'Navy', shinobi: 'Shinobi',
  diplomacy: 'Diplomacy', raid: 'Raid', blessing: 'Blessing', bluff: 'Bluff',
};

export default function PlayerHand({ player, gameState, selectedToken, onTokenSelect, onCancelSelection }) {
  const hand = player?.hand || [];
  const myIdx = gameState.players?.findIndex(p => p.user_id === player?.user_id);
  const isMyTurn = myIdx === gameState.current_turn_index;
  const canPlace = isMyTurn && gameState.phase === 'placement';
  const objectiveId = player?.secret_objective;

  return (
    <div className="h-28 bg-[#161618] border-t border-white/5 px-4 py-2 flex items-center gap-4 shrink-0" data-testid="player-hand">
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className="text-xs text-[#A1A1AA] uppercase tracking-wider font-bold mr-2 shrink-0">
          <Swords className="w-4 h-4 inline mb-0.5 mr-1" />
          Hand ({hand.length})
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {hand.map((token, idx) => (
            <HandToken
              key={token.id || idx}
              token={token}
              color={player.color}
              size={76}
              selected={selectedToken?.id === token.id}
              onClick={() => canPlace && onTokenSelect(token)}
              disabled={!canPlace}
            />
          ))}
        </div>
      </div>

      {selectedToken && (
        <div className="shrink-0 glass-panel rounded-sm p-3 flex items-center gap-3 animate-scale-in">
          <div className="text-sm">
            <span className="text-[#D4AF37] font-bold">{TOKEN_TYPE_LABELS[selectedToken.type]} {selectedToken.strength > 0 ? selectedToken.strength : ''}</span>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5">Click province or border to place</p>
          </div>
          <button onClick={onCancelSelection} className="p-1 hover:bg-white/10 rounded" data-testid="cancel-selection">
            <X className="w-4 h-4 text-[#F87171]" />
          </button>
        </div>
      )}

      {objectiveId && (
        <div className="shrink-0 glass-panel rounded-sm p-3 max-w-44" data-testid="secret-objective">
          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-1">Secret Objective</div>
          <div className="text-xs text-[#D4AF37] font-bold capitalize">{objectiveId.replace(/_/g, ' ')}</div>
        </div>
      )}

      <div className="shrink-0 flex gap-2">
        {player.scout_cards > 0 && (
          <div className="glass-panel rounded-sm px-3 py-2 text-center" data-testid="scout-cards">
            <div className="text-[10px] text-[#60A5FA] uppercase font-bold">Scout</div>
            <div className="text-lg font-bold text-white">{player.scout_cards}</div>
          </div>
        )}
        {player.shugenja_cards > 0 && (
          <div className="glass-panel rounded-sm px-3 py-2 text-center" data-testid="shugenja-cards">
            <div className="text-[10px] text-[#F87171] uppercase font-bold">Shugenja</div>
            <div className="text-lg font-bold text-white">{player.shugenja_cards}</div>
          </div>
        )}
      </div>
    </div>
  );
}
