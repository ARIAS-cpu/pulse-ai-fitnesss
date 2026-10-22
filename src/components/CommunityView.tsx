import React from 'react';
import { 
  Trophy, 
  Users, 
  Flame, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Crown, 
  ShieldCheck,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Challenge, AthleteRank } from '../types';

interface CommunityViewProps {
  challenges: Challenge[];
  leaderboard: AthleteRank[];
  onToggleJoinChallenge: (id: string) => void;
  onClaimReward: (id: string) => void;
  userXp: number;
  userLevel: number;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  challenges,
  leaderboard,
  onToggleJoinChallenge,
  onClaimReward,
  userXp,
  userLevel,
}) => {
  const currentLevelMinXp = (userLevel - 1) * 350;
  const nextLevelXp = userLevel * 350;
  const levelProgress = Math.min(100, Math.round(((userXp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100));

  const handleClaim = (id: string) => {
    onClaimReward(id);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Athlete Level & XP Progress Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#141e2b] via-[#101723] to-[#162130] border border-[#233144] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#b6f047]/20 border border-[#b6f047]/40 text-[#b6f047] flex items-center justify-center font-display font-bold text-xl">
              {userLevel}
            </div>
            <div>
              <span className="text-[10px] text-[#b6f047] font-bold uppercase tracking-wider block">Rango de Atleta</span>
              <h3 className="text-base font-bold text-white">Nivel {userLevel} · Titán PulseAI</h3>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-sm font-bold text-white">{userXp}</span>
            <span className="text-xs text-gray-400 font-normal"> / {nextLevelXp} XP</span>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div className="w-full h-2.5 bg-[#090d14] rounded-full overflow-hidden p-0.5 border border-[#1d293a]">
          <div 
            className="h-full bg-gradient-to-r from-[#b6f047] to-[#10b981] rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-right">
          Faltan {Math.max(0, nextLevelXp - userXp)} XP para subir al Nivel {userLevel + 1}
        </p>
      </div>

      {/* Weekly Challenges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#b6f047]" />
              Desafíos Semanales
            </h3>
            <p className="text-[11px] text-gray-400">Supera tus marcas y gana puntos de experiencia XP</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {challenges.map((ch) => {
            const isCompleted = ch.current >= ch.target;
            const progressPct = Math.min(100, Math.round((ch.current / ch.target) * 100));

            return (
              <div
                key={ch.id}
                className="p-4 rounded-2xl bg-[#111824] border border-[#1e2a3c] space-y-2.5 hover:border-[#2b3c53] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#b6f047] uppercase tracking-wider block">
                      +{ch.xpReward} XP · {ch.daysLeft} días restantes
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{ch.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{ch.description}</p>
                  </div>

                  {isCompleted ? (
                    <button
                      onClick={() => handleClaim(ch.id)}
                      className="px-3 py-1.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0 shadow-md shadow-[#b6f047]/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reclamar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleJoinChallenge(ch.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition shrink-0 ${
                        ch.joined
                          ? 'bg-[#182332] text-[#b6f047] border-[#2c3d55]'
                          : 'bg-[#151d2a] text-gray-300 border-[#222e40] hover:text-white'
                      }`}
                    >
                      {ch.joined ? 'Activo' : 'Unirse'}
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Progreso</span>
                    <span className="font-mono font-bold text-white">{ch.current} / {ch.target} {ch.unit}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#090d14] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-[#b6f047]' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PulseAI Community Leaderboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Clasificación de Atletas
            </h3>
            <p className="text-[11px] text-gray-400">Comunidad global de deportistas esta semana</p>
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.map((athlete) => {
            const isTop3 = athlete.rank <= 3;
            const rankColors = [
              'text-amber-400 border-amber-400/40 bg-amber-400/10',
              'text-slate-300 border-slate-300/40 bg-slate-300/10',
              'text-amber-600 border-amber-600/40 bg-amber-600/10',
            ];

            return (
              <div
                key={athlete.rank}
                className={`p-3 rounded-2xl flex items-center justify-between transition ${
                  athlete.isCurrentUser
                    ? 'bg-[#162334] border-2 border-[#b6f047]/60 shadow-md shadow-[#b6f047]/10'
                    : 'bg-[#101722] border border-[#1e2a3b]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div 
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-display font-bold text-xs border ${
                      isTop3 ? rankColors[athlete.rank - 1] : 'bg-[#151c27] text-gray-400 border-[#222e40]'
                    }`}
                  >
                    {athlete.rank === 1 ? <Crown className="w-3.5 h-3.5 fill-amber-400" /> : athlete.rank}
                  </div>

                  {/* Avatar */}
                  <img
                    src={athlete.avatar}
                    alt={athlete.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#2c3d55]"
                    referrerPolicy="no-referrer"
                  />

                  {/* Name and Badge */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {athlete.name}
                      </span>
                      {athlete.isCurrentUser && (
                        <span className="text-[9px] bg-[#b6f047] text-black font-bold px-1.5 py-0.2 rounded-full">
                          TÚ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Nivel {athlete.level} · {athlete.badge}
                    </span>
                  </div>
                </div>

                {/* Score XP */}
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-[#b6f047]">
                    {athlete.xp}
                  </span>
                  <span className="text-[10px] text-gray-400 block">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
