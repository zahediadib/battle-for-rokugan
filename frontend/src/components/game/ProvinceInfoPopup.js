import React from 'react';
import { X, Shield, Flower2, MapPin, Crown, Waves, Sword } from 'lucide-react';
import { PROVINCE_MAP, CLANS, TERRITORY_LABELS, SPECIAL_LABELS } from '../../constants/gameConstants';

export default function ProvinceInfoPopup({ provinceId, gameState, onClose }) {
  if (!provinceId) return null;
  const provData = PROVINCE_MAP[provinceId];
  if (!provData) return null;

  const provState = gameState?.provinces?.[provinceId];
  const controller = provState?.controlled_by;
  const controllerClan = controller !== null && controller !== undefined && gameState.players[controller]
    ? gameState.players[controller].clan : null;
  const clanInfo = controllerClan ? CLANS[controllerClan] : null;

  // Count face-up control tokens for defense bonus
  const faceUpCount = provState?.control_tokens?.filter(ct => ct.face_up).length || 0;
  const totalControlTokens = provState?.control_tokens?.length || 0;

  // Calculate total defense
  let totalDefense = provData.baseDefense;
  if (provState?.control_tokens) {
    for (const ct of provState.control_tokens) {
      if (ct.face_up) {
        const ctPlayer = gameState.players[ct.player_index];
        totalDefense += ctPlayer?.clan === 'crab' ? 2 : 1;
      }
    }
  }
  // Bonus tokens
  const bonusDefense = provState?.bonus_tokens?.filter(b => b.type === 'defense').reduce((s, b) => s + (b.value || 0), 0) || 0;
  totalDefense += bonusDefense;

  const bonusHonor = provState?.bonus_tokens?.filter(b => b.type === 'honor').reduce((s, b) => s + (b.value || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose} data-testid="province-info-popup">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 glass-panel rounded-sm p-5 max-w-sm w-full animate-modal-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-bold text-[#D4AF37]">{provData.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded" data-testid="close-province-info">
            <X className="w-4 h-4 text-[#A1A1AA]" />
          </button>
        </div>

        {/* Province details */}
        <div className="space-y-3">
          {/* Territory */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA] flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Territory</span>
            <span className="text-[#F5F5F0] font-bold">{TERRITORY_LABELS[provData.territoryId] || provData.territoryId}</span>
          </div>

          {/* Owner */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA] flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" /> Owner</span>
            {clanInfo ? (
              <span className="font-bold" style={{ color: clanInfo.color }}>{clanInfo.name}</span>
            ) : (
              <span className="text-[#A1A1AA]">Uncontrolled</span>
            )}
          </div>

          {/* Capital */}
          {provData.isCapital && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A1A1AA]">Status</span>
              <span className="text-[#D4AF37] font-bold">Capital (+{provData.baseDefense} base defense)</span>
            </div>
          )}

          {/* Coastal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA] flex items-center gap-1.5"><Waves className="w-3.5 h-3.5" /> Coastal</span>
            <span className={provData.isCoastal ? 'text-[#60A5FA]' : 'text-[#A1A1AA]'}>
              {provData.isCoastal ? 'Yes (Navy can attack/defend)' : 'No (Landlocked)'}
            </span>
          </div>

          {/* Flowers (Honor) */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA] flex items-center gap-1.5"><Flower2 className="w-3.5 h-3.5" /> Flowers</span>
            <span className="text-[#D4AF37] font-bold">{provData.flowers} {bonusHonor > 0 ? `(+${bonusHonor} bonus)` : ''}</span>
          </div>

          {/* Defense */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA] flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Total Defense</span>
            <span className="text-[#F5F5F0] font-bold">{totalDefense}</span>
          </div>

          {/* Breakdown */}
          <div className="text-[10px] text-[#A1A1AA] pl-6 space-y-0.5">
            {provData.baseDefense > 0 && <div>Base: +{provData.baseDefense}</div>}
            {faceUpCount > 0 && <div>Face-up tokens: +{faceUpCount} ({totalControlTokens} total)</div>}
            {bonusDefense > 0 && <div>Bonus tokens: +{bonusDefense}</div>}
          </div>

          {/* Special Token */}
          {provState?.special_token && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A1A1AA]">Special</span>
              <span className="text-[#F57C00] font-bold">{SPECIAL_LABELS[provState.special_token] || provState.special_token}</span>
            </div>
          )}

          {/* Combat tokens */}
          {provState?.combat_tokens?.length > 0 && (
            <div>
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                <Sword className="w-3 h-3" /> Combat Tokens ({provState.combat_tokens.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {provState.combat_tokens.map((ct, i) => {
                  const owner = ct.player_index !== undefined && gameState.players[ct.player_index];
                  return (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/10" style={{
                      color: owner ? CLANS[owner.clan]?.color : '#A1A1AA',
                    }}>
                      {ct.face_up ? `${ct.type} ${ct.strength}` : 'Hidden'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
