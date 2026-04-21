import React, { useState } from 'react';
import { Crown, MapPin, Star, Shield, Eye, ChevronRight, Scroll, Search, Flame, SkipForward, XCircle, FastForward, Settings, Info } from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';
import { CLANS, TERRITORY_LABELS } from '../../constants/gameConstants';

const CLAN_ABILITIES = Object.fromEntries(Object.entries(CLANS).map(([k, v]) => [k, v.ability]));
const CLAN_LABELS = Object.fromEntries(Object.entries(CLANS).map(([k, v]) => [k, v.name]));

export default function StatusPanel({
  gameState, myPlayerIndex, isHost, sendAction,
  unicornSwitchMode, unicornSelectedTokens, onUnicornSwitchStart, onUnicornSwitchCancel, onUnicornSwitchConfirm,
}) {
  const [expandedClan, setExpandedClan] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showFinalScores, setShowFinalScores] = useState(false);
  const [territoryInfo, setTerritoryInfo] = useState(null);

  const isResolution = gameState.phase === 'resolution';
  const canProceed = isHost && isResolution;
  const myPlayer = myPlayerIndex >= 0 ? gameState.players?.[myPlayerIndex] : null;
  const isUnicornTurn = gameState.phase === 'unicorn_switch' && myPlayerIndex === gameState.current_turn_index && myPlayer?.clan === 'unicorn';

  return (
    <div className="w-72 bg-[#161618] border-r border-white/5 flex flex-col shrink-0 overflow-hidden" data-testid="status-panel">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Turn indicator */}
          {gameState.status === 'playing' && (
            <div className="glass-panel rounded-sm p-3">
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-1">Current Turn</div>
              {gameState.players[gameState.current_turn_index] && (
                <div className="font-heading text-lg font-bold" style={{ color: CLANS[gameState.players[gameState.current_turn_index].clan]?.color }}>
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
                <p className="text-xs mt-1 font-bold" style={{ color: gameState.current_turn_index === myPlayerIndex ? '#D4AF37' : '#A1A1AA' }}>
                  {gameState.current_turn_index === myPlayerIndex ? 'Your turn!' : `${CLAN_LABELS[gameState.players[gameState.current_turn_index].clan]}'s turn`}
                </p>
              )}
            </div>
          )}

          {/* Upkeep phase */}
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

          {/* Unicorn switch step */}
          {gameState.phase === 'unicorn_switch' && (
            <div className="glass-panel rounded-sm p-3">
              <div className="text-[10px] text-[#A78BFA] uppercase tracking-wider font-bold mb-1">Unicorn Ability</div>
              {isUnicornTurn ? (
                <>
                  {!unicornSwitchMode ? (
                    <div className="space-y-2">
                      <button
                        data-testid="unicorn-switch-start"
                        onClick={onUnicornSwitchStart}
                        className="w-full py-2 bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 text-[#E9D5FF] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                      >
                        Switch
                      </button>
                      <button
                        data-testid="unicorn-switch-pass"
                        onClick={() => sendAction({ action: 'pass_unicorn_ability' })}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-[#A1A1AA] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                      >
                        Pass
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-[#F5F5F0]">Select two of your placed combat tokens.</p>
                      <p className="text-[10px] text-[#A1A1AA]">{unicornSelectedTokens.length}/2 selected</p>
                      <button
                        data-testid="unicorn-switch-confirm"
                        disabled={unicornSelectedTokens.length !== 2}
                        onClick={onUnicornSwitchConfirm}
                        className="w-full py-2 bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 text-[#E9D5FF] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors disabled:opacity-40"
                      >
                        Confirm Switch
                      </button>
                      <button
                        data-testid="unicorn-switch-cancel"
                        onClick={onUnicornSwitchCancel}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-[#A1A1AA] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-[#A1A1AA]">Waiting for Unicorn to switch or pass.</p>
              )}
            </div>
          )}

          {/* Proceed button */}
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

          {/* Host Admin Panel */}
          {isHost && gameState.status === 'playing' && (
            <div>
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="w-full flex items-center gap-1.5 text-[10px] text-[#F57C00] uppercase tracking-wider font-bold px-1 hover:text-[#FB923C] transition-colors"
                data-testid="admin-panel-toggle"
              >
                <Settings className="w-3 h-3" /> Host Controls {showAdmin ? '(hide)' : '(show)'}
              </button>
              {showAdmin && (
                <div className="mt-2 space-y-1.5 animate-fade-in-up">
                  <button
                    data-testid="admin-skip-turn"
                    onClick={() => sendAction({ action: 'admin_skip_turn' })}
                    className="w-full flex items-center gap-1.5 px-3 py-2 bg-[#F57C00]/10 hover:bg-[#F57C00]/20 border border-[#F57C00]/30 rounded-sm text-xs text-[#F57C00] font-bold transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Skip Current Turn
                  </button>
                  <button
                    data-testid="admin-force-proceed"
                    onClick={() => sendAction({ action: 'admin_force_proceed' })}
                    className="w-full flex items-center gap-1.5 px-3 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-sm text-xs text-[#D4AF37] font-bold transition-colors"
                  >
                    <FastForward className="w-3.5 h-3.5" /> Force Next Phase
                  </button>
                  <button
                    data-testid="admin-end-game"
                    onClick={() => { if (window.confirm('End the game now? Scores will be calculated with current state.')) sendAction({ action: 'admin_end_game' }); }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 bg-[#D32F2F]/10 hover:bg-[#D32F2F]/20 border border-[#D32F2F]/30 rounded-sm text-xs text-[#D32F2F] font-bold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> End Game Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Players */}
          <div>
            <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-2 px-1">Players</div>
            <div className="space-y-1.5">
              {gameState.players?.map((player, idx) => {
                const clanInfo = CLANS[player.clan];
                return (
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
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: clanInfo?.color || '#666' }} />
                        <span className="font-heading text-sm font-bold" style={{ color: clanInfo?.color || '#FFF' }}>
                          {clanInfo?.name || player.username}
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

                    {/* Scout/Shugenja status - visible to all */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-0.5 text-[9px]" title="Scout cards remaining">
                        <Search className="w-2.5 h-2.5 text-[#60A5FA]" />
                        <span className="text-[#60A5FA]">{player.scout_cards}</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px]" title="Shugenja cards remaining">
                        <Flame className="w-2.5 h-2.5 text-[#C41E3A]" />
                        <span className="text-[#C41E3A]">{player.shugenja_cards}</span>
                      </span>
                      <span className="text-[9px] text-[#A1A1AA]">Hand: {player.hand_count || 0}</span>
                      {player.is_ronin && <span className="text-[9px] text-[#F57C00] font-bold">RONIN</span>}
                    </div>

                    {expandedClan === idx && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs space-y-1 animate-fade-in-up">
                        <p className="text-[#A1A1AA]">Pool: {player.token_pool_count || 0} remaining</p>
                        <p className="text-[#A1A1AA]">Discarded: {player.discard_count || 0}</p>
                        {player.clan && (
                          <p className="text-[#A1A1AA] italic mt-1">{CLAN_ABILITIES[player.clan]}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <div key={tid}
                    className={`px-2 py-1.5 bg-white/5 rounded-sm text-xs transition-all ${canPlay ? 'hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 cursor-pointer border border-transparent' : ''}`}
                    onClick={() => canPlay && sendAction({ action: 'play_territory_card', territory_id: tid })}
                    data-testid={`territory-card-${tid}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA]">{TERRITORY_LABELS[tid] || tid}</span>
                      <span className={`font-bold ${
                        terr.card_used ? 'text-[#A1A1AA] line-through' :
                        terr.card_owner !== null ? '' : 'text-[#A1A1AA]'
                      }`} style={{ color: terr.card_owner !== null && !terr.card_used ? CLANS[gameState.players[terr.card_owner]?.clan]?.color : undefined }}>
                        {terr.card_used ? 'Used' :
                         terr.card_owner !== null ? CLAN_LABELS[gameState.players[terr.card_owner]?.clan] || 'Claimed' :
                         'Free'}
                      </span>
                    </div>
                    {isOwner && terr.card && !terr.card_used && (
                      <div className="mt-1 text-[10px] text-[#D4AF37]">{terr.card.name}</div>
                    )}
                    {terr.card && (isOwner || terr.card_used) && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setTerritoryInfo({ tid, terr }); }}
                        className="mt-1 inline-flex items-center gap-1 text-[9px] text-[#60A5FA] hover:text-[#93C5FD] font-bold uppercase tracking-wider"
                        data-testid={`territory-card-info-${tid}`}
                      >
                        <Info className="w-3 h-3" /> Info
                      </button>
                    )}
                    {canPlay && (
                      <div className="mt-1 text-[9px] text-[#C41E3A] font-bold uppercase tracking-wider animate-pulse">Play Card</div>
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
              <button
                onClick={() => setShowFinalScores(true)}
                className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold mb-2 hover:text-[#FCD34D] transition-colors"
                data-testid="final-scores-open"
              >
                Final Scores
              </button>
              {gameState.scores.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="font-heading font-bold" style={{ color: CLANS[score.clan]?.color }}>{idx + 1}. {CLANS[score.clan]?.name}</span>
                  <span className="text-[#D4AF37] font-bold">{score.honor} Honor</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {showFinalScores && gameState.scores && (
        <div className="fixed inset-0 z-[97] flex items-center justify-center" onClick={() => setShowFinalScores(false)} data-testid="final-scores-modal">
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 glass-panel rounded-sm p-5 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-xl font-bold text-[#D4AF37]">Final Scores</h3>
              <button className="text-[#A1A1AA] hover:text-white text-sm" onClick={() => setShowFinalScores(false)}>Close</button>
            </div>
            <div className="space-y-2">
              {gameState.scores.map((score, idx) => (
                <div key={`${score.clan}-${idx}`} className="bg-white/5 rounded-sm p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold" style={{ color: CLANS[score.clan]?.color }}>{idx + 1}. {CLANS[score.clan]?.name}</span>
                    <span className="text-[#D4AF37] font-bold">{score.honor} Honor</span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] mt-1">
                    <div>Player: {score.username}</div>
                    <div>Objective Honor: {score.objective_honor || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {territoryInfo?.terr?.card && (
        <div className="fixed inset-0 z-[98] flex items-center justify-center" onClick={() => setTerritoryInfo(null)} data-testid="territory-info-modal">
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 glass-panel rounded-sm p-5 w-full max-w-md mx-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-xl font-bold text-[#D4AF37]">{territoryInfo.terr.card.name}</h3>
              <button className="text-[#A1A1AA] hover:text-white text-sm" onClick={() => setTerritoryInfo(null)}>Close</button>
            </div>
            <p className="text-sm text-[#F5F5F0] mb-2">{territoryInfo.terr.card.description}</p>
            <p className="text-xs text-[#A1A1AA]">{TERRITORY_LABELS[territoryInfo.tid] || territoryInfo.tid}</p>
          </div>
        </div>
      )}
    </div>
  );
}
