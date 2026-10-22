import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Play, 
  Plus, 
  Trophy, 
  Flame, 
  Clock, 
  MapPin, 
  Heart, 
  Sparkles, 
  Check, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Zap,
  Info,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActivityRecord, SportKey, UserProfile, SportInfo } from '../types';
import { SPORTS, calculateCalories } from '../data/initialData';
import { playSetCompleteSound, triggerHaptic } from '../utils/soundEffects';

interface OtherSportsViewProps {
  userProfile: UserProfile;
  activities: ActivityRecord[];
  onSaveActivity?: (activity: Omit<ActivityRecord, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
}

export const OtherSportsView: React.FC<OtherSportsViewProps> = ({
  userProfile,
  activities,
  onSaveActivity,
  onDeleteActivity,
}) => {
  // Available sports excluding 'gym'
  const sportKeys = (Object.keys(SPORTS) as SportKey[]).filter((k) => k !== 'gym');

  const [selectedSport, setSelectedSport] = useState<SportKey>('running');
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [swimmingMeters, setSwimmingMeters] = useState<number>(1000);
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [milestoneNote, setMilestoneNote] = useState<string>('');
  const [rpe, setRpe] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const sportInfo: SportInfo = SPORTS[selectedSport] || SPORTS.running;
  const isSwimming = selectedSport === 'swimming';
  const tracksDistance = sportInfo.tracksDistance || isSwimming;

  // Real-time calculations
  const estimatedCalories = calculateCalories(selectedSport, durationMinutes, userProfile.weightKg);

  // Pace calculation (min/km)
  const paceMinutes = distanceKm > 0 && durationMinutes > 0
    ? (durationMinutes / distanceKm)
    : 0;
  const paceFormatted = paceMinutes > 0
    ? `${Math.floor(paceMinutes)}:${Math.round((paceMinutes % 1) * 60).toString().padStart(2, '0')} min/km`
    : '--';

  // Swimming pace /100m
  const swimPaceSec = swimmingMeters > 0 && durationMinutes > 0
    ? (durationMinutes * 60) / (swimmingMeters / 100)
    : 0;
  const swimPaceFormatted = swimPaceSec > 0
    ? `${Math.floor(swimPaceSec / 60)}:${Math.round(swimPaceSec % 60).toString().padStart(2, '0')} /100m`
    : '--';

  // Speed calculation (km/h)
  const speedKmh = distanceKm > 0 && durationMinutes > 0
    ? ((distanceKm / durationMinutes) * 60).toFixed(1)
    : '0';

  // Filter activities to show only non-gym sports
  const otherSportsActivities = activities.filter((a) => a.sport !== 'gym');

  // Sport personal records from logged activities
  const runningActivities = activities.filter((a) => a.sport === 'running');
  const bestRunningDistance = runningActivities.reduce((max, a) => Math.max(max, a.distanceKm || 0), 0);
  const maxRunningMinutes = runningActivities.reduce((max, a) => Math.max(max, a.durationMinutes || 0), 0);

  const cyclingActivities = activities.filter((a) => a.sport === 'cycling');
  const bestCyclingDistance = cyclingActivities.reduce((max, a) => Math.max(max, a.distanceKm || 0), 0);

  const swimmingActivities = activities.filter((a) => a.sport === 'swimming');
  const totalSwimmingMeters = swimmingActivities.reduce((acc, a) => acc + ((a.distanceKm || 0) * 1000), 0);

  const totalOtherSportsWorkouts = otherSportsActivities.length;
  const totalOtherCalories = otherSportsActivities.reduce((sum, a) => sum + a.calories, 0);
  const totalOtherMinutes = otherSportsActivities.reduce((sum, a) => sum + a.durationMinutes, 0);

  const handleSaveSportProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveActivity) return;

    const finalDistance = isSwimming ? swimmingMeters / 1000 : tracksDistance ? distanceKm : undefined;
    const finalTitle = activityTitle.trim() || `Sesión de ${sportInfo.label.split('/')[0]}`;

    onSaveActivity({
      date: activityDate,
      sport: selectedSport,
      title: finalTitle,
      durationMinutes,
      calories: estimatedCalories,
      distanceKm: finalDistance,
      rpe,
      notes: milestoneNote ? `[Marca / Hito: ${milestoneNote}] ${notes}` : notes || undefined,
    });

    triggerHaptic('success');
    playSetCompleteSound();
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
    });

    setSuccessToast(`¡Progreso en ${sportInfo.label.split('/')[0]} guardado! +${estimatedCalories} kcal`);
    setTimeout(() => setSuccessToast(null), 3500);

    // Reset some form fields
    setMilestoneNote('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#00f59b] text-black font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-black/20"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Card */}
      <div className="bg-[#0e1420] border border-[#1b2738] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sportInfo.color }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00f59b]">
                Subapartado Multideporte
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              Progresos en Otros Deportes
            </h2>
            <p className="text-xs text-gray-400">
              Guarda tus salidas de running, ciclismo, natación, partidos y deportes al aire libre.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#121927] border border-[#1f2b3e] px-3 py-1.5 rounded-xl self-start sm:self-center">
            <Trophy className="w-4 h-4 text-[#00f59b]" />
            <span className="text-xs font-bold text-gray-300">
              {totalOtherSportsWorkouts} {totalOtherSportsWorkouts === 1 ? 'sesión' : 'sesiones'}
            </span>
          </div>
        </div>

        {/* Sports Horizontal Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-400 mb-2">
            Selecciona el Deporte:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {sportKeys.map((key) => {
              const s = SPORTS[key];
              const isSelected = selectedSport === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedSport(key);
                    triggerHaptic('light');
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#152132] border-[#00f59b] shadow-lg shadow-[#00f59b]/10'
                      : 'bg-[#101724] border-[#1d293d] text-gray-400 hover:text-white hover:border-[#2b3c56]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="truncate">
                    <span className="block text-xs font-black text-white truncate">
                      {s.label.split('/')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Progress Form */}
        <form onSubmit={handleSaveSportProgress} className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#090e17] border border-[#192435] space-y-3.5">
            {/* Title & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Título de la Sesión o Partido
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder={`ej: Salida en ${sportInfo.label.split('/')[0]}, Partido de fin de semana...`}
                  className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f59b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f59b]"
                />
              </div>
            </div>

            {/* Duration with quick presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-gray-400">
                  Duración del Entrenamiento:
                </label>
                <span className="text-xs font-black text-white font-mono">
                  {durationMinutes} minutos
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[20, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      durationMinutes === mins
                        ? 'bg-[#00f59b] text-black font-black'
                        : 'bg-[#121926] text-gray-400 hover:text-white border border-[#1d2b3e]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Distance or Swimming meters */}
            {tracksDistance && (
              <div className="pt-2 border-t border-[#162132]">
                {isSwimming ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-gray-400">
                        Distancia Nadada (Metros)
                      </label>
                      <span className="text-xs font-bold text-[#38bdf8]">
                        Ritmo: {swimPaceFormatted}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSwimmingMeters((m) => Math.max(100, m - 100))}
                        className="w-9 h-9 rounded-xl bg-[#141e2e] border border-[#223146] text-white font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="50"
                        min="50"
                        max="20000"
                        value={swimmingMeters}
                        onChange={(e) => setSwimmingMeters(parseInt(e.target.value) || 0)}
                        className="flex-1 bg-[#101724] border border-[#202e42] rounded-xl px-3 py-2 text-center text-lg font-black text-white focus:outline-none focus:border-[#00f59b]"
                      />
                      <button
                        type="button"
                        onClick={() => setSwimmingMeters((m) => m + 100)}
                        className="w-9 h-9 rounded-xl bg-[#141e2e] border border-[#223146] text-[#00f59b] font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-gray-400">
                        Distancia Recorrida (km)
                      </label>
                      <span className="text-xs font-bold text-[#00f59b]">
                        Ritmo: {paceFormatted} ({speedKmh} km/h)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDistanceKm((d) => Math.max(0.5, +(d - 0.5).toFixed(1)))}
                        className="w-9 h-9 rounded-xl bg-[#141e2e] border border-[#223146] text-white font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="250"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-[#101724] border border-[#202e42] rounded-xl px-3 py-2 text-center text-lg font-black text-white focus:outline-none focus:border-[#00f59b]"
                      />
                      <button
                        type="button"
                        onClick={() => setDistanceKm((d) => +(d + 0.5).toFixed(1))}
                        className="w-9 h-9 rounded-xl bg-[#141e2e] border border-[#223146] text-[#00f59b] font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {[3, 5, 10, 15, 21, 42].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setDistanceKm(km)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${
                            distanceKm === km
                              ? 'bg-[#00f59b] text-black'
                              : 'bg-[#121926] text-gray-400 hover:text-white'
                          }`}
                        >
                          {km}km
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Milestone or Record achieved */}
            <div className="pt-2 border-t border-[#162132]">
              <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Marca o Logro Deportivo Conseguido (Opcional)</span>
              </label>
              <input
                type="text"
                value={milestoneNote}
                onChange={(e) => setMilestoneNote(e.target.value)}
                placeholder="ej: Mejor 5k en 22m, Ganado partido 6-4 6-2, Sin parar en subida..."
                className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f59b]"
              />
            </div>

            {/* RPE & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#162132]">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Intensidad / RPE (1-10)
                </label>
                <div className="flex items-center gap-1">
                  {[6, 7, 8, 9, 10].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRpe(val)}
                      className={`flex-1 py-1 text-xs font-black rounded-lg ${
                        rpe === val
                          ? 'bg-[#00f59b] text-black'
                          : 'bg-[#121926] text-gray-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Calorías Estimadas
                </label>
                <div className="p-2 rounded-xl bg-[#121926] border border-[#1e2a3c] text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>~{estimatedCalories} kcal</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#00f59b] hover:bg-[#00df8c] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#00f59b]/20 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Guardar Progreso en {sportInfo.label.split('/')[0]}</span>
          </button>
        </form>

        {/* ========================================================= */}
        {/* VITRINA DE RÉCORDS EN OTROS DEPORTES */}
        {/* ========================================================= */}
        <div className="mt-6 pt-5 border-t border-[#1b2738]">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[#00f59b]" />
            <span>Tus Récords en Otros Deportes</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#090e17] border border-[#1a2536]">
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Running Máx</span>
              <div className="text-lg font-black text-white">
                {bestRunningDistance > 0 ? `${bestRunningDistance} km` : '0 km'}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {bestRunningDistance > 0 ? `Máx ${maxRunningMinutes}m` : 'Sin registro aún'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#090e17] border border-[#1a2536]">
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Ciclismo Máx</span>
              <div className="text-lg font-black text-white">
                {bestCyclingDistance > 0 ? `${bestCyclingDistance} km` : '0 km'}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {bestCyclingDistance > 0 ? 'Salida más larga' : 'Sin registro aún'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#090e17] border border-[#1a2536]">
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Natación Total</span>
              <div className="text-lg font-black text-white">
                {totalSwimmingMeters > 0 ? `${totalSwimmingMeters} m` : '0 m'}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {totalSwimmingMeters > 0 ? 'Metros acumulados' : 'Sin registro aún'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#090e17] border border-[#1a2536]">
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Calorías Totales</span>
              <div className="text-lg font-black text-orange-400">
                {totalOtherCalories} kcal
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {totalOtherMinutes}m activos
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HISTORIAL DE SESIONES EN OTROS DEPORTES */}
        {/* ========================================================= */}
        <div className="mt-6 pt-5 border-t border-[#1b2738]">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Historial Deportivo Registrado ({otherSportsActivities.length})</span>
          </h3>

          {otherSportsActivities.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#090e17] border border-[#192435] text-center">
              <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-300">
                Aún no has registrado sesiones en otros deportes
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Tu casillero multideporte está listo y vacío para que guardes tu primer progreso arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {otherSportsActivities.map((act) => {
                const s = SPORTS[act.sport] || SPORTS.running;
                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-[#090e17] border border-[#192435] flex items-center justify-between gap-3 hover:border-[#24344a] transition"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white">
                            {act.title}
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${s.color}20`, color: s.color }}
                          >
                            {s.label.split('/')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                          <span>{act.date}</span>
                          <span>•</span>
                          <span>{act.durationMinutes} min</span>
                          {act.distanceKm && (
                            <>
                              <span>•</span>
                              <span>{act.distanceKm} km</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-orange-400 font-bold">{act.calories} kcal</span>
                        </div>
                        {act.notes && (
                          <p className="text-[10px] text-gray-400 italic mt-1 line-clamp-1">
                            {act.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
