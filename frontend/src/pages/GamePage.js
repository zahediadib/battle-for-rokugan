import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GameProvider, useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import GameBoard from '../components/game/GameBoard';
import PlayerHand from '../components/game/PlayerHand';
import StatusPanel from '../components/game/StatusPanel';
import ClanSelect from '../components/game/ClanSelect';
import { Volume2, VolumeX, X, Wifi, WifiOff } from 'lucide-react';

function GameContent() {
  const { gameState, connected, sendAction, notifications, dismissNotification, user } = useGame();
  const [selectedToken, setSelectedToken] = useState(null);
  const [placementStep, setPlacementStep] = useState(null); // 'select_source' | 'select_target'
  const [sourceProvince, setSourceProvince] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) { audioRef.current.pause(); }
      else { audioRef.current.play().catch(() => {}); }
      setMusicPlaying(!musicPlaying);
    }
  };

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

  // Clan selection phase
  if (gameState.status === 'clan_selection') {
    return <ClanSelect gameState={gameState} myPlayer={myPlayer} sendAction={sendAction} isSpectator={isSpectator} />;
  }

  // Objective selection phase
  if (gameState.status === 'objective_selection') {
    return (
      <ObjectiveSelect
        gameState={gameState}
        myPlayer={myPlayer}
        sendAction={sendAction}
        isSpectator={isSpectator}
      />
    );
  }

  const handleProvinceClick = (provinceId) => {
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
        // For defense/shinobi/diplomacy/raid: place directly in province
        if (['shinobi', 'diplomacy', 'raid'].includes(selectedToken.type)) {
          sendAction({
            action: 'place_combat_token',
            token_id: selectedToken.id,
            target_type: 'province',
            target_id: provinceId,
          });
          setSelectedToken(null);
          setPlacementStep(null);
          setSourceProvince(null);
          return;
        }

        // For army/navy/bluff as defense: need to click same province twice or different for attack
        if (!sourceProvince) {
          setSourceProvince(provinceId);
          setPlacementStep('select_target');
          return;
        }
      }

      if (placementStep === 'select_target') {
        if (provinceId === sourceProvince) {
          // Defense: place in province center
          sendAction({
            action: 'place_combat_token',
            token_id: selectedToken.id,
            target_type: 'province',
            target_id: provinceId,
          });
        } else {
          // Attack: find border between source and target
          const borderId = findBorder(sourceProvince, provinceId);
          if (borderId) {
            sendAction({
              action: 'place_combat_token',
              token_id: selectedToken.id,
              target_type: 'border',
              target_id: borderId,
            });
          } else {
            // No direct border, try as province placement
            sendAction({
              action: 'place_combat_token',
              token_id: selectedToken.id,
              target_type: 'province',
              target_id: provinceId,
            });
          }
        }
        setSelectedToken(null);
        setPlacementStep(null);
        setSourceProvince(null);
      }
    }
  };

  const handleBorderClick = (borderId) => {
    if (gameState.phase === 'placement' && selectedToken) {
      sendAction({
        action: 'place_combat_token',
        token_id: selectedToken.id,
        target_type: 'border',
        target_id: borderId,
      });
      setSelectedToken(null);
      setPlacementStep(null);
      setSourceProvince(null);
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
      setSelectedToken(null);
      setPlacementStep(null);
      setSourceProvince(null);
    } else {
      setSelectedToken(token);
      setPlacementStep('select_source');
      setSourceProvince(null);
    }
  };

  const cancelSelection = () => {
    setSelectedToken(null);
    setPlacementStep(null);
    setSourceProvince(null);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] overflow-hidden" data-testid="game-page">
      {/* Audio */}
      <audio ref={audioRef} src="/assets/music.mp3" loop preload="auto" />

      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#161618] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-lg font-bold text-[#D4AF37]">Battle for Rokugan</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A1A1AA]">Round</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(r => (
                <span key={r} className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${gameState.round === r ? 'bg-[#C41E3A] text-white' : gameState.round > r ? 'bg-[#2E7D32] text-white' : 'bg-white/10 text-[#A1A1AA]'}`}>
                  {r}
                </span>
              ))}
            </div>
            <span className={`ml-2 px-2 py-0.5 text-xs uppercase font-bold tracking-wider rounded-sm ${
              gameState.phase === 'placement' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' :
              gameState.phase === 'resolution' ? 'bg-[#C41E3A]/20 text-[#C41E3A] border border-[#C41E3A]/30' :
              'bg-white/10 text-[#A1A1AA]'
            }`}>
              {gameState.phase === 'setup' ? 'Setup' : gameState.phase}
            </span>
            {gameState.phase === 'placement' && myPlayer && (
              <span className="text-[#A1A1AA]">({myPlayer.tokens_placed_this_round}/5)</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connected ? <Wifi className="w-4 h-4 text-[#2E7D32]" /> : <WifiOff className="w-4 h-4 text-[#D32F2F]" />}
          <button onClick={toggleMusic} className="p-1 hover:bg-white/10 rounded" data-testid="music-toggle">
            {musicPlaying ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-[#A1A1AA]" />}
          </button>
          {isSpectator && <span className="text-xs px-2 py-0.5 bg-[#F57C00]/20 text-[#F57C00] rounded-sm font-bold uppercase">Spectator</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Status Panel - Left */}
        <StatusPanel
          gameState={gameState}
          myPlayerIndex={myPlayerIndex}
          isHost={isHost}
          sendAction={sendAction}
        />

        {/* Game Board - Center */}
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
          />

          {/* Player Hand - Bottom */}
          {myPlayer && !isSpectator && (
            <PlayerHand
              player={myPlayer}
              gameState={gameState}
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
              onCancelSelection={cancelSelection}
            />
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-16 right-4 z-50 space-y-2 max-w-xs">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`animate-fade-in-up glass-panel rounded-sm p-3 flex items-start gap-2 text-sm ${n.isError ? 'border-[#D32F2F]/50' : 'border-[#D4AF37]/30'}`}
          >
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
      .then(r => r.json())
      .then(data => setObjectives(data))
      .catch(() => {});
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
            <button
              key={obj.id}
              data-testid={`objective-${obj.id}`}
              onClick={() => sendAction({ action: 'select_objective', objective: obj.id })}
              className="glass-panel rounded-sm p-6 text-left hover:border-[#D4AF37]/50 transition-all hover:-translate-y-1"
            >
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


// Helper: find border between two provinces
function findBorder(p1, p2) {
  // We need border data. Import from map data.
  // For now, use a simple lookup. The game state borders have province info.
  // This is a client-side approximation - server validates.
  const BORDER_LOOKUP = getBorderLookup();
  const key = [p1, p2].sort().join('|');
  return BORDER_LOOKUP[key] || null;
}

// Build border lookup from known data
function getBorderLookup() {
  // This will be populated from map data
  if (window.__borderLookup) return window.__borderLookup;

  const lookup = {};
  // We'll build this from the BORDERS constant imported via map API
  // For now, return empty - borders can also be clicked directly
  window.__borderLookup = lookup;
  return lookup;
}


export default function GamePage() {
  const { token } = useAuth();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const isSpectator = searchParams.get('spectate') === 'true';

  if (!token && !isSpectator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <p className="text-[#A1A1AA]">Please login to view this game.</p>
      </div>
    );
  }

  return (
    <GameProvider gameId={gameId}>
      <GameContent />
    </GameProvider>
  );
}
