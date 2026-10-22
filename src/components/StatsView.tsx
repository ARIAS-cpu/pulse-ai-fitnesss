import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart2, 
  Flame, 
  Clock, 
  MapPin, 
  Trophy, 
  Trash2, 
  Award, 
  CheckCircle2, 
  Target, 
  ChevronRight,
  Filter,
  Scale,
  Users,
  Database,
  Download,
  TrendingUp,
  Zap,
  Activity,
  Calendar,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ActivityRecord, 
  Achievement, 
  Goal, 
  SportKey, 
  UserProfile, 
  WeightEntry, 
  BodyMeasurement, 
  Challenge, 
  AthleteRank,
  PersonalRecords,
  ProgressPhoto
} from '../types';
import { SPORTS } from '../data/initialData';
import { BodyMetricsView } from './BodyMetricsView';
import { CommunityView } from './CommunityView';
import { SaveProgressView } from './SaveProgressView';
import { OtherSportsView } from './OtherSportsView';
import { Language, TRANSLATIONS } from '../utils/translations';

interface StatsViewProps {
  activities: ActivityRecord[];
  goals: Goal[];
  achievements: Achievement[];
  userProfile: UserProfile;
  weightEntries: WeightEntry[];
  measurements: BodyMeasurement[];
  challenges: Challenge[];
  leaderboard: AthleteRank[];
  personalRecords?: PersonalRecords;
  onUpdatePersonalRecords?: (records: PersonalRecords) => void;
  progressPhotos?: ProgressPhoto[];
  onAddProgressPhoto?: (photo: ProgressPhoto) => void;
  onSaveActivity?: (activity: Omit<ActivityRecord, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  onAddMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  onUpdateProfileWeight: (newWeight: number) => void;
  onToggleJoinChallenge: (id: string) => void;
  onClaimReward: (id: string) => void;
  onOpenExportModal?: () => void;
  onResetAllData?: () => void;
  currentLanguage: Language;
}

export const StatsView: React.FC<StatsViewProps> = ({
  activities,
  goals,
  achievements,
  userProfile,
  weightEntries,
  measurements,
  challenges,
  leaderboard,
  personalRecords,
  onUpdatePersonalRecords,
  progressPhotos,
  onAddProgressPhoto,
  onSaveActivity,
  onDeleteActivity,
  onAddWeightEntry,
  onAddMeasurement,
  onUpdateProfileWeight,
  onToggleJoinChallenge,
  onClaimReward,
  onOpenExportModal,
  onResetAllData,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [subTab, setSubTab] = useState<'analytics' | 'save_progress' | 'sports_progress' | 'history' | 'body' | 'community' | 'achievements'>('analytics');
  const [sportFilter, setSportFilter] = useState<string>('todos');

  const totalCalories = activities.reduce((acc, a) => acc + a.calories, 0);
  const totalMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const totalDistance = activities.reduce((acc, a) => acc + (a.distanceKm || 0), 0);
  const totalWorkouts = activities.length;

  const filteredActivities = sportFilter === 'todos'
    ? activities
    : activities.filter((a) => a.sport === sportFilter);

  const handleCelebrateBadge = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Calculate real daily calories for the last 7 calendar days from activities
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const todayDate = new Date();

  const weeklyDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(todayDate.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayActs = activities.filter((a) => a.date && a.date.split('T')[0] === dStr);
    const kcal = dayActs.reduce((sum, a) => sum + a.calories, 0);
    return {
      day: dayLabels[d.getDay()],
      date: dStr,
      kcal,
      completed: kcal > 0,
    };
  });

  const maxKcal = Math.max(500, ...weeklyDays.map((w) => w.kcal));
  const weekTotalKcal = weeklyDays.reduce((sum, w) => sum + w.kcal, 0);
  const avgKcalPerDay = Math.round(weekTotalKcal / 7);

  // Muscle Volume distribution from real activities
  const gymActivities = activities.filter((a) => a.sport === 'gym');
  const totalGymVolume = gymActivities.reduce((acc, a) => acc + (a.totalVolumeKg || 0), 0);

  const muscleVolumeMap: Record<string, number> = {
    Pecho: 0,
    Espalda: 0,
    Piernas: 0,
    'Brazos & Hombros': 0,
  };

  gymActivities.forEach((act) => {
    const actVolume = act.totalVolumeKg || 0;
    const groups = act.muscleGroupsTrained || [];
    if (groups.length > 0) {
      const volPerGroup = actVolume / groups.length;
      groups.forEach((g) => {
        const gl = g.toLowerCase();
        if (gl.includes('pecho') || gl.includes('chest')) muscleVolumeMap.Pecho += volPerGroup;
        else if (gl.includes('espalda') || gl.includes('back')) muscleVolumeMap.Espalda += volPerGroup;
        else if (gl.includes('pierna') || gl.includes('leg') || gl.includes('glúteo') || gl.includes('cuádriceps')) muscleVolumeMap.Piernas += volPerGroup;
        else if (gl.includes('hombro') || gl.includes('bíceps') || gl.includes('tríceps') || gl.includes('brazo')) muscleVolumeMap['Brazos & Hombros'] += volPerGroup;
        else muscleVolumeMap.Pecho += volPerGroup;
      });
    } else if (actVolume > 0) {
      muscleVolumeMap.Pecho += actVolume * 0.25;
      muscleVolumeMap.Espalda += actVolume * 0.25;
      muscleVolumeMap.Piernas += actVolume * 0.25;
      muscleVolumeMap['Brazos & Hombros'] += actVolume * 0.25;
    }
  });

  const muscleVolumeList = [
    { muscle: 'Pecho', share: totalGymVolume > 0 ? Math.round((muscleVolumeMap.Pecho / totalGymVolume) * 100) : 0, color: '#00f59b' },
    { muscle: 'Espalda', share: totalGymVolume > 0 ? Math.round((muscleVolumeMap.Espalda / totalGymVolume) * 100) : 0, color: '#38bdf8' },
    { muscle: 'Piernas', share: totalGymVolume > 0 ? Math.round((muscleVolumeMap.Piernas / totalGymVolume) * 100) : 0, color: '#f59e0b' },
    { muscle: 'Brazos & Hombros', share: totalGymVolume > 0 ? Math.round((muscleVolumeMap['Brazos & Hombros'] / totalGymVolume) * 100) : 0, color: '#ec4899' },
  ];

  // Athlete rank & real progression
  const athleteLevel = userProfile.athleteLevel ?? 1;
  const currentXp = userProfile.totalXp ?? 0;
  const xpIntoLevel = currentXp % 350;
  const xpNeeded = 350;
  const xpRemaining = Math.max(0, xpNeeded - xpIntoLevel);
  const xpProgressPct = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  const levelTitles: Record<number, string> = {
    1: 'Atleta Iniciado',
    2: 'Atleta Constante',
    3: 'Guerrero Fitness',
    4: 'Atleta Avanzado',
    5: 'Maestro de la Fuerza',
  };
  const athleteTitle = levelTitles[athleteLevel] || `Titán Élite (Nivel ${athleteLevel})`;

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#121926] to-[#0c121b] border border-[#202b3c] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#b6f047]/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b6f047]" />
            <p className="text-[11px] font-black uppercase tracking-widest text-[#b6f047]">
              Pulse.AI Analytics
            </p>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            {t.progress.title}
          </h1>
          <p className="text-xs text-gray-400">
            {t.progress.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setSubTab('save_progress')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition ${
              subTab === 'save_progress'
                ? 'bg-[#b6f047] text-black shadow-lg shadow-[#b6f047]/20'
                : 'bg-[#152132] hover:bg-[#1d2d42] border border-[#273a52] text-[#b6f047]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Guardar Progreso</span>
          </button>

          <button
            onClick={() => setSubTab('sports_progress')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition ${
              subTab === 'sports_progress'
                ? 'bg-[#00f59b] text-black shadow-lg shadow-[#00f59b]/20'
                : 'bg-[#152132] hover:bg-[#1d2d42] border border-[#273a52] text-[#00f59b]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>🏅 Otros Deportes</span>
          </button>

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 bg-[#182333] hover:bg-[#202e42] border border-[#2b3d54] text-xs font-bold text-gray-200 px-3 py-2 rounded-xl transition"
              title="Exportar datos de entrenamiento"
            >
              <Download className="w-3.5 h-3.5 text-[#b6f047]" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs horizontal selector */}
      <div className="flex bg-[#0f1420] p-1 rounded-2xl border border-[#1e283a] overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'analytics', label: t.progress.overviewTab, icon: TrendingUp },
          { id: 'save_progress', label: 'Guardar Progreso', icon: Sparkles },
          { id: 'sports_progress', label: 'Otros Deportes', icon: Activity },
          { id: 'history', label: t.progress.historyTab, icon: BarChart2 },
          { id: 'body', label: 'Biometría', icon: Scale },
          { id: 'community', label: 'Comunidad', icon: Users },
          { id: 'achievements', label: t.progress.achievementsTab, icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-[#b6f047] text-black shadow-md shadow-[#b6f047]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: ANALYTICS & INTERACTIVE VISUALIZATIONS */}
      {subTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0f1420] border border-[#1e283a] shadow-lg">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-1">
                <BarChart2 className="w-4 h-4 text-[#b6f047]" />
                <span>{t.progress.totalWorkouts}</span>
              </div>
              <div className="font-mono text-2xl font-black text-white">{totalWorkouts}</div>
              <span className="text-[10px] text-gray-400 font-bold">
                {totalWorkouts === 0 ? 'Sin registros aún' : `${activities.filter(a => { const d = new Date(a.date); const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); return d >= weekAgo; }).length} esta semana`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1420] border border-[#1e283a] shadow-lg">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{t.progress.totalCalories}</span>
              </div>
              <div className="font-mono text-2xl font-black text-white">
                {totalCalories.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
              </div>
              <span className="text-[10px] text-orange-400 font-bold">
                {totalCalories === 0 ? 'Por iniciar' : `${Math.min(100, Math.round((totalCalories / (userProfile.dailyCalorieTarget * 7)) * 100))}% de meta semanal`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1420] border border-[#1e283a] shadow-lg">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-1">
                <Clock className="w-4 h-4 text-[#38bdf8]" />
                <span>{t.progress.totalHours}</span>
              </div>
              <div className="font-mono text-2xl font-black text-white">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </div>
              <span className="text-[10px] text-[#38bdf8] font-bold">
                {totalMinutes === 0 ? '0 min activos' : `${totalMinutes} min registrados`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1420] border border-[#1e283a] shadow-lg">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Nivel Atleta</span>
              </div>
              <div className="font-mono text-2xl font-black text-[#b6f047]">
                LVL {athleteLevel}
              </div>
              <span className="text-[10px] text-gray-400 font-bold">{currentXp} XP acumulados</span>
            </div>
          </div>

          {/* Weekly Calorie Burn Animated Chart */}
          <div className="bg-[#0f1420] border border-[#1e283a] rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Gasto Calórico Diario (Últimos 7 Días)
                </h3>
                <p className="text-xs text-gray-400">Intensidad real por jornada de entrenamiento</p>
              </div>
              <span className="text-xs font-mono font-black text-[#b6f047]">
                Media: ~{avgKcalPerDay} kcal/día
              </span>
            </div>

            {/* Custom SVG / Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
              {weeklyDays.map((item, idx) => {
                const heightPct = Math.min(100, Math.round((item.kcal / maxKcal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {item.kcal > 0 && (
                      <span className="text-[9px] font-mono text-gray-400 group-hover:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.kcal}
                      </span>
                    )}
                    <div className="w-full max-w-[36px] bg-[#161d2b] rounded-xl h-full flex items-end p-1 overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`w-full rounded-lg ${
                          item.completed
                            ? 'bg-gradient-to-t from-[#b6f047] to-[#38bdf8] shadow-lg shadow-[#b6f047]/20'
                            : 'bg-[#232f42]'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-[#b6f047] transition-colors">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {weekTotalKcal === 0 && (
              <p className="text-[11px] text-gray-500 text-center mt-3 pt-3 border-t border-[#1a2538]">
                Aún no hay entrenamientos registrados en los últimos 7 días. Tus barras se elevarán en cuanto completes tu primera sesión.
              </p>
            )}
          </div>

          {/* Gym Muscle Volume & Overload Visualizer */}
          <div className="bg-[#0f1420] border border-[#1e283a] rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00f59b]" />
                  Sobrecarga Progresiva & Distribución de Cargas
                </h3>
                <p className="text-xs text-gray-400">Balance neuromuscular de tus sesiones de fuerza</p>
              </div>
              <span className="text-xs font-mono font-black text-[#00f59b]">
                {totalGymVolume.toLocaleString()} kg acumulados
              </span>
            </div>

            {totalGymVolume === 0 ? (
              <div className="p-4 rounded-2xl bg-[#121927] border border-[#1e2a3c] text-center">
                <p className="text-xs text-gray-400">
                  0 kg acumulados. Tus marcas y distribución muscular aparecerán aquí en cuanto registres tu primera sesión en el apartado <span className="text-[#00f59b] font-bold">Entrenar</span>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {muscleVolumeList.map((m, idx) => (
                  <div key={idx} className="bg-[#121927] border border-[#1e2a3c] rounded-2xl p-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-gray-200">{m.muscle}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: m.color }}>{m.share}%</span>
                    </div>
                    <div className="w-full bg-[#1b2536] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.share}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * idx }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Athletic XP & Rank Banner */}
          <div className="bg-gradient-to-br from-[#121b29] to-[#0a0f18] border border-[#213045] rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#b6f047] to-amber-400 p-0.5 shadow-lg shadow-[#b6f047]/20">
                <div className="w-full h-full bg-[#0a0e16] rounded-[14px] flex items-center justify-center text-[#b6f047]">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-[#b6f047] uppercase tracking-wider">
                  Rango Competitivo
                </span>
                <h3 className="text-lg font-black text-white">
                  {athleteTitle} • Nivel {athleteLevel}
                </h3>
                <p className="text-xs text-gray-400">
                  {xpRemaining === 0 ? '¡Nivel máximo alcanzado!' : `${xpRemaining} XP para alcanzar Nivel ${athleteLevel + 1}`}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48">
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
                <span>Progreso</span>
                <span>{xpProgressPct}%</span>
              </div>
              <div className="w-full bg-[#182333] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#b6f047] to-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${xpProgressPct}%` }} 
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB-VIEW 2: HISTORY */}
      {subTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Sport Filter Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSportFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                sportFilter === 'todos'
                  ? 'bg-[#b6f047] text-black font-black shadow'
                  : 'bg-[#0f1420] text-gray-400 border border-[#1e283a] hover:text-white'
              }`}
            >
              Todos ({activities.length})
            </button>
            {(Object.keys(SPORTS) as SportKey[]).map((key) => {
              const sp = SPORTS[key];
              const count = activities.filter((a) => a.sport === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSportFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    sportFilter === key
                      ? 'bg-[#b6f047] text-black font-black shadow'
                      : 'bg-[#0f1420] text-gray-400 border border-[#1e283a] hover:text-white'
                  }`}
                >
                  <span>{sp.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Activities list */}
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 bg-[#0f1420] rounded-3xl border border-[#1e283a]">
                <Activity className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No hay sesiones en esta categoría</p>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const sport = SPORTS[act.sport] || SPORTS.gym;
                return (
                  <div
                    key={act.id}
                    className="bg-[#0f1420] border border-[#1e283a] hover:border-[#b6f047]/40 rounded-2xl p-4 shadow-lg flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-black font-bold shadow"
                        style={{ backgroundColor: sport.color }}
                      >
                        <Zap className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">{act.title}</h4>
                          <span className="text-[10px] text-gray-500 font-semibold">{act.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-500" /> {act.durationMinutes} min
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-400 font-bold">
                            <Flame className="w-3.5 h-3.5" /> {act.calories} kcal
                          </span>
                          {act.distanceKm && (
                            <>
                              <span>•</span>
                              <span className="text-[#38bdf8] font-bold">{act.distanceKm} km</span>
                            </>
                          )}
                        </div>
                        {act.notes && (
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{act.notes}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="text-gray-500 hover:text-red-400 p-2 transition opacity-60 group-hover:opacity-100"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* SUB-VIEW 3: BODY COMPOSITION & METRICS */}
      {subTab === 'body' && (
        <BodyMetricsView
          weightEntries={weightEntries}
          measurements={measurements}
          userProfile={userProfile}
          onAddWeightEntry={onAddWeightEntry}
          onAddMeasurement={onAddMeasurement}
          onUpdateProfileWeight={onUpdateProfileWeight}
        />
      )}

      {/* SUB-VIEW 4: COMMUNITY & CHALLENGES */}
      {subTab === 'community' && (
        <CommunityView
          challenges={challenges}
          leaderboard={leaderboard}
          userXp={userProfile.totalXp ?? 0}
          userLevel={userProfile.athleteLevel ?? 1}
          onToggleJoinChallenge={onToggleJoinChallenge}
          onClaimReward={onClaimReward}
        />
      )}

      {/* SUB-VIEW 5: ACHIEVEMENTS & TROPHIES */}
      {subTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                {t.progress.achievementsTab}
              </h3>
              <p className="text-xs text-gray-400">Trofeos desbloqueados por tus hitos y consistencia</p>
            </div>
            <button
              onClick={handleCelebrateBadge}
              className="text-xs text-[#b6f047] font-bold hover:underline"
            >
              Celebrar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  ach.unlocked
                    ? 'bg-[#0f1420] border-[#1e283a] shadow-lg hover:border-amber-400/40'
                    : 'bg-[#0b0e14] border-[#18212e] opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    ach.unlocked
                      ? 'bg-gradient-to-tr from-amber-500/20 to-[#b6f047]/20 border border-amber-500/30'
                      : 'bg-[#151c27] border border-[#202a3a]'
                  }`}
                >
                  {ach.icon || '🏆'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white">{ach.title}</h4>
                    {ach.unlocked && (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        CONSEGUIDO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{ach.description}</p>
                  {(ach.unlockedAt || ach.unlockedDate) && (
                    <span className="text-[9px] text-gray-500 mt-1 block">
                      Obtenido {ach.unlockedAt || ach.unlockedDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SUB-VIEW: GUARDAR PROGRESO ULTRA-SENCILLO */}
      {subTab === 'save_progress' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SaveProgressView
            userProfile={userProfile}
            personalRecords={personalRecords}
            onUpdatePersonalRecords={onUpdatePersonalRecords}
            weightEntries={weightEntries}
            onAddWeightEntry={onAddWeightEntry}
            measurements={measurements}
            onAddMeasurement={onAddMeasurement}
            onUpdateProfileWeight={onUpdateProfileWeight}
            progressPhotos={progressPhotos}
            onAddProgressPhoto={onAddProgressPhoto}
            onSaveActivity={onSaveActivity}
            onResetAllData={onResetAllData}
          />
        </motion.div>
      )}

      {/* SUB-VIEW: PROGRESO EN OTROS DEPORTES */}
      {subTab === 'sports_progress' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OtherSportsView
            userProfile={userProfile}
            activities={activities}
            onSaveActivity={onSaveActivity}
            onDeleteActivity={onDeleteActivity}
          />
        </motion.div>
      )}
    </div>
  );
};
