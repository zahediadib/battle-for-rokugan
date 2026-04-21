import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, LogOut, Crown, Play, DoorOpen, Trash2 } from 'lucide-react';

export default function LobbyPage() {
  const { user, logout, authAxios } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = authAxios();

  const loadRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error('Failed to load rooms', e);
    }
  }, [api]);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  const createRoom = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      await api.post('/rooms', { name: roomName, max_players: maxPlayers });
      setShowCreate(false);
      setRoomName('');
      loadRooms();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create room');
    }
    setLoading(false);
  };

  const joinRoom = async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/join`);
      loadRooms();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to join');
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/leave`);
      loadRooms();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to leave');
    }
  };

  const startGame = async (roomId) => {
    try {
      const res = await api.post(`/rooms/${roomId}/start`);
      navigate(`/game/${res.data.game_id}`);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to start game');
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}`);
      loadRooms();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to remove room');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="lobby-page">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1764603625108-61b26a1c9dca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxmZXVkYWwlMjBqYXBhbiUyMHNhbXVyYWklMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzc2MjY4ODEzfDA&ixlib=rb-4.1.0&q=85"
          alt="" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#F5F5F0]">War Room</h1>
            <p className="text-[#A1A1AA] text-sm mt-1">Welcome, <span className="text-[#D4AF37]">{user?.username}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              data-testid="create-room-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C41E3A] text-white font-bold uppercase text-xs tracking-wider rounded-sm hover:bg-[#A01830] transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Room
            </button>
            <button
              data-testid="logout-btn"
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/20 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#D32F2F]/20 border border-[#D32F2F]/50 rounded-sm text-sm text-[#F87171]" data-testid="lobby-error">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">dismiss</button>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" data-testid="create-room-modal">
            <div className="glass-panel rounded-sm p-8 w-full max-w-md animate-scale-in">
              <h2 className="font-heading text-2xl font-bold text-[#D4AF37] mb-6">Create Battle Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#A1A1AA] mb-2">Room Name</label>
                  <input
                    data-testid="room-name-input"
                    type="text" value={roomName} onChange={e => setRoomName(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded-sm focus:ring-2 focus:ring-[#C41E3A] outline-none"
                    placeholder="Enter room name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#A1A1AA] mb-2">Max Players</label>
                  <div className="flex gap-2">
                    {[2,3,4,5].map(n => (
                      <button
                        key={n}
                        data-testid={`max-players-${n}`}
                        onClick={() => setMaxPlayers(n)}
                        className={`w-12 h-12 rounded-sm font-bold text-lg transition-colors ${maxPlayers === n ? 'bg-[#C41E3A] text-white' : 'bg-black/50 border border-white/20 text-[#A1A1AA] hover:text-white'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    data-testid="confirm-create-room"
                    onClick={createRoom} disabled={loading}
                    className="flex-1 py-3 bg-[#C41E3A] text-white font-bold uppercase tracking-wider rounded-sm hover:bg-[#A01830] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-6 py-3 bg-transparent border border-white/20 text-[#A1A1AA] hover:text-white rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room List */}
        <div className="grid gap-4">
          {rooms.length === 0 && (
            <div className="glass-panel rounded-sm p-12 text-center">
              <p className="text-[#A1A1AA] text-lg">No rooms available. Create one to begin!</p>
            </div>
          )}
          {rooms.map((room, idx) => {
            const isInRoom = room.players?.some(p => p.user_id === user?.user_id);
            const isHost = room.host_user_id === user?.user_id;
            const isFull = room.players?.length >= room.max_players;

            return (
              <div
                key={room.room_id}
                data-testid={`room-card-${idx}`}
                className="glass-panel rounded-sm p-5 flex items-center justify-between hover:border-[#D4AF37]/30 transition-colors"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${room.status === 'waiting' ? 'bg-[#2E7D32]' : room.status === 'playing' ? 'bg-[#F57C00]' : 'bg-[#71717A]'}`} />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#F5F5F0]">{room.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-[#A1A1AA]">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.players?.length}/{room.max_players}</span>
                      <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> {room.host_username}</span>
                      {room.status === 'playing' && <span className="text-[#F57C00]">In Game</span>}
                      {room.status === 'finished' && <span className="text-[#A1A1AA]">Finished</span>}
                    </div>
                    {/* Player list */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {room.players?.map(p => (
                        <span key={p.user_id} className="text-xs px-2 py-0.5 bg-white/5 rounded text-[#A1A1AA]">{p.username}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {room.status === 'playing' && room.game_id && isInRoom && (
                    <button
                      data-testid={`enter-game-btn-${idx}`}
                      onClick={() => navigate(`/game/${room.game_id}`)}
                      className="px-4 py-2 text-xs uppercase font-bold tracking-wider bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm transition-colors"
                    >
                      Enter Game
                    </button>
                  )}
                  {room.status === 'playing' && room.game_id && !isInRoom && (
                    <button
                      data-testid={`spectate-btn-${idx}`}
                      onClick={() => navigate(`/game/${room.game_id}?spectate=true`)}
                      className="px-4 py-2 text-xs uppercase font-bold tracking-wider bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-sm transition-colors"
                    >
                      Spectate
                    </button>
                  )}
                  {room.status === 'waiting' && !isInRoom && !isFull && (
                    <button
                      data-testid={`join-btn-${idx}`}
                      onClick={() => joinRoom(room.room_id)}
                      className="px-4 py-2 text-xs uppercase font-bold tracking-wider bg-[#C41E3A] text-white hover:bg-[#A01830] rounded-sm transition-colors"
                    >
                      <DoorOpen className="w-4 h-4 inline mr-1" /> Join
                    </button>
                  )}
                  {room.status === 'waiting' && isInRoom && !isHost && (
                    <button
                      data-testid={`leave-btn-${idx}`}
                      onClick={() => leaveRoom(room.room_id)}
                      className="px-4 py-2 text-xs uppercase font-bold tracking-wider bg-transparent border border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F]/10 rounded-sm transition-colors"
                    >
                      Leave
                    </button>
                  )}
                  {room.status === 'waiting' && isHost && (
                    <button
                      data-testid={`start-btn-${idx}`}
                      onClick={() => startGame(room.room_id)}
                      disabled={room.players?.length < 2}
                      className="px-4 py-2 text-xs uppercase font-bold tracking-wider bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm transition-colors disabled:opacity-40"
                    >
                      <Play className="w-4 h-4 inline mr-1" /> Start
                    </button>
                  )}
                  {room.status === 'finished' && isHost && (
                    <button
                      data-testid={`remove-room-btn-${idx}`}
                      onClick={() => deleteRoom(room.room_id)}
                      className="px-4 py-2 text-xs uppercase font-bold tracking-wider bg-transparent border border-[#D32F2F] text-[#F87171] hover:bg-[#D32F2F]/10 rounded-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
