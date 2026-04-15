import React from 'react';
import { Shield, Swords } from 'lucide-react';

const CLANS = [
  { id: 'crab', name: 'Crab', color: '#9CA3AF', ability: 'Face-up control tokens have +2 defense instead of +1.', capital: 'crab_3' },
  { id: 'crane', name: 'Crane', color: '#60A5FA', ability: 'When tied in battle, you win instead.', capital: 'crane_3' },
  { id: 'dragon', name: 'Dragon', color: '#34D399', ability: 'Draw 1 additional token, return 1 non-bluff.', capital: 'dragon_2' },
  { id: 'lion', name: 'Lion', color: '#FBBF24', ability: 'Bluff token has +2 defense and is not discarded defending.', capital: 'lion_2' },
  { id: 'phoenix', name: 'Phoenix', color: '#FB923C', ability: 'Ignore clan capital defenses when attacking.', capital: 'phoenix_3' },
  { id: 'scorpion', name: 'Scorpion', color: '#F87171', ability: 'Once per round, look at one combat token on the board.', capital: 'scorpion_1' },
  { id: 'unicorn', name: 'Unicorn', color: '#A78BFA', ability: 'Before reveal, switch two of your combat tokens.', capital: 'unicorn_2' },
];

export default function ClanSelect({ gameState, myPlayer, sendAction, isSpectator }) {
  const takenClans = gameState.players?.filter(p => p.clan).map(p => p.clan) || [];
  const mySelected = myPlayer?.clan;

  if (isSpectator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" data-testid="clan-select-spectator">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-[#D4AF37] mb-4">Clan Selection</h2>
          <p className="text-[#A1A1AA]">Players are choosing their clans...</p>
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            {gameState.players?.map((p, i) => (
              <div key={i} className="glass-panel rounded-sm px-4 py-2 text-center">
                <p className="text-sm text-[#A1A1AA]">{p.username}</p>
                {p.clan ? (
                  <p className="font-heading font-bold mt-1" style={{ color: CLANS.find(c => c.id === p.clan)?.color }}>
                    {CLANS.find(c => c.id === p.clan)?.name}
                  </p>
                ) : <p className="text-[#A1A1AA] text-xs mt-1">Choosing...</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mySelected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" data-testid="clan-selected-waiting">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-[#D4AF37] mb-4">Clan Selected</h2>
          <div className="inline-block glass-panel rounded-sm px-8 py-4 mb-6">
            <p className="font-heading text-2xl font-bold" style={{ color: CLANS.find(c => c.id === mySelected)?.color }}>
              {CLANS.find(c => c.id === mySelected)?.name}
            </p>
          </div>
          <p className="text-[#A1A1AA]">Waiting for other players to choose...</p>
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            {gameState.players?.map((p, i) => (
              <div key={i} className="glass-panel rounded-sm px-4 py-2 text-center">
                <p className="text-sm text-[#A1A1AA]">{p.username}</p>
                {p.clan ? (
                  <p className="font-heading font-bold mt-1" style={{ color: CLANS.find(c => c.id === p.clan)?.color }}>
                    {CLANS.find(c => c.id === p.clan)?.name}
                  </p>
                ) : <p className="text-[#A1A1AA] text-xs mt-1">Choosing...</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6" data-testid="clan-select">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-[#D4AF37] mb-3">Choose Your Clan</h2>
          <p className="text-[#A1A1AA] text-sm">Select a clan to lead into battle</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CLANS.map((clan) => {
            const taken = takenClans.includes(clan.id);
            return (
              <button
                key={clan.id}
                data-testid={`clan-${clan.id}`}
                onClick={() => !taken && sendAction({ action: 'select_clan', clan: clan.id })}
                disabled={taken}
                className={`glass-panel rounded-sm p-5 text-left transition-all duration-300 ${
                  taken ? 'opacity-30 cursor-not-allowed' : 'hover:border-white/30 hover:-translate-y-1 cursor-pointer'
                }`}
                style={{ borderColor: taken ? undefined : `${clan.color}33` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: clan.color }} />
                  <h3 className="font-heading text-lg font-bold" style={{ color: clan.color }}>{clan.name}</h3>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{clan.ability}</p>
                {taken && (
                  <p className="text-xs text-[#F87171] mt-2 font-bold uppercase">Taken</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Player selections */}
        <div className="flex justify-center gap-4 mt-8">
          {gameState.players?.map((p, i) => (
            <div key={i} className="glass-panel rounded-sm px-4 py-2 text-center min-w-24">
              <p className="text-xs text-[#A1A1AA]">{p.username}</p>
              {p.clan ? (
                <p className="font-heading text-sm font-bold mt-1" style={{ color: CLANS.find(c => c.id === p.clan)?.color }}>
                  {CLANS.find(c => c.id === p.clan)?.name}
                </p>
              ) : (
                <div className="w-4 h-1 bg-white/20 mx-auto mt-2 rounded" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
