import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GameProvider, useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import GameBoard from '../components/game/GameBoard';
import PlayerHand from '../components/game/PlayerHand';
import StatusPanel from '../components/game/StatusPanel';
import ClanSelect from '../components/game/ClanSelect';
import { AbilityModal, AbilityButtons } from '../components/game/AbilityModal';
import ProvinceInfoPopup from '../components/game/ProvinceInfoPopup';
import { Volume2, VolumeX, X, Wifi, WifiOff } from 'lucide-react';
import { CLANS } from '../constants/gameConstants';
import { preloadGameAssets } from '../lib/assetPreload';

const SFX_PATHS = {
  controlPlacement: '/assets/control_token_placement.mp3',
  combatPlacement: '/assets/combat_token_placement.mp3',
  unicornSwitch: '/assets/unicorn_switch.mp3',
  scout: '/assets/scout.mp3',
  spy: '/assets/spy.mp3',
  shugenja: '/assets/shugenja.mp3',
};

// Big announcement modal for game events
function AnnouncementModal({ announcement, onClose }) {
  if (!announcement) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center" data-testid="announcement-modal">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-w-xl w-full mx-4 animate-modal-in">
        <div className="glass-panel rounded-sm p-8 text-center">
          {announcement.image && (
            <img src={announcement.image} alt="" className="w-32 h-32 object-contain mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          <h2 className="font-heading text-2xl font-black mb-3" style={{ color: announcement.color || '#D4AF37' }}>
            {announcement.title}
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-2">{announcement.message}</p>
          {announcement.detail && (
            <div className="mt-3 p-3 bg-white/5 rounded-sm text-sm text-[#F5F5F0]">{announcement.detail}</div>
          )}
          <button onClick={onClose} data-testid="announcement-close"
            className="mt-6 px-8 py-2 bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold uppercase tracking-wider rounded-sm transition-colors text-sm">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Secret objective detail modal
function ObjectiveDetailModal({ objectiveId, onClose }) {
  const [objectives, setObjectives] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/game-data/objectives`)
      .then(r => r.json()).then(setObjectives).catch(() => {});
  }, []);
  if (!objectiveId) return null;
  const obj = objectives.find(o => o.id === objectiveId);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose} data-testid="objective-detail-modal">
      <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 glass-panel rounded-sm p-6 max-w-md w-full mx-4 animate-modal-in" onClick={e => e.stopPropagation()}>
        <h3 className="font-heading text-xl font-bold text-[#D4AF37] mb-3">Secret Objective</h3>
        {obj ? (
          <>
            <h4 className="font-heading text-lg font-bold text-[#F5F5F0] mb-2">{obj.name}</h4>
            <p className="text-sm text-[#A1A1AA] mb-3">{obj.description}</p>
            <div className="text-[#D4AF37] font-bold text-xl">+{obj.honor} Honor</div>
          </>
        ) : (
          <p className="text-[#A1A1AA] capitalize">{objectiveId?.replace(/_/g, ' ')}</p>
        )}
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-sm font-bold uppercase">Close</button>
      </div>
    </div>
  );
}

function CombatTokenInfoModal({ selection, players, onClose }) {
  if (!selection) return null;
  const token = selection.token;
  const owner = players?.[token.player_index];
  return (
    <div className="fixed inset-0 z-[98] flex items-center justify-center" onClick={onClose} data-testid="combat-token-info-modal">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 glass-panel rounded-sm p-5 max-w-sm w-full mx-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading text-xl font-bold text-[#D4AF37] mb-3">Combat Token</h3>
        <div className="space-y-1 text-sm">
          <div className="text-[#F5F5F0] capitalize"><span className="text-[#A1A1AA]">Type:</span> {token.type}</div>
          <div className="text-[#F5F5F0]"><span className="text-[#A1A1AA]">Strength:</span> {token.strength}</div>
          <div className="text-[#F5F5F0]"><span className="text-[#A1A1AA]">Owner:</span> {owner?.clan || owner?.username || 'Unknown'}</div>
          <div className="text-[#F5F5F0] capitalize"><span className="text-[#A1A1AA]">Location:</span> {selection.location.type} {selection.location.id}</div>
        </div>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-sm font-bold uppercase">Close</button>
      </div>
    </div>
  );
}

function GameContent() {
  const { gameState, connected, sendAction, notifications, dismissNotification, user } = useGame();
  const [selectedToken, setSelectedToken] = useState(null);
  const [placementStep, setPlacementStep] = useState(null);
  const [sourceProvince, setSourceProvince] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const sfxRef = useRef({});
  const prevStateRef = useRef(null);
  const gameStateRef = useRef(null);
  const [musicVolume, setMusicVolume] = useState(0.45);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [abilityMode, setAbilityMode] = useState(null);
  const [abilityModal, setAbilityModal] = useState({ open: false, type: null, result: null });
  const [selectedProvinceInfo, setSelectedProvinceInfo] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [objectiveDetail, setObjectiveDetail] = useState(null);
  const [selectedCombatTokenInfo, setSelectedCombatTokenInfo] = useState(null);
  // Blessing targeting
  const [blessingMode, setBlessingMode] = useState(null); // token to place as blessing
  const [unicornSwitchMode, setUnicornSwitchMode] = useState(false);
  const [unicornSelectedTokens, setUnicornSelectedTokens] = useState([]);
  const [tokenAnimationByKey, setTokenAnimationByKey] = useState({});
  const [highlightedTokenKey, setHighlightedTokenKey] = useState(null);
  const [highlightTone, setHighlightTone] = useState('blue');

  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
      setMusicPlaying(!musicPlaying);
    }
  };

  const playSfx = (name) => {
    const player = sfxRef.current[name];
    if (!player) return;
    try {
      player.currentTime = 0;
      player.play().catch(() => {});
    } catch (_) {}
  };

  useEffect(() => {
    audioRef.current && (audioRef.current.volume = musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    const players = {};
    Object.entries(SFX_PATHS).forEach(([k, src]) => {
      const a = new Audio(src);
      a.preload = 'auto';
      a.volume = 0.8;
      players[k] = a;
    });
    sfxRef.current = players;
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Handle shugenja results (broadcast to all)
  useEffect(() => {
    if (gameState?.shugenja_result) {
      const r = gameState.shugenja_result;
      const actorClan = gameState.players[r.actor]?.clan;
      playSfx('shugenja');
      setAnnouncement({
        title: 'Shugenja Invoked!',
        message: `${CLANS[actorClan]?.name || 'Unknown'} used Shugenja`,
        detail: `Revealed and destroyed: ${r.token.type} ${r.token.strength}`,
        color: '#C41E3A',
        image: '/assets/shugenja.png',
      });
    }
  }, [gameState?.shugenja_result, gameState?.players]);

  // Listen for scout/scorpion results + territory card plays in notifications
  useEffect(() => {
    const latest = notifications[notifications.length - 1];
    if (!latest || latest.isError) return;
    const msg = latest.message || '';

    if (msg.startsWith('Scout used|')) {
      try {
        const tokenData = JSON.parse(msg.split('|')[1]);
        playSfx('scout');
        if (tokenData.location === 'border' && tokenData.border_id) {
          const bt = gameStateRef.current?.borders?.[tokenData.border_id]?.combat_token;
          if (bt?.id) {
            setHighlightTone('blue');
            setHighlightedTokenKey(`border:${tokenData.border_id}:${bt.id}`);
            setTimeout(() => setHighlightedTokenKey(null), 2500);
          }
        }
        if (tokenData.location === 'province' && tokenData.province_id) {
          const provTokens = gameStateRef.current?.provinces?.[tokenData.province_id]?.combat_tokens || [];
          const target = provTokens.find(t => t.player_index === tokenData.player_index && t.type === tokenData.type && t.strength === tokenData.strength);
          if (target?.id) {
            setHighlightTone('blue');
            setHighlightedTokenKey(`province:${tokenData.province_id}:${target.id}`);
            setTimeout(() => setHighlightedTokenKey(null), 2500);
          }
        }
        setAnnouncement({
          title: 'Scout Deployed',
          message: 'You peeked at a hidden token',
          detail: `Found: ${tokenData.type} ${tokenData.strength}`,
          color: '#60A5FA',
          image: '/assets/scout.png',
        });
      } catch (e) {}
      dismissNotification(latest.id);
    } else if (msg.startsWith('Scorpion spy|')) {
      try {
        const tokenData = JSON.parse(msg.split('|')[1]);
        playSfx('spy');
        setAnnouncement({
          title: 'Scorpion Spy',
          message: 'The shadows reveal their secrets...',
          detail: `Found: ${tokenData.type} ${tokenData.strength}`,
          color: '#F87171',
          image: '/assets/scorpion.png',
        });
      } catch (e) {}
      dismissNotification(latest.id);
    } else if (msg.startsWith('territory_card|')) {
      try {
        const parts = msg.split('|');
        const cardName = parts[1];
        const cardDesc = parts[2];
        const clanName = parts[3];
        setAnnouncement({
          title: `${clanName} played a Territory Card!`,
          message: cardName,
          detail: cardDesc,
          color: '#D4AF37',
        });
      } catch (e) {}
      dismissNotification(latest.id);
    }
  }, [notifications, dismissNotification]);

    const myPlayerIndex = gameState?.players?.findIndex(p => p.user_id === user?.user_id) ?? -1;
    const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null;
    const isUnicornSwitchTurn = gameState?.phase === 'unicorn_switch' && myPlayerIndex === gameState?.current_turn_index && myPlayer?.clan === 'unicorn';

    useEffect(() => {
        if (!isUnicornSwitchTurn) {
            setUnicornSwitchMode(false);
            setUnicornSelectedTokens([]);
        }
    }, [isUnicornSwitchTurn]);

    useEffect(() => {
      if (!gameState) return;
      const prev = prevStateRef.current;
      if (prev) {
        const nextAnimations = {};
        let playControlPlacement = false;
        let playCombatPlacement = false;
        let playUnicorn = false;

        Object.keys(gameState.provinces || {}).forEach((provinceId) => {
          const prevProv = prev.provinces?.[provinceId];
          const nextProv = gameState.provinces?.[provinceId];
          const prevControlCount = prevProv?.control_tokens?.length || 0;
          const nextControlCount = nextProv?.control_tokens?.length || 0;
          if (nextControlCount > prevControlCount && gameState.status === 'setup' && gameState.phase === 'setup') {
            nextAnimations[`control:${provinceId}`] = 'animate-token-zoom-out';
            playControlPlacement = true;
          }

          const prevCombatIds = new Set((prevProv?.combat_tokens || []).map(t => t.id));
          (nextProv?.combat_tokens || []).forEach((t) => {
            if (!prevCombatIds.has(t.id) && gameState.phase === 'placement') {
              nextAnimations[`province:${provinceId}:${t.id}`] = 'animate-token-fly-in';
              playCombatPlacement = true;
            }
          });
        });

        Object.keys(gameState.borders || {}).forEach((borderId) => {
          const prevToken = prev.borders?.[borderId]?.combat_token;
          const nextToken = gameState.borders?.[borderId]?.combat_token;
          if (!prevToken && nextToken && gameState.phase === 'placement') {
            nextAnimations[`border:${borderId}:${nextToken.id}`] = 'animate-token-fly-in';
            playCombatPlacement = true;
          }
        });

        const prevLoc = {};
        const nextLoc = {};
        Object.entries(prev.provinces || {}).forEach(([pid, prov]) => {
          (prov.combat_tokens || []).forEach((t) => { prevLoc[t.id] = `province:${pid}:${t.id}`; });
        });
        Object.entries(prev.borders || {}).forEach(([bid, b]) => {
          if (b.combat_token) prevLoc[b.combat_token.id] = `border:${bid}:${b.combat_token.id}`;
        });
        Object.entries(gameState.provinces || {}).forEach(([pid, prov]) => {
          (prov.combat_tokens || []).forEach((t) => { nextLoc[t.id] = `province:${pid}:${t.id}`; });
        });
        Object.entries(gameState.borders || {}).forEach(([bid, b]) => {
          if (b.combat_token) nextLoc[b.combat_token.id] = `border:${bid}:${b.combat_token.id}`;
        });

        Object.keys(nextLoc).forEach((tokenId) => {
          if (prevLoc[tokenId] && prevLoc[tokenId] !== nextLoc[tokenId]) {
            nextAnimations[nextLoc[tokenId]] = 'animate-token-fly-in';
            playUnicorn = true;
          }
        });

        if (Object.keys(nextAnimations).length > 0) {
          setTokenAnimationByKey(nextAnimations);
          setTimeout(() => setTokenAnimationByKey({}), 1200);
        }
        if (playControlPlacement) playSfx('controlPlacement');
        if (playCombatPlacement) playSfx('combatPlacement');
        if (playUnicorn) playSfx('unicornSwitch');
      }
      prevStateRef.current = gameState;
    }, [gameState]);

    if (!gameState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" data-testid="game-loading">
                <div className="w-12 h-12 border-4 border-[#C41E3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            </div>
        );
    }

    const isHost = gameState.host_user_id === user?.user_id;
    const isSpectator = myPlayerIndex < 0;

  if (gameState.status === 'clan_selection') {
    return <ClanSelect gameState={gameState} myPlayer={myPlayer} sendAction={sendAction} isSpectator={isSpectator} />;
  }
  if (gameState.status === 'objective_selection') {
    return <ObjectiveSelect gameState={gameState} myPlayer={myPlayer} sendAction={sendAction} isSpectator={isSpectator} />;
  }

  const handleProvinceClick = (provinceId) => {
    // Ability targeting
    if (abilityMode) {
      sendAction({ action: { scout: 'use_scout', shugenja: 'use_shugenja', scorpion: 'use_scorpion_ability' }[abilityMode], target_location: 'province', target_id: provinceId });
      setAbilityMode(null);
      return;
    }

    // Blessing targeting: click a placed token
    if (blessingMode) {
      // Find a token belonging to me in this province
      const provState = gameState.provinces?.[provinceId];
      const myToken = provState?.combat_tokens?.find(ct => ct.player_index === myPlayerIndex && ct.type !== 'hidden');
      if (myToken) {
        sendAction({
          action: 'place_combat_token', token_id: blessingMode.id,
          target_type: 'blessing', blessing_target_id: myToken.id, target_province_id: provinceId,
        });
        setBlessingMode(null); setSelectedToken(null);
        return;
      }
    }

    // Setup phase
    if (gameState.status === 'setup' && gameState.phase === 'setup') {
      if (myPlayerIndex === gameState.current_turn_index) {
        sendAction({ action: 'place_control_token', province_id: provinceId });
        return;
      }
    }

    // Placement: token selected
    if (gameState.phase === 'placement' && selectedToken) {
      if (placementStep === 'select_target') {
        if (provinceId === sourceProvince) {
          // Place in province center (defense)
          sendAction({ action: 'place_combat_token', token_id: selectedToken.id, target_type: 'province', target_id: provinceId });
        } else if (sourceProvince === 'sea') {
          // Navy from sea: find the sea border for this coastal province
          const seaBorderId = findSeaBorder(provinceId);
          if (seaBorderId) {
            sendAction({ action: 'place_combat_token', token_id: selectedToken.id, target_type: 'border', target_id: seaBorderId });
          } else {
            sendAction({ action: 'place_combat_token', token_id: selectedToken.id, target_type: 'province', target_id: provinceId });
          }
        } else {
          // Attack: find border between source and target
          const borderId = findBorder(sourceProvince, provinceId);
          if (borderId) {
            sendAction({ action: 'place_combat_token', token_id: selectedToken.id, target_type: 'border', target_id: borderId });
          } else {
            sendAction({ action: 'place_combat_token', token_id: selectedToken.id, target_type: 'province', target_id: provinceId });
          }
        }
        setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
        return;
      }
      // First click: set source
      setSourceProvince(provinceId);
      setPlacementStep('select_target');
      return;
    }

    // No action: show province info
    setSelectedProvinceInfo(provinceId);
  };

  const handleBorderClick = (borderId) => {
    if (abilityMode) {
      sendAction({ action: { scout: 'use_scout', shugenja: 'use_shugenja', scorpion: 'use_scorpion_ability' }[abilityMode], target_location: 'border', target_id: borderId });
      setAbilityMode(null);
      return;
    }
    // Blessing on border token
    if (blessingMode) {
      const bt = gameState.borders?.[borderId]?.combat_token;
      if (bt && bt.player_index === myPlayerIndex) {
        sendAction({
          action: 'place_combat_token', token_id: blessingMode.id,
          target_type: 'blessing', blessing_target_id: bt.id, target_id: borderId,
        });
        setBlessingMode(null); setSelectedToken(null);
        return;
      }
    }
    if (gameState.phase === 'placement' && selectedToken) {
      sendAction({ action: 'place_combat_token', token_id: selectedToken.id, target_type: 'border', target_id: borderId });
      setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
    }
  };

  const handleSeaClick = () => {
    if (gameState.phase === 'placement' && selectedToken) {
      setSourceProvince('sea');
      setPlacementStep('select_target');
    }
  };

  const handleTokenSelect = (token) => {
    if (token.type === 'blessing') {
      // Enter blessing targeting mode
      setBlessingMode(token);
      setSelectedToken(token);
      setPlacementStep(null);
      setSourceProvince(null);
      return;
    }
    if (selectedToken?.id === token.id) {
      cancelSelection();
    } else {
      setBlessingMode(null);
      setSelectedToken(token);
      setPlacementStep(null);
      setSourceProvince(null);
    }
  };

  const cancelSelection = () => {
    setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
    setAbilityMode(null); setBlessingMode(null);
  };

  const handleCombatTokenClick = (selection) => {
    if (unicornSwitchMode && isUnicornSwitchTurn) {
      setUnicornSelectedTokens((prev) => {
        const key = `${selection.location.type}:${selection.location.id}:${selection.token.id}`;
        const existingIndex = prev.findIndex(item => `${item.location.type}:${item.location.id}:${item.token.id}` === key);
        if (existingIndex >= 0) {
          return prev.filter((_, idx) => idx !== existingIndex);
        }
        if (prev.length >= 2) {
          return [prev[1], selection];
        }
        return [...prev, selection];
      });
      return;
    }
    setSelectedCombatTokenInfo(selection);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] overflow-hidden" data-testid="game-page">
      <audio ref={audioRef} src="/assets/music.mp3" loop preload="auto" />

      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#161618] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-lg font-bold text-[#D4AF37]">Battle for Rokugan</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A1A1AA]">Round</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(r => (
                <span key={r} className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${
                  gameState.round === r ? 'bg-[#C41E3A] text-white' :
                  gameState.round > r ? 'bg-[#2E7D32] text-white' : 'bg-white/10 text-[#A1A1AA]'
                }`}>{r}</span>
              ))}
            </div>
            <span className={`ml-2 px-2 py-0.5 text-xs uppercase font-bold tracking-wider rounded-sm ${
              gameState.phase === 'placement' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' :
              gameState.phase === 'resolution' ? 'bg-[#C41E3A]/20 text-[#C41E3A] border border-[#C41E3A]/30' :
              gameState.phase === 'upkeep' ? 'bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30' :
              'bg-white/10 text-[#A1A1AA]'
            }`}>{gameState.phase === 'setup' ? 'Setup' : gameState.phase}</span>
            {gameState.phase === 'placement' && myPlayer && (
              <span className="text-[#A1A1AA]">({myPlayer.tokens_placed_this_round}/5)</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {abilityMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#C41E3A]/20 border border-[#C41E3A]/40 rounded-sm animate-pulse">
              <span className="text-xs text-[#C41E3A] font-bold uppercase">Select target for {abilityMode}</span>
              <button onClick={cancelSelection} className="text-[#F87171]"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {blessingMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-sm animate-pulse">
              <span className="text-xs text-[#D4AF37] font-bold uppercase">Click your token to bless</span>
              <button onClick={cancelSelection} className="text-[#F87171]"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {connected ? <Wifi className="w-4 h-4 text-[#2E7D32]" /> : <WifiOff className="w-4 h-4 text-[#D32F2F]" />}
          <div
            className="relative"
            onMouseEnter={() => setShowVolumeControl(true)}
            onMouseLeave={() => setShowVolumeControl(false)}
          >
            <button onClick={toggleMusic} className="p-1 hover:bg-white/10 rounded" data-testid="music-toggle">
              {musicPlaying ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-[#A1A1AA]" />}
            </button>
            {showVolumeControl && (
              <div className="absolute right-0 top-8 glass-panel rounded-sm p-2 w-36 z-20 animate-modal-in">
                <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-1">Music Volume</div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                  data-testid="music-volume-slider"
                />
              </div>
            )}
          </div>
          {isSpectator && <span className="text-xs px-2 py-0.5 bg-[#F57C00]/20 text-[#F57C00] rounded-sm font-bold uppercase">Spectator</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <StatusPanel
          gameState={gameState}
          myPlayerIndex={myPlayerIndex}
          isHost={isHost}
          sendAction={sendAction}
          unicornSwitchMode={unicornSwitchMode}
          unicornSelectedTokens={unicornSelectedTokens}
          onUnicornSwitchStart={() => { setUnicornSwitchMode(true); setUnicornSelectedTokens([]); }}
          onUnicornSwitchCancel={() => { setUnicornSwitchMode(false); setUnicornSelectedTokens([]); }}
          onUnicornSwitchConfirm={() => {
            if (unicornSelectedTokens.length !== 2) return;
            const [first, second] = unicornSelectedTokens;
            sendAction({
              action: 'use_unicorn_ability',
              location1: first.location,
              location2: second.location,
              token1_id: first.token.id,
              token2_id: second.token.id,
            });
            setUnicornSwitchMode(false);
            setUnicornSelectedTokens([]);
          }}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <GameBoard
            gameState={gameState} myPlayerIndex={myPlayerIndex}
            selectedToken={selectedToken} sourceProvince={sourceProvince}
            placementStep={placementStep}
            onProvinceClick={handleProvinceClick} onBorderClick={handleBorderClick} onSeaClick={handleSeaClick}
            abilityMode={abilityMode} blessingMode={blessingMode}
            onCombatTokenClick={handleCombatTokenClick}
            unicornSwitchMode={unicornSwitchMode && isUnicornSwitchTurn}
            unicornSelectedTokens={unicornSelectedTokens}
            tokenAnimationByKey={tokenAnimationByKey}
            highlightedTokenKey={highlightedTokenKey}
            highlightTone={highlightTone}
          />
          {myPlayer && !isSpectator && (
            <div className="h-28 bg-[#161618] border-t border-white/5 px-4 py-2 flex items-center gap-3 shrink-0">
              <PlayerHand player={myPlayer} gameState={gameState} selectedToken={selectedToken}
                onTokenSelect={handleTokenSelect} onCancelSelection={cancelSelection}
                onObjectiveClick={() => setObjectiveDetail(myPlayer.secret_objective)} />
              <AbilityButtons player={myPlayer} gameState={gameState} myPlayerIndex={myPlayerIndex}
                onUseScout={() => { cancelSelection(); setAbilityMode('scout'); }}
                onUseShugenja={() => { cancelSelection(); setAbilityMode('shugenja'); }}
                onUseScorpionAbility={() => { cancelSelection(); setAbilityMode('scorpion'); }} />
            </div>
          )}
        </div>
      </div>

      {/* Province Info Popup */}
      {selectedProvinceInfo && (
        <ProvinceInfoPopup provinceId={selectedProvinceInfo} gameState={gameState} onClose={() => setSelectedProvinceInfo(null)} />
      )}

      {/* Objective Detail */}
      {objectiveDetail && <ObjectiveDetailModal objectiveId={objectiveDetail} onClose={() => setObjectiveDetail(null)} />}
      <CombatTokenInfoModal
        selection={selectedCombatTokenInfo}
        players={gameState.players}
        onClose={() => setSelectedCombatTokenInfo(null)}
      />

      {/* Ability Modal */}
      <AbilityModal type={abilityModal.type} isOpen={abilityModal.open}
        onClose={() => setAbilityModal({ open: false, type: null, result: null })}
        result={abilityModal.result} actorClan={myPlayer?.clan} />

      {/* Big Announcement */}
      <AnnouncementModal announcement={announcement} onClose={() => setAnnouncement(null)} />

      {/* Dragon Return Token Modal */}
      {myPlayer?.dragon_must_return && myPlayer?.hand && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center" data-testid="dragon-return-modal">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 glass-panel rounded-sm p-6 max-w-lg w-full mx-4 animate-modal-in">
            <h3 className="font-heading text-xl font-bold text-[#34D399] mb-2">Dragon Ability</h3>
            <p className="text-sm text-[#A1A1AA] mb-4">You drew an extra token. Select one non-bluff token to return to your pool.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {myPlayer.hand.filter(t => t.type !== 'bluff').map((token, idx) => (
                <button key={token.id || idx} data-testid={`dragon-return-${token.type}-${token.strength}`}
                  onClick={() => sendAction({ action: 'dragon_return_token', token_id: token.id })}
                  className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 hover:border-[#34D399] hover:bg-[#34D399]/20 transition-all flex flex-col items-center justify-center">
                  <span className="text-[#34D399] font-bold text-lg uppercase">{token.type?.charAt(0)}{token.strength}</span>
                  <span className="text-[9px] text-[#A1A1AA] capitalize">{token.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-16 right-4 z-50 space-y-2 max-w-xs">
        {notifications.map(n => (
          <div key={n.id} className={`animate-fade-in-up glass-panel rounded-sm p-3 flex items-start gap-2 text-sm ${n.isError ? 'border-[#D32F2F]/50' : 'border-[#D4AF37]/30'}`}>
            <span className={n.isError ? 'text-[#F87171]' : 'text-[#D4AF37]'}>{n.message}</span>
            <button onClick={() => dismissNotification(n.id)} className="text-[#A1A1AA] hover:text-white shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectiveSelect({ gameState, myPlayer, sendAction, isSpectator }) {
  const [objectives, setObjectives] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/game-data/objectives`)
      .then(r => r.json()).then(setObjectives).catch(() => {});
  }, []);
  if (isSpectator) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]"><p className="text-[#A1A1AA] font-heading text-xl">Players selecting objectives...</p></div>;
  if (myPlayer?.secret_objective) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]"><div className="glass-panel rounded-sm p-8 text-center"><p className="text-[#D4AF37] font-heading text-xl mb-2">Objective Selected</p><p className="text-[#A1A1AA]">Waiting for others...</p></div></div>;
  const options = myPlayer?.secret_objective_options || [];
  const avail = objectives.filter(o => options.includes(o.id));
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6" data-testid="objective-select">
      <div className="max-w-2xl w-full">
        <h2 className="font-heading text-3xl font-bold text-[#D4AF37] text-center mb-8">Choose Your Secret Objective</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {avail.map(obj => (
            <button key={obj.id} data-testid={`objective-${obj.id}`}
              onClick={() => sendAction({ action: 'select_objective', objective: obj.id })}
              className="glass-panel rounded-sm p-6 text-left hover:border-[#D4AF37]/50 transition-all hover:-translate-y-1">
              <h3 className="font-heading text-lg font-bold text-[#F5F5F0] mb-2">{obj.name}</h3>
              <p className="text-sm text-[#A1A1AA] mb-3">{obj.description}</p>
              <div className="text-[#D4AF37] font-bold text-lg">+{obj.honor} Honor</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetLoadingScreen({ progress }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6" data-testid="asset-loading-screen">
      <div className="glass-panel rounded-sm p-8 w-full max-w-xl">
        <h2 className="font-heading text-3xl font-bold text-[#D4AF37] mb-4">Preparing Battle Assets</h2>
        <p className="text-sm text-[#A1A1AA] mb-4">{progress.stage}</p>
        <div className="w-full h-3 bg-white/10 rounded-sm overflow-hidden mb-2">
          <div className="h-full bg-[#C41E3A] transition-all duration-300" style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
          <span>{progress.percent}%</span>
          <span>{progress.done}/{progress.total || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Border lookup helpers
const BORDERS_RAW = [
  {id:"1",p:["shadowland_bottom","shadowland_top"]},{id:"2",p:["shadowland_top","crab_1"]},{id:"3",p:["shadowland_top","crab_2"]},{id:"4",p:["shadowland_top","crab_3"]},{id:"5",p:["shadowland_bottom","crab_3"]},{id:"6",p:["crab_3","crab_2"]},{id:"7",p:["crab_3","wind_1"]},{id:"8",p:["crab_2","wind_1"]},{id:"9",p:["wind_2","wind_1"]},{id:"10",p:["wind_1","wind_3"]},{id:"11",p:["wind_2","wind_3"]},{id:"12",p:["crab_2","wind_2"]},{id:"13",p:["crab_4","wind_2"]},{id:"14",p:["crab_2","crab_4"]},{id:"15",p:["crab_1","crab_2"]},{id:"16",p:["crab_1","crab_4"]},{id:"17",p:["crab_1","scorpion_3"]},{id:"18",p:["crab_1","unicorn_1"]},{id:"19",p:["scorpion_3","unicorn_1"]},{id:"20",p:["crab_4","scorpion_3"]},{id:"21",p:["crab_4","scorpion_1"]},{id:"22",p:["crab_4","crane_1"]},{id:"23",p:["scorpion_3","scorpion_1"]},{id:"24",p:["scorpion_3","scorpion_2"]},{id:"25",p:["scorpion_3","unicorn_3"]},{id:"26",p:["unicorn_1","unicorn_3"]},{id:"27",p:["unicorn_1","unicorn_2"]},{id:"28",p:["unicorn_3","unicorn_2"]},{id:"29",p:["unicorn_2","dragon_1"]},{id:"30",p:["scorpion_2","unicorn_3"]},{id:"31",p:["unicorn_3","lion_3"]},{id:"32",p:["lion_3","dragon_1"]},{id:"33",p:["unicorn_2","lion_3"]},{id:"34",p:["dragon_1","dragon_2"]},{id:"35",p:["lion_3","dragon_2"]},{id:"36",p:["dragon_2","phoenix_3"]},{id:"37",p:["phoenix_3","phoenix_2"]},{id:"38",p:["phoenix_2","phoenix_1"]},{id:"39",p:["lion_1","phoenix_2"]},{id:"40",p:["dragon_3","phoenix_3"]},{id:"41",p:["dragon_3","dragon_2"]},{id:"42",p:["dragon_3","lion_1"]},{id:"43",p:["crane_3","lion_1"]},{id:"44",p:["lion_2","lion_1"]},{id:"45",p:["crane_2","crane_3"]},{id:"46",p:["crane_1","crane_2"]},{id:"47",p:["wind_3","crane_1"]},{id:"48",p:["wind_2","crane_1"]},{id:"49",p:["crane_1","scorpion_1"]},{id:"50",p:["scorpion_1","crane_2"]},{id:"51",p:["scorpion_1","scorpion_2"]},{id:"52",p:["scorpion_1","lion_2"]},{id:"53",p:["scorpion_2","lion_2"]},{id:"54",p:["scorpion_2","lion_3"]},{id:"55",p:["lion_2","lion_3"]},{id:"56",p:["lion_3","dragon_3"]},{id:"57",p:["lion_2","dragon_3"]},{id:"58",p:["island_1","island_2"]},{id:"59",p:["island_1","island_3"]},{id:"60",p:["island_2","island_3"]},{id:"61",p:["lion_2","crane_3"]},{id:"62",p:["crane_2","lion_2"]},{id:"63",p:["lion_1","phoenix_3"]},{id:"64",p:["lion_1","phoenix_1"]}
];
const SEA_BORDERS = [
  {id:"65",p:["sea","island_1"]},{id:"66",p:["island_3","sea"]},{id:"67",p:["island_2","sea"]},
  {id:"68",p:["sea","shadowland_bottom"]},{id:"69",p:["sea","crab_3"]},{id:"70",p:["wind_1","sea"]},
  {id:"71",p:["wind_3","sea"]},{id:"72",p:["crane_1","sea"]},{id:"73",p:["crane_2","sea"]},
  {id:"74",p:["crane_3","sea"]},{id:"75",p:["lion_1","sea"]},{id:"76",p:["phoenix_1","sea"]}
];

function findBorder(p1, p2) {
  for (const b of BORDERS_RAW) {
    if ((b.p[0] === p1 && b.p[1] === p2) || (b.p[0] === p2 && b.p[1] === p1)) return b.id;
  }
  return null;
}

function findSeaBorder(coastalProvince) {
  for (const b of SEA_BORDERS) {
    if (b.p.includes(coastalProvince) && b.p.includes('sea')) return b.id;
  }
  return null;
}

export default function GamePage() {
  const { gameId } = useParams();

  const [assetsReady, setAssetsReady] = useState(false);
  const [assetProgress, setAssetProgress] = useState({
    stage: 'Loading from Local Storage...',
    done: 0,
    total: 0,
    percent: 0,
  });

  useEffect(() => {
    let isMounted = true;
    preloadGameAssets((progress) => {
      if (isMounted) {
        setAssetProgress(progress);
      }
    })
      .catch((error) => {
        console.warn('Asset preload failed, continuing to game', error);
      })
      .finally(() => {
        if (isMounted) {
          setAssetsReady(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!assetsReady) {
    return <AssetLoadingScreen progress={assetProgress} />;
  }

  return (
    <GameProvider gameId={gameId}>
      <GameContent />
    </GameProvider>
  );
}
