import React, { useState } from 'react';
import { Crown, MapPin, Star, Shield, Eye, ChevronRight, Scroll } from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';

const CLAN_LABELS = {
  crab: 'Crab', crane: 'Crane', dragon: 'Dragon', lion: 'Lion',
  phoenix: 'Phoenix', scorpion: 'Scorpion', unicorn: 'Unicorn',
};

const CLAN_ABILITIES = {
  crab: 'Face-up control tokens have +2 defense instead of +1.',
  crane: 'When tied in battle, you win instead.',
  dragon: 'Draw 1 additional combat token, return 1 non-bluff token.',
  lion: 'Bluff token has +2 defense and is not discarded when defending.',
  phoenix: 'Ignore clan capital defenses when attacking.',
  scorpion: 'Once per round, look at one combat token on the board.',
  unicorn: 'Before reveal, switch positions of two of your combat tokens.',
};

const TERRITORY_LABELS = {
  shadowland_bottom: 'Shadowlands (South)',
  shadowland_top: 'Shadowlands (North)',
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

export default function StatusPanel({ gameState, myPlayerIndex, isHost, sendAction }) {
  const [expandedClan, setExpandedClan] = useState(null);
  const [showLog, setShowLog] = useState(false);

  const isResolution = gameState.phase === 'resolution';
  const canProceed = isHost && isResolution;

  return (
    <div className="w-72 bg-[#161618] border-r border-white/5 flex flex-col shrink-0 overflow-hidden" data-testid="status-panel">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Turn indicator */}
          {gameState.status === 'playing' && (
            <div className="glass-panel rounded-sm p-3">
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-1">Current Turn</div>
              {gameState.players[gameState.current_turn_index] && (
                <div className={`font-heading text-lg font-bold clan-${gameState.players[gameState.current_turn_index].clan}`}>
                  {CLAN_LABELS[gameState.players[gameState.current_turn_index].clan] || 'Unknown'}
                </div>
              )}
              {gameState.current_turn_index === myPlayerIndex && (
                <div className="text-xs text-[#D4AF37] mt-1 font-bold pulse-active inline-block px-2 py-0.5 rounded">YOUR TURN</div>
              )}
            </div>
          )}

          {/* Setup info */}
          {gameState.status === 'setup' && (
            <div className="glass-panel rounded-sm p-3">
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-1">Setup Phase</div>
              <p className="text-xs text-[#F5F5F0]">Place control tokens in empty provinces.</p>
              {gameState.players[gameState.current_turn_index] && (
                <p className="text-xs text-[#D4AF37] mt-1 font-bold">
                  {gameState.current_turn_index === myPlayerIndex ? 'Your turn!' : `${CLAN_LABELS[gameState.players[gameState.current_turn_index].clan]}'s turn`}
                </p>
              )}
            </div>
          )}

          {/* Upkeep phase - territory card playing */}
          {gameState.phase === 'upkeep' && myPlayerIndex >= 0 && (
            <div className="glass-panel rounded-sm p-3">
              <div className="text-[10px] text-[#60A5FA] uppercase tracking-wider font-bold mb-1">Upkeep Phase</div>
              <p className="text-xs text-[#F5F5F0] mb-2">Play territory cards or pass.</p>
              {gameState.current_turn_index === myPlayerIndex && (
                <button
                  data-testid="pass-territory-btn"
                  onClick={() => sendAction({ action: 'pass_territory_card' })}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-[#A1A1AA] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Pass
                </button>
              )}
            </div>
          )}

          {/* Proceed button for resolution */}
          {canProceed && (
            <button
              data-testid="proceed-btn"
              onClick={() => sendAction({ action: 'proceed' })}
              className="w-full py-3 bg-[#C41E3A] text-white font-bold uppercase tracking-wider rounded-sm hover:bg-[#A01830] transition-colors shadow-lg animate-scale-in"
            >
              <ChevronRight className="w-4 h-4 inline mr-1" />
              {!gameState.resolution_revealed ? 'Reveal Tokens' :
               gameState.resolution_step === 0 ? 'Resolve Battles' : 'Next Round'}
            </button>
          )}

          {/* Players */}
          <div>
            <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-2 px-1">Players</div>
            <div className="space-y-1.5">
              {gameState.players?.map((player, idx) => (
                <div
                  key={idx}
                  data-testid={`player-status-${idx}`}
                  onClick={() => setExpandedClan(expandedClan === idx ? null : idx)}
                  className={`glass-panel rounded-sm p-2.5 cursor-pointer hover:border-white/20 transition-all ${
                    idx === gameState.current_turn_index ? 'border-[#D4AF37]/30' : ''
                  } ${idx === myPlayerIndex ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getClanColorHex(player.clan) }} />
                      <span className={`font-heading text-sm font-bold clan-${player.clan}`}>
                        {CLAN_LABELS[player.clan] || player.username}
                      </span>
                      {idx === gameState.first_player_index && <Crown className="w-3 h-3 text-[#D4AF37]" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="flex items-center gap-0.5 text-[#D4AF37]">
                        <Star className="w-3 h-3" /> {player.live_honor || 0}
                      </span>
                      <span className="flex items-center gap-0.5 text-[#A1A1AA]">
                        <MapPin className="w-3 h-3" /> {player.provinces_controlled || 0}
                      </span>
                    </div>
                  </div>

                  {/* Expanded info */}
                  {expandedClan === idx && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-xs space-y-1 animate-fade-in-up">
                      <p className="text-[#A1A1AA]">Hand: {player.hand_count || 0} tokens</p>
                      <p className="text-[#A1A1AA]">Pool: {player.token_pool_count || 0} remaining</p>
                      <p className="text-[#A1A1AA]">Scout: {player.scout_cards}, Shugenja: {player.shugenja_cards}</p>
                      {player.is_ronin && <p className="text-[#F57C00] font-bold">RONIN</p>}
                      {player.clan && (
                        <p className="text-[#A1A1AA] italic mt-1">{CLAN_ABILITIES[player.clan]}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Territory Cards */}
          <div>
            <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-2 px-1 flex items-center gap-1">
              <Scroll className="w-3 h-3" /> Territory Cards
            </div>
            <div className="space-y-1">
              {gameState.territories && Object.entries(gameState.territories).map(([tid, terr]) => {
                const isOwner = terr.card_owner === myPlayerIndex;
                const canPlay = isOwner && !terr.card_used && (gameState.phase === 'upkeep' || gameState.phase === 'placement');
                return (
                  <div key={tid} className={`px-2 py-1.5 bg-white/5 rounded-sm text-xs ${canPlay ? 'hover:bg-white/10 cursor-pointer' : ''}`}
                    onClick={() => canPlay && sendAction({ action: 'play_territory_card', territory_id: tid })}
                    data-testid={`territory-card-${tid}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA]">{TERRITORY_LABELS[tid] || tid}</span>
                      <span className={`font-bold ${
                        terr.card_used ? 'text-[#A1A1AA] line-through' :
                        terr.card_owner !== null ? `clan-${gameState.players[terr.card_owner]?.clan}` :
                        'text-[#A1A1AA]'
                      }`}>
                        {terr.card_used ? 'Used' :
                         terr.card_owner !== null ? CLAN_LABELS[gameState.players[terr.card_owner]?.clan] || 'Claimed' :
                         'Free'}
                      </span>
                    </div>
                    {isOwner && terr.card && !terr.card_used && (
                      <div className="mt-1 text-[10px] text-[#D4AF37]">{terr.card.name}</div>
                    )}
                    {canPlay && (
                      <div className="mt-1 text-[9px] text-[#C41E3A] font-bold uppercase">Click to play</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Log */}
          <div>
            <button
              onClick={() => setShowLog(!showLog)}
              className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold px-1 flex items-center gap-1 hover:text-white transition-colors"
              data-testid="toggle-log"
            >
              <Eye className="w-3 h-3" /> Game Log {showLog ? '(hide)' : '(show)'}
            </button>
            {showLog && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {gameState.log?.slice().reverse().map((entry, idx) => (
                  <p key={idx} className="text-[10px] text-[#A1A1AA] px-2 py-1 bg-white/3 rounded">{entry}</p>
                ))}
              </div>
            )}
          </div>

          {/* Scores (end game) */}
          {gameState.scores && (
            <div className="glass-panel rounded-sm p-3">
              <div className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold mb-2">Final Scores</div>
              {gameState.scores.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className={`font-heading font-bold clan-${score.clan}`}>{idx + 1}. {CLAN_LABELS[score.clan]}</span>
                  <span className="text-[#D4AF37] font-bold">{score.honor} Honor</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function getClanColorHex(clan) {
  const colors = {
    crab: '#9CA3AF', crane: '#60A5FA', dragon: '#34D399', lion: '#FBBF24',
    phoenix: '#FB923C', scorpion: '#F87171', unicorn: '#A78BFA',
  };
  return colors[clan] || '#666';
}
