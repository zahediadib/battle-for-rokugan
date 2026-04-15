import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GameProvider, useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import GameBoard from '../components/game/GameBoard';
import PlayerHand from '../components/game/PlayerHand';
import StatusPanel from '../components/game/StatusPanel';
import ClanSelect from '../components/game/ClanSelect';
import { AbilityModal, AbilityButtons } from '../components/game/AbilityModal';
import { Volume2, VolumeX, X, Wifi, WifiOff, Move, Lock } from 'lucide-react';

function GameContent() {
  const { gameState, connected, sendAction, notifications, dismissNotification, user } = useGame();
  const [selectedToken, setSelectedToken] = useState(null);
  const [placementStep, setPlacementStep] = useState(null);
  const [sourceProvince, setSourceProvince] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Ability modal state
  const [abilityMode, setAbilityMode] = useState(null); // 'scout' | 'shugenja' | 'scorpion' | null
  const [abilityModal, setAbilityModal] = useState({ open: false, type: null, result: null });

  // Edit mode state
  const [editMode, setEditMode] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
      setMusicPlaying(!musicPlaying);
    }
  };

  // Handle shugenja results from game state (broadcast to all)
  useEffect(() => {
    if (gameState?.shugenja_result) {
      setAbilityModal({
        open: true,
        type: 'shugenja',
        result: gameState.shugenja_result,
      });
    }
  }, [gameState?.shugenja_result]);

  // Listen for scout/scorpion results in notifications
  useEffect(() => {
    const latest = notifications[notifications.length - 1];
    if (latest && !latest.isError) {
      if (latest.message?.startsWith('Scout used|')) {
        try {
          const tokenData = JSON.parse(latest.message.split('|')[1]);
          setAbilityModal({ open: true, type: 'scout', result: { token: tokenData } });
          dismissNotification(latest.id);
        } catch (e) {}
      } else if (latest.message?.startsWith('Scorpion spy|')) {
        try {
          const tokenData = JSON.parse(latest.message.split('|')[1]);
          setAbilityModal({ open: true, type: 'scorpion', result: { token: tokenData } });
          dismissNotification(latest.id);
        } catch (e) {}
      }
    }
  }, [notifications, dismissNotification]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" data-testid="game-loading">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C41E3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1AA] font-heading text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  const myPlayerIndex = gameState.players?.findIndex(p => p.user_id === user?.user_id);
  const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null;
  const isHost = gameState.host_user_id === user?.user_id;
  const isSpectator = myPlayerIndex < 0;

  if (gameState.status === 'clan_selection') {
    return <ClanSelect gameState={gameState} myPlayer={myPlayer} sendAction={sendAction} isSpectator={isSpectator} />;
  }

  if (gameState.status === 'objective_selection') {
    return <ObjectiveSelect gameState={gameState} myPlayer={myPlayer} sendAction={sendAction} isSpectator={isSpectator} />;
  }

  const handleProvinceClick = (provinceId) => {
    // Ability targeting mode (scout/shugenja/scorpion)
    if (abilityMode) {
      const actionMap = {
        scout: 'use_scout',
        shugenja: 'use_shugenja',
        scorpion: 'use_scorpion_ability',
      };
      sendAction({
        action: actionMap[abilityMode],
        target_location: 'province',
        target_id: provinceId,
      });
      // For scout/scorpion, the result comes back in action_result message
      if (abilityMode === 'scout' || abilityMode === 'scorpion') {
        // We'll parse the result from the action_result message
        const handler = (event) => {
          // This is handled via the GameContext notifications
        };
      }
      setAbilityMode(null);
      return;
    }

    // Setup phase: place control token
    if (gameState.status === 'setup' && gameState.phase === 'setup') {
      if (myPlayerIndex === gameState.current_turn_index) {
        sendAction({ action: 'place_control_token', province_id: provinceId });
      }
      return;
    }

    // Placement phase: place combat token
    if (gameState.phase === 'placement' && selectedToken) {
      if (placementStep === null || placementStep === 'select_source') {
        if (['shinobi', 'diplomacy', 'raid'].includes(selectedToken.type)) {
          sendAction({
            action: 'place_combat_token', token_id: selectedToken.id,
            target_type: 'province', target_id: provinceId,
          });
          setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
          return;
        }
        if (!sourceProvince) {
          setSourceProvince(provinceId);
          setPlacementStep('select_target');
          return;
        }
      }
      if (placementStep === 'select_target') {
        if (provinceId === sourceProvince) {
          sendAction({
            action: 'place_combat_token', token_id: selectedToken.id,
            target_type: 'province', target_id: provinceId,
          });
        } else {
          sendAction({
            action: 'place_combat_token', token_id: selectedToken.id,
            target_type: 'border', target_id: findBorder(sourceProvince, provinceId) || provinceId,
          });
        }
        setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
      }
    }
  };

  const handleBorderClick = (borderId) => {
    if (abilityMode) {
      const actionMap = { scout: 'use_scout', shugenja: 'use_shugenja', scorpion: 'use_scorpion_ability' };
      sendAction({ action: actionMap[abilityMode], target_location: 'border', target_id: borderId });
      setAbilityMode(null);
      return;
    }
    if (gameState.phase === 'placement' && selectedToken) {
      sendAction({
        action: 'place_combat_token', token_id: selectedToken.id,
        target_type: 'border', target_id: borderId,
      });
      setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
    }
  };

  const handleSeaClick = () => {
    if (gameState.phase === 'placement' && selectedToken) {
      if (selectedToken.type === 'navy' || selectedToken.type === 'bluff') {
        setSourceProvince('sea');
        setPlacementStep('select_target');
      }
    }
  };

  const handleTokenSelect = (token) => {
    if (selectedToken?.id === token.id) {
      setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
    } else {
      setSelectedToken(token); setPlacementStep('select_source'); setSourceProvince(null);
    }
  };

  const cancelSelection = () => {
    setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
    setAbilityMode(null);
  };

  const handleUseScout = () => {
    setAbilityMode('scout');
    setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
  };

  const handleUseShugenja = () => {
    setAbilityMode('shugenja');
    setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
  };

  const handleUseScorpionAbility = () => {
    setAbilityMode('scorpion');
    setSelectedToken(null); setPlacementStep(null); setSourceProvince(null);
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
          {/* Ability targeting indicator */}
          {abilityMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#C41E3A]/20 border border-[#C41E3A]/40 rounded-sm animate-pulse">
              <span className="text-xs text-[#C41E3A] font-bold uppercase">
                Select target for {abilityMode}
              </span>
              <button onClick={cancelSelection} className="text-[#F87171]"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {/* Edit mode toggle (host only) */}
          {isHost && gameState.status === 'playing' && (
            <button
              data-testid="edit-mode-toggle"
              onClick={() => {
                if (editMode) {
                  // Exiting edit mode - send any position changes
                  sendAction({ action: 'edit_positions', positions: {} });
                }
                setEditMode(!editMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                editMode
                  ? 'bg-[#F57C00] text-black shadow-[0_0_12px_rgba(245,124,0,0.4)] ring-2 ring-[#F57C00]/50'
                  : 'bg-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/20'
              }`}
            >
              {editMode ? <Lock className="w-3.5 h-3.5" /> : <Move className="w-3.5 h-3.5" />}
              {editMode ? 'Exit Edit' : 'Edit Mode'}
            </button>
          )}
          {connected ? <Wifi className="w-4 h-4 text-[#2E7D32]" /> : <WifiOff className="w-4 h-4 text-[#D32F2F]" />}
          <button onClick={toggleMusic} className="p-1 hover:bg-white/10 rounded" data-testid="music-toggle">
            {musicPlaying ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-[#A1A1AA]" />}
          </button>
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
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <GameBoard
            gameState={gameState}
            myPlayerIndex={myPlayerIndex}
            selectedToken={selectedToken}
            sourceProvince={sourceProvince}
            placementStep={placementStep}
            onProvinceClick={handleProvinceClick}
            onBorderClick={handleBorderClick}
            onSeaClick={handleSeaClick}
            abilityMode={abilityMode}
            editMode={editMode}
          />
          {myPlayer && !isSpectator && (
            <div className="h-28 bg-[#161618] border-t border-white/5 px-4 py-2 flex items-center gap-3 shrink-0">
              <PlayerHand
                player={myPlayer}
                gameState={gameState}
                selectedToken={selectedToken}
                onTokenSelect={handleTokenSelect}
                onCancelSelection={cancelSelection}
              />
              <AbilityButtons
                player={myPlayer}
                gameState={gameState}
                myPlayerIndex={myPlayerIndex}
                onUseScout={handleUseScout}
                onUseShugenja={handleUseShugenja}
                onUseScorpionAbility={handleUseScorpionAbility}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ability Modal */}
      <AbilityModal
        type={abilityModal.type}
        isOpen={abilityModal.open}
        onClose={() => setAbilityModal({ open: false, type: null, result: null })}
        result={abilityModal.result}
        actorClan={myPlayer?.clan}
      />

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
      .then(r => r.json()).then(data => setObjectives(data)).catch(() => {});
  }, []);

  if (isSpectator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <p className="text-[#A1A1AA] font-heading text-xl">Players are selecting secret objectives...</p>
      </div>
    );
  }

  if (myPlayer?.secret_objective) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="glass-panel rounded-sm p-8 text-center">
          <p className="text-[#D4AF37] font-heading text-xl mb-2">Objective Selected</p>
          <p className="text-[#A1A1AA]">Waiting for other players...</p>
        </div>
      </div>
    );
  }

  const options = myPlayer?.secret_objective_options || [];
  const availableObjectives = objectives.filter(o => options.includes(o.id));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6" data-testid="objective-select">
      <div className="max-w-2xl w-full">
        <h2 className="font-heading text-3xl font-bold text-[#D4AF37] text-center mb-8">Choose Your Secret Objective</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableObjectives.map(obj => (
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

function findBorder(p1, p2) {
  if (!window.__borderLookup) {
    const BORDERS_RAW = [
      {id:"1",p:["shadowland_bottom","shadowland_top"]},{id:"2",p:["shadowland_top","crab_1"]},{id:"3",p:["shadowland_top","crab_2"]},{id:"4",p:["shadowland_top","crab_3"]},{id:"5",p:["shadowland_bottom","crab_3"]},{id:"6",p:["crab_3","crab_2"]},{id:"7",p:["crab_3","wind_1"]},{id:"8",p:["crab_2","wind_1"]},{id:"9",p:["wind_2","wind_1"]},{id:"10",p:["wind_1","wind_3"]},{id:"11",p:["wind_2","wind_3"]},{id:"12",p:["crab_2","wind_2"]},{id:"13",p:["crab_4","wind_2"]},{id:"14",p:["crab_2","crab_4"]},{id:"15",p:["crab_1","crab_2"]},{id:"16",p:["crab_1","crab_4"]},{id:"17",p:["crab_1","scorpion_3"]},{id:"18",p:["crab_1","unicorn_1"]},{id:"19",p:["scorpion_3","unicorn_1"]},{id:"20",p:["crab_4","scorpion_3"]},{id:"21",p:["crab_4","scorpion_1"]},{id:"22",p:["crab_4","crane_1"]},{id:"23",p:["scorpion_3","scorpion_1"]},{id:"24",p:["scorpion_3","scorpion_2"]},{id:"25",p:["scorpion_3","unicorn_3"]},{id:"26",p:["unicorn_1","unicorn_3"]},{id:"27",p:["unicorn_1","unicorn_2"]},{id:"28",p:["unicorn_3","unicorn_2"]},{id:"29",p:["unicorn_2","dragon_1"]},{id:"30",p:["scorpion_2","unicorn_3"]},{id:"31",p:["unicorn_3","lion_3"]},{id:"32",p:["lion_3","dragon_1"]},{id:"33",p:["unicorn_2","lion_3"]},{id:"34",p:["dragon_1","dragon_2"]},{id:"35",p:["lion_3","dragon_2"]},{id:"36",p:["dragon_2","phoenix_3"]},{id:"37",p:["phoenix_3","phoenix_2"]},{id:"38",p:["phoenix_2","phoenix_1"]},{id:"39",p:["lion_1","phoenix_2"]},{id:"40",p:["dragon_3","phoenix_3"]},{id:"41",p:["dragon_3","dragon_2"]},{id:"42",p:["dragon_3","lion_1"]},{id:"43",p:["crane_3","lion_1"]},{id:"44",p:["lion_2","lion_1"]},{id:"45",p:["crane_2","crane_3"]},{id:"46",p:["crane_1","crane_2"]},{id:"47",p:["wind_3","crane_1"]},{id:"48",p:["wind_2","crane_1"]},{id:"49",p:["crane_1","scorpion_1"]},{id:"50",p:["scorpion_1","crane_2"]},{id:"51",p:["scorpion_1","scorpion_2"]},{id:"52",p:["scorpion_1","lion_2"]},{id:"53",p:["scorpion_2","lion_2"]},{id:"54",p:["scorpion_2","lion_3"]},{id:"55",p:["lion_2","lion_3"]},{id:"56",p:["lion_3","dragon_3"]},{id:"57",p:["lion_2","dragon_3"]},{id:"58",p:["island_1","island_2"]},{id:"59",p:["island_1","island_3"]},{id:"60",p:["island_2","island_3"]},{id:"61",p:["lion_2","crane_3"]},{id:"62",p:["crane_2","lion_2"]},{id:"63",p:["lion_1","phoenix_3"]},{id:"64",p:["lion_1","phoenix_1"]}
    ];
    const lookup = {};
    BORDERS_RAW.forEach(b => {
      const key = [b.p[0], b.p[1]].sort().join('|');
      lookup[key] = b.id;
    });
    window.__borderLookup = lookup;
  }
  const key = [p1, p2].sort().join('|');
  return window.__borderLookup[key] || null;
}


export default function GamePage() {
  const { token } = useAuth();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();

  return (
    <GameProvider gameId={gameId}>
      <GameContent />
    </GameProvider>
  );
}
