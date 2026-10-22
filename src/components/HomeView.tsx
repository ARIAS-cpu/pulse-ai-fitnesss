import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  TrendingUp, 
  Play, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Zap, 
  Dumbbell, 
  Plus, 
  Droplet, 
  Calculator, 
  Timer, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Trophy,
  Scale,
  Award
} from 'lucide-react';
import { ActivityRecord, SportKey, UserProfile, DayPlan, GymRoutine } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { TabType } from './BottomNav';

interface HomeViewProps {
  userProfile: UserProfile;
  activities: ActivityRecord[];
  streakDays: number;
  foodCaloriesConsumedToday?: number;
  waterMl?: number;
  weeklyPlan: DayPlan[];
  onUpdateWeeklyPlan: (updatedPlan: DayPlan[]) => void;
  routines: GymRoutine[];
  onNavigate: (tab: TabType) => void;
  onSelectSport: (sport: SportKey) => void;
  onStartRoutine: (routine: GymRoutine) => void;
  onOpenGymTools: () => void;
  onOpenAIRoutineModal: () => void;
  onAddWater: (amountMl: number) => void;
  onAddWeightQuick: (kg: number) => void;
  currentLanguage: Language;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  activities,
  streakDays,
  foodCaloriesConsumedToday = 0,
  waterMl = 0,
  weeklyPlan,
  onUpdateWeeklyPlan,
  routines,
  onNavigate,
  onSelectSport,
  onStartRoutine,
  onOpenGymTools,
  onOpenAIRoutineModal,
  onAddWater,
  onAddWeightQuick,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [editingPlanDay, setEditingPlanDay] = useState<string | null>(null);

  // Quick Rest Timer state inside Home
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // Quick Weight state
  const [quickWeightInput, setQuickWeightInput] = useState(userProfile.weightKg.toString());
  const [weightSavedFeedback, setWeightSavedFeedback] = useState(false);

  // Stats calculation
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekActivities = activities.filter(a => new Date(a.date) >= oneWeekAgo);

  const totalCaloriesThisWeek = weekActivities.reduce((acc, a) => acc + a.calories, 0);
  const totalMinutesThisWeek = weekActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const totalWorkoutsThisWeek = weekActivities.length;

  const calProgress = Math.min(100, Math.round((totalCaloriesThisWeek / (userProfile.dailyCalorieTarget * 7)) * 100));
  const minProgress = Math.min(100, Math.round((totalMinutesThisWeek / userProfile.weeklyMinutesTarget) * 100));
  const workoutProgress = Math.min(100, Math.round((totalWorkoutsThisWeek / userProfile.weeklyWorkoutsTarget) * 100));

  // Determine current day plan
  const dayIndex = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const dayKeys: Array<DayPlan['dayId']> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const todayPlan = weeklyPlan.find(p => p.dayId === dayKeys[dayIndex]) || weeklyPlan[0];

  const matchedRoutine = routines.find(r => r.id === todayPlan.routineId) || routines[0];

  // Rest Timer handler
  const startRestTimer = (secs: number) => {
    setTimerSeconds(secs);
    setTimerActive(true);
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // audio context fallback
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const handleDaySelectRoutine = (dayId: string, routineId: string) => {
    const updated = weeklyPlan.map(dp => {
      if (dp.dayId === dayId) {
        if (routineId === 'rest') {
          return { ...dp, isRest: true, routineId: undefined, routineTitle: 'Descanso Activo' };
        }
        const found = routines.find(r => r.id === routineId);
        return {
          ...dp,
          isRest: false,
          routineId,
          routineTitle: found?.title || 'Rutina Personalizada',
        };
      }
      return dp;
    });
    onUpdateWeeklyPlan(updated);
    setEditingPlanDay(null);
  };

  const handleQuickWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickWeightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      onAddWeightQuick(val);
      setWeightSavedFeedback(true);
      setTimeout(() => setWeightSavedFeedback(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 pt-2">
      {/* Top Greeting & Motivational Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b6f047] animate-pulse" />
            <p className="text-[11px] uppercase tracking-widest text-[#b6f047] font-black">
              PULSE.AI PRO
            </p>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            {now.getHours() < 12 
              ? t.home.greetingMorning 
              : now.getHours() < 20 
              ? t.home.greetingAfternoon 
              : t.home.greetingEvening}
          </h1>
          <p className="text-xs text-gray-400 capitalize">
            {new Intl.DateTimeFormat(currentLanguage === 'ca' ? 'ca-ES' : currentLanguage === 'en' ? 'en-US' : 'es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            }).format(now)}
          </p>
        </div>

        {/* Streak Flame Pill */}
        <div className="flex items-center gap-1.5 bg-[#17202c] border border-[#2b3a4e] px-3 py-1.5 rounded-2xl shadow-md">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
          <div className="text-right">
            <span className="text-xs font-black text-white">{streakDays}</span>
            <span className="text-[9px] text-gray-400 font-bold block -mt-0.5">DÍAS</span>
          </div>
        </div>
      </motion.div>

      {/* TODAY'S WORKOUT FEATURED CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-[#121926] via-[#0d131d] to-[#0a0e16] border border-[#26354a] shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#b6f047]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#b6f047]/20 border border-[#b6f047]/30 text-[#b6f047] text-[10px] font-black uppercase tracking-wider">
              {todayPlan.isRest ? 'Día de Recuperación' : 'Entrenamiento Programado'}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{todayPlan.dayName}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
          {todayPlan.isRest ? 'Descanso Activo & Movilidad' : todayPlan.routineTitle || matchedRoutine.title}
        </h2>

        {!todayPlan.isRest && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {matchedRoutine.description || 'Rutina balanceada enfocada en hipertrofia y sobrecarga progresiva.'}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-[#1e2a3c]">
          {!todayPlan.isRest && (
            <button
              onClick={() => onStartRoutine(matchedRoutine)}
              className="bg-[#00f59b] hover:bg-[#00df8c] text-black font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-[#00f59b]/20 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{t.home.startWorkoutNow}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('workout')}
            className="bg-[#141e2e] hover:bg-[#1d2b3f] text-[#00f59b] font-extrabold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-2 border border-[#233348] transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear / Sesión Libre</span>
          </button>

          <button
            onClick={() => onNavigate('workout')}
            className="bg-[#151d2a] hover:bg-[#1f2a3c] text-gray-300 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5 border border-[#243144] transition ml-auto"
          >
            <span>Más deportes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* CUSTOMIZABLE WEEKLY SCHEDULE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0f1420] border border-[#1e283a] rounded-3xl p-4 sm:p-5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#b6f047]" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {t.home.weeklySchedule}
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold">Toca un día para personalizarlo</span>
        </div>

        {/* Days Horizontal Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeklyPlan.map((p, idx) => {
            const isToday = idx === dayIndex;
            const isEditing = editingPlanDay === p.dayId;
            return (
              <div key={p.dayId} className="relative">
                <button
                  onClick={() => setEditingPlanDay(isEditing ? null : p.dayId)}
                  className={`w-full py-2.5 px-1 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                    isToday
                      ? 'bg-[#b6f047] text-black shadow-lg shadow-[#b6f047]/30 ring-2 ring-[#b6f047]'
                      : p.isRest
                      ? 'bg-[#121824] text-gray-400 hover:bg-[#1a2333] border border-[#1f2a3a]'
                      : 'bg-[#17202d] text-white hover:bg-[#202b3c] border border-[#28374d]'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">
                    {p.dayName.substring(0, 3)}
                  </span>
                  <div className="my-1">
                    {p.isRest ? (
                      <span className="text-[9px] font-bold opacity-60">OFF</span>
                    ) : (
                      <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                  <span className="text-[8px] font-extrabold truncate w-full px-0.5">
                    {p.isRest ? 'Descanso' : (p.routineTitle?.split(' ')[0] || 'Gym')}
                  </span>
                </button>

                {/* Popover to customize routine for this day */}
                {isEditing && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-56 bg-[#131b27] border border-[#2c3d54] rounded-2xl p-2.5 shadow-2xl space-y-1 text-xs">
                    <p className="text-[10px] font-black uppercase text-[#b6f047] px-2 py-1">
                      Asignar a {p.dayName}
                    </p>
                    <button
                      onClick={() => handleDaySelectRoutine(p.dayId, 'rest')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#1e293b] text-gray-300 font-semibold"
                    >
                      💤 Descanso Activo
                    </button>
                    {routines.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleDaySelectRoutine(p.dayId, r.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#1e293b] text-white font-semibold truncate"
                      >
                        🏋️ {r.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* METRICS DASHBOARD RINGS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-3xl bg-[#0f1420] border border-[#1e283a] shadow-xl relative"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#b6f047]" />
            Rendimiento Esta Semana
          </h2>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs text-[#b6f047] hover:underline flex items-center gap-0.5 font-bold"
          >
            <span>Ver Gráficas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-gray-300 flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {t.home.activeCalories}
              </span>
              <span className="text-white font-black font-mono">
                {totalCaloriesThisWeek.toLocaleString()} <span className="text-gray-500 font-normal">/ {(userProfile.dailyCalorieTarget * 7).toLocaleString()} kcal</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#182130] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-[#b6f047] rounded-full transition-all duration-700"
                style={{ width: `${calProgress}%` }}
              />
            </div>
          </div>

          {/* Active Minutes */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-gray-300 flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                {t.home.weeklyMinutes}
              </span>
              <span className="text-white font-black font-mono">
                {totalMinutesThisWeek} <span className="text-gray-500 font-normal">/ {userProfile.weeklyMinutesTarget} min</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#182130] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-[#38bdf8] rounded-full transition-all duration-700"
                style={{ width: `${minProgress}%` }}
              />
            </div>
          </div>

          {/* Workouts Done */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-gray-300 flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-[#b6f047]" />
                {t.home.completedSessions}
              </span>
              <span className="text-white font-black font-mono">
                {totalWorkoutsThisWeek} <span className="text-gray-500 font-normal">/ {userProfile.weeklyWorkoutsTarget} sesiones</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#182130] overflow-hidden">
              <div
                className="h-full bg-[#b6f047] rounded-full transition-all duration-700"
                style={{ width: `${workoutProgress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* APARTADOS PARA HACER MUCHAS COSAS (QUICK TOOLBOX) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#b6f047]" />
            {t.home.quickTools}
          </h3>
          <span className="text-[10px] text-gray-500 font-semibold">Acciones rápidas 1-tap</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Plate Calculator Tool */}
          <button
            onClick={onOpenGymTools}
            className="bg-[#0f1420] hover:bg-[#151c2a] border border-[#1e283a] hover:border-[#b6f047]/40 rounded-2xl p-3 text-left transition flex flex-col justify-between group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-[#b6f047]/10 flex items-center justify-center text-[#b6f047] mb-2 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{t.home.plateCalculator}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Discos por barra</p>
            </div>
          </button>

          {/* Rest Timer */}
          <button
            onClick={() => startRestTimer(90)}
            className="bg-[#0f1420] hover:bg-[#151c2a] border border-[#1e283a] hover:border-[#38bdf8]/40 rounded-2xl p-3 text-left transition flex flex-col justify-between group shadow-lg relative overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8] mb-2 group-hover:scale-110 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{t.home.restTimer}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {timerActive && timerSeconds !== null ? `${timerSeconds}s restantes` : 'Preset 90s'}
              </p>
            </div>
            {timerActive && (
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-[#38bdf8] font-black animate-pulse">
                <span>{timerSeconds}s</span>
              </div>
            )}
          </button>

          {/* AI Routine Generator */}
          <button
            onClick={onOpenAIRoutineModal}
            className="bg-[#0f1420] hover:bg-[#151c2a] border border-[#1e283a] hover:border-purple-400/40 rounded-2xl p-3 text-left transition flex flex-col justify-between group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{t.home.aiRoutine}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Crear con IA</p>
            </div>
          </button>

          {/* Quick Water Add */}
          <button
            onClick={() => onAddWater(250)}
            className="bg-[#0f1420] hover:bg-[#151c2a] border border-[#1e283a] hover:border-blue-400/40 rounded-2xl p-3 text-left transition flex flex-col justify-between group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{t.home.hydrationQuickAdd}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{waterMl} ml hoy</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* QUICK WEIGHT LOG WIDGET */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#0f1420] border border-[#1e283a] rounded-3xl p-4 shadow-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#16202e] flex items-center justify-center text-[#b6f047]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">{t.home.quickWeight}</h4>
            <p className="text-[10px] text-gray-400">Registrado recientemente: {userProfile.weightKg} kg</p>
          </div>
        </div>

        <form onSubmit={handleQuickWeightSubmit} className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={quickWeightInput}
            onChange={(e) => setQuickWeightInput(e.target.value)}
            className="w-16 bg-[#161d2a] border border-[#273549] rounded-xl py-1.5 px-2 text-center text-xs font-black text-white focus:outline-none focus:border-[#b6f047]"
          />
          <button
            type="submit"
            className="bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold text-xs px-3 py-1.5 rounded-xl transition active:scale-95"
          >
            {weightSavedFeedback ? '✓' : 'OK'}
          </button>
        </form>
      </motion.div>

      {/* ACTIVE WEEKLY CHALLENGE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#111724] to-[#0c111a] border border-[#1f2b3c] rounded-3xl p-4 shadow-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
              {t.home.weeklyChallenge}
            </span>
            <h4 className="text-xs font-black text-white">Iron Grip: 15 Toneladas de Gym</h4>
            <p className="text-[10px] text-gray-400">11.200 / 15.000 kg acumulados (+500 XP)</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('progress')}
          className="text-xs font-bold text-[#b6f047] hover:underline"
        >
          Ver
        </button>
      </motion.div>
    </div>
  );
};
