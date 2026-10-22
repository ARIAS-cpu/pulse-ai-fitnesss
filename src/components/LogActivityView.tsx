import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Flame, 
  Heart, 
  MapPin, 
  Clock, 
  Save, 
  Sparkles,
  Zap,
  Activity as PulseIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActivityRecord, SportKey, UserProfile } from '../types';
import { SPORTS, calculateCalories, formatDuration } from '../data/initialData';

interface LogActivityViewProps {
  userProfile: UserProfile;
  initialSport?: SportKey;
  onSaveActivity: (activity: Omit<ActivityRecord, 'id'>) => void;
  onFinished: () => void;
}

export const LogActivityView: React.FC<LogActivityViewProps> = ({
  userProfile,
  initialSport = 'running',
  onSaveActivity,
  onFinished,
}) => {
  const [mode, setMode] = useState<'live' | 'manual'>('live');
  const [selectedSport, setSelectedSport] = useState<SportKey>(initialSport);

  // Live tracker state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveDistanceKm, setLiveDistanceKm] = useState(0);
  const [currentHeartRate, setCurrentHeartRate] = useState(136);
  const timerRef = useRef<number | null>(null);

  // Manual log state
  const [manualDuration, setManualDuration] = useState(40);
  const [manualDistance, setManualDistance] = useState(5.0);
  const [manualCalories, setManualCalories] = useState(
    calculateCalories(initialSport, 40, userProfile.weightKg)
  );
  const [manualHeartRate, setManualHeartRate] = useState(145);
  const [manualTitle, setManualTitle] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualRpe, setManualRpe] = useState(7);

  const sportInfo = SPORTS[selectedSport] || SPORTS.running;

  // Auto-update manual calories when duration, sport or weight changes
  useEffect(() => {
    setManualCalories(calculateCalories(selectedSport, manualDuration, userProfile.weightKg));
  }, [selectedSport, manualDuration, userProfile.weightKg]);

  // Live Timer Interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const nextSec = prev + 1;
          // Simulate slight heart rate variation
          if (nextSec % 4 === 0) {
            setCurrentHeartRate((hr) => {
              const delta = (Math.random() - 0.48) * 4;
              return Math.min(185, Math.max(115, Math.round(hr + delta)));
            });
          }
          // Simulate distance for distance sports (e.g. 10-12 km/h for running)
          if (sportInfo.tracksDistance && nextSec % 3 === 0) {
            const speedKmH = selectedSport === 'cycling' ? 24 : selectedSport === 'running' ? 10.5 : 5.0;
            setLiveDistanceKm((d) => +(d + (speedKmH / 3600) * 3).toFixed(2));
          }
          return nextSec;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sportInfo.tracksDistance, selectedSport]);

  const liveCalories = calculateCalories(
    selectedSport,
    Math.max(1, Math.round(elapsedSeconds / 60)),
    userProfile.weightKg
  );

  // Sound/Haptic feedback helper
  const triggerBeep = () => {
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
      if (navigator.vibrate) {
        navigator.vibrate(80);
      }
    } catch {
      // Audio or vibration unavailable
    }
  };

  const handleToggleLive = () => {
    triggerBeep();
    setIsRunning(!isRunning);
  };

  const handleResetLive = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setLiveDistanceKm(0);
  };

  const handleFinishLive = () => {
    triggerBeep();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    onSaveActivity({
      sport: selectedSport,
      title: `Sesión de ${sportInfo.label}`,
      durationMinutes: durationMins,
      distanceKm: sportInfo.tracksDistance ? liveDistanceKm : undefined,
      calories: liveCalories,
      heartRateAvg: currentHeartRate,
      date: new Date().toISOString(),
      notes: `Entrenamiento completado en vivo con cronómetro.`,
      rpe: 8,
    });

    handleResetLive();
    onFinished();
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    triggerBeep();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    onSaveActivity({
      sport: selectedSport,
      title: manualTitle.trim() || `Entrenamiento de ${sportInfo.label}`,
      durationMinutes: manualDuration,
      distanceKm: sportInfo.tracksDistance ? manualDistance : undefined,
      calories: manualCalories,
      heartRateAvg: manualHeartRate,
      date: new Date().toISOString(),
      notes: manualNotes.trim() || undefined,
      rpe: manualRpe,
    });

    onFinished();
  };

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 pt-2">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">Registrar Entrenamiento</h1>
          <p className="text-xs text-gray-400">Elige cronómetro en tiempo real o registro manual</p>
        </div>

        <div className="flex bg-[#141c28] p-1 rounded-xl border border-[#222e40]">
          <button
            onClick={() => setMode('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'live' ? 'bg-[#b6f047] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            En Vivo
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'manual' ? 'bg-[#b6f047] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Sport Selector Carousel */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Deporte o Disciplina
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
          {(Object.keys(SPORTS) as SportKey[]).map((key) => {
            const sp = SPORTS[key];
            const isSelected = selectedSport === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedSport(key)}
                className={`py-2.5 px-1.5 rounded-xl border text-center flex flex-col items-center justify-center transition active:scale-95 ${
                  isSelected
                    ? 'bg-[#182638] border-[#b6f047] text-white ring-1 ring-[#b6f047]/50 shadow-md'
                    : 'bg-[#121824] border-[#1e2736] text-gray-400 hover:text-gray-200 hover:border-[#2b394e]'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs"
                  style={{ backgroundColor: `${sp.color}25`, color: sp.color }}
                >
                  <PulseIcon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[10px] truncate max-w-full font-medium ${isSelected ? 'text-[#b6f047] font-bold' : ''}`}>
                  {sp.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LIVE MODE INTERFACE */}
      {mode === 'live' && (
        <div className="space-y-6">
          {/* Main Stopwatch Circle / Display */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#131b27] to-[#0d121a] border border-[#26354a] text-center relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182333] border border-[#2b3b52] text-xs font-semibold text-[#b6f047] mb-3">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#b6f047] animate-ping' : 'bg-gray-500'}`} />
              <span>{isRunning ? 'Grabando sesión...' : elapsedSeconds > 0 ? 'Pausado' : 'Listo para iniciar'}</span>
            </div>

            {/* Time Display */}
            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-white tracking-tight my-2">
              {formatDuration(elapsedSeconds)}
            </div>

            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              {sportInfo.label} • MET {sportInfo.met}
            </p>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-[#1e2a3c]">
              <div className="p-2.5 rounded-xl bg-[#0b0e14]/60 border border-[#1b2536]">
                <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold mb-0.5">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>KCAL</span>
                </div>
                <div className="font-mono text-lg font-bold text-white">{liveCalories}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0b0e14]/60 border border-[#1b2536]">
                <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold mb-0.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  <span>PPM</span>
                </div>
                <div className="font-mono text-lg font-bold text-white">
                  {isRunning ? currentHeartRate : '--'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0b0e14]/60 border border-[#1b2536]">
                <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold mb-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>KM</span>
                </div>
                <div className="font-mono text-lg font-bold text-white">
                  {sportInfo.tracksDistance ? liveDistanceKm : 'N/A'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {elapsedSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleResetLive}
                  className="w-12 h-12 rounded-full bg-[#182333] hover:bg-[#223247] text-gray-300 flex items-center justify-center transition"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleLive}
                className={`px-8 py-4 rounded-full font-display font-bold text-base flex items-center gap-2 shadow-lg transition active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-[#b6f047] hover:brightness-110 text-black'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-black" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-black" />
                    <span>{elapsedSeconds > 0 ? 'Reanudar' : 'Iniciar'}</span>
                  </>
                )}
              </button>

              {elapsedSeconds > 10 && (
                <button
                  type="button"
                  onClick={handleFinishLive}
                  className="px-5 py-4 rounded-full bg-[#1c2738] hover:bg-[#26374f] text-[#b6f047] border border-[#b6f047]/40 font-bold text-sm flex items-center gap-1.5 transition active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL FORM INTERFACE */}
      {mode === 'manual' && (
        <form onSubmit={handleSaveManual} className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#121824] border border-[#1f2a3a] space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Título de la actividad</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder={`Ej: Sesión intensa de ${sportInfo.label}`}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6f047]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Duración (minutos)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#b6f047]"
                    required
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400">min</span>
                </div>
              </div>

              {sportInfo.tracksDistance ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Distancia (km)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualDistance}
                      onChange={(e) => setManualDistance(Number(e.target.value))}
                      className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#b6f047]"
                    />
                    <span className="absolute right-3 top-3 text-xs text-gray-400">km</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Pulsaciones medias</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="60"
                      max="220"
                      value={manualHeartRate}
                      onChange={(e) => setManualHeartRate(Number(e.target.value))}
                      className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#b6f047]"
                    />
                    <span className="absolute right-3 top-3 text-xs text-gray-400">ppm</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Calorías quemadas (est. MET)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(Number(e.target.value))}
                    className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl pl-3.5 pr-12 py-2.5 text-sm font-mono text-[#b6f047] font-bold focus:outline-none focus:border-[#b6f047]"
                    required
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400">kcal</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Esfuerzo percibido (RPE {manualRpe}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={manualRpe}
                  onChange={(e) => setManualRpe(Number(e.target.value))}
                  className="w-full accent-[#b6f047] mt-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Notas o sensaciones</label>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="¿Cómo te has sentido? Pesos, clima o ritmo..."
                rows={2}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6f047]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#b6f047] hover:brightness-110 active:scale-95 transition text-black font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Entrenamiento</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
