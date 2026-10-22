import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Scale, 
  Camera, 
  Dumbbell, 
  Check, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Plus, 
  Calendar,
  Flame,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PersonalRecords, 
  WeightEntry, 
  BodyMeasurement, 
  ProgressPhoto, 
  ActivityRecord, 
  UserProfile 
} from '../types';
import { playSetCompleteSound, triggerHaptic } from '../utils/soundEffects';

interface SaveProgressViewProps {
  userProfile: UserProfile;
  personalRecords?: PersonalRecords;
  onUpdatePersonalRecords?: (records: PersonalRecords) => void;
  weightEntries?: WeightEntry[];
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  measurements?: BodyMeasurement[];
  onAddMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  onUpdateProfileWeight: (newWeight: number) => void;
  progressPhotos?: ProgressPhoto[];
  onAddProgressPhoto?: (photo: ProgressPhoto) => void;
  onSaveActivity?: (activity: Omit<ActivityRecord, 'id'>) => void;
  onResetAllData?: () => void;
}

export const SaveProgressView: React.FC<SaveProgressViewProps> = ({
  userProfile,
  personalRecords = {
    benchPressKg: 0,
    squatKg: 0,
    deadliftKg: 0,
    militaryPressKg: 0,
    pullUpsKg: 0,
    dipsKg: 0,
    legPressKg: 0,
    updatedAt: new Date().toISOString().split('T')[0],
  },
  onUpdatePersonalRecords,
  weightEntries = [],
  onAddWeightEntry,
  measurements = [],
  onAddMeasurement,
  onUpdateProfileWeight,
  progressPhotos = [],
  onAddProgressPhoto,
  onSaveActivity,
  onResetAllData,
}) => {
  const [activeMode, setActiveMode] = useState<'pr' | 'body' | 'quick_gym' | 'photo'>('pr');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Mode 1: PRs form
  const [selectedPrKey, setSelectedPrKey] = useState<keyof PersonalRecords>('benchPressKg');
  const [prWeight, setPrWeight] = useState<number>(() => {
    return (personalRecords[selectedPrKey] as number) || 60;
  });
  const [prReps, setPrReps] = useState<number>(1);
  const [customPrName, setCustomPrName] = useState<string>('');

  // Mode 2: Weight & Measurements
  const latestWeight = weightEntries[weightEntries.length - 1]?.weightKg || userProfile.weightKg;
  const [inputWeight, setInputWeight] = useState<number>(latestWeight);
  const [inputBodyFat, setInputBodyFat] = useState<number>(14.5);
  const [inputMuscleMass, setInputMuscleMass] = useState<number>(60.0);
  const [measChest, setMeasChest] = useState<number>(100);
  const [measWaist, setMeasWaist] = useState<number>(80);
  const [measBiceps, setMeasBiceps] = useState<number>(36);
  const [measThigh, setMeasThigh] = useState<number>(56);
  const [weightNotes, setWeightNotes] = useState<string>('');

  // Mode 3: Quick Gym Workout Session
  const [quickGymTitle, setQuickGymTitle] = useState('Entrenamiento de Pesas');
  const [quickGymDuration, setQuickGymDuration] = useState(50);
  const [quickGymMuscleGroup, setQuickGymMuscleGroup] = useState('Torso / Hipertrofia');
  const [quickGymVolume, setQuickGymVolume] = useState(6500);

  // Mode 4: Progress Photo
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoTag, setPhotoTag] = useState<'frente' | 'perfil' | 'espalda'>('frente');
  const [photoNotes, setPhotoNotes] = useState('');

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    triggerHaptic('success');
    playSetCompleteSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1RM Calculation using Epley formula: 1RM = Weight * (1 + Reps / 30)
  const estimated1RM = prReps === 1 ? prWeight : Math.round(prWeight * (1 + prReps / 30));

  const prExercises: Array<{ key: keyof PersonalRecords; label: string; defaultTarget: number }> = [
    { key: 'benchPressKg', label: 'Press de Banca Plano', defaultTarget: 100 },
    { key: 'squatKg', label: 'Sentadilla Trasera con Barra', defaultTarget: 140 },
    { key: 'deadliftKg', label: 'Peso Muerto Convencional / Sumo', defaultTarget: 180 },
    { key: 'militaryPressKg', label: 'Press Militar de Hombro', defaultTarget: 70 },
    { key: 'legPressKg', label: 'Prensa Inclinada de Piernas', defaultTarget: 300 },
    { key: 'pullUpsKg', label: 'Dominadas con Lastre', defaultTarget: 35 },
    { key: 'dipsKg', label: 'Fondos en Paralelas con Lastre', defaultTarget: 45 },
  ];

  const handleSavePr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePersonalRecords) return;

    const finalWeight = estimated1RM;
    const updated: PersonalRecords = {
      ...personalRecords,
      [selectedPrKey]: finalWeight,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdatePersonalRecords(updated);
    localStorage.setItem('pulse_prs_manually_set', 'true');
    showNotification(`¡Marca guardada! ${finalWeight} kg en ${prExercises.find(p => p.key === selectedPrKey)?.label || 'Ejercicio'}`);
  };

  const handleResetPrs = () => {
    if (!onUpdatePersonalRecords) return;
    const clean: PersonalRecords = {
      benchPressKg: 0,
      squatKg: 0,
      deadliftKg: 0,
      militaryPressKg: 0,
      pullUpsKg: 0,
      dipsKg: 0,
      legPressKg: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdatePersonalRecords(clean);
    localStorage.removeItem('symmetry_prs');
    localStorage.removeItem('pulse_prs_manually_set');
    showNotification('Marcas restablecidas a 0 kg');
  };

  const handleSaveWeightAndBody = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toISOString().split('T')[0];

    // Save weight entry
    onAddWeightEntry({
      date: dateStr,
      weightKg: inputWeight,
      bodyFatPct: inputBodyFat > 0 ? inputBodyFat : undefined,
      muscleMassKg: inputMuscleMass > 0 ? inputMuscleMass : undefined,
      notes: weightNotes || 'Registro de progreso rápido',
    });
    onUpdateProfileWeight(inputWeight);

    // Save measurement if provided
    if (measChest > 0 || measWaist > 0 || measBiceps > 0) {
      onAddMeasurement({
        date: dateStr,
        chestCm: measChest,
        waistCm: measWaist,
        bicepsLeftCm: measBiceps,
        bicepsRightCm: measBiceps,
        thighLeftCm: measThigh,
        thighRightCm: measThigh,
      });
    }

    showNotification(`¡Peso corporal de ${inputWeight} kg y medidas guardadas!`);
  };

  const handleSaveQuickGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveActivity) return;

    const calories = Math.round(6.0 * 3.5 * userProfile.weightKg / 200 * quickGymDuration);
    onSaveActivity({
      date: new Date().toISOString().split('T')[0],
      sport: 'gym',
      title: quickGymTitle || 'Sesión de Gimnasio',
      durationMinutes: quickGymDuration,
      calories,
      totalVolumeKg: quickGymVolume,
      muscleGroupsTrained: [quickGymMuscleGroup],
      rpe: 8,
      notes: 'Registrado desde Guardar Progreso Rápido.',
    });

    showNotification(`¡Sesión de gimnasio guardada! +${calories} kcal registradas`);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddProgressPhoto || !photoUrl.trim()) return;

    onAddProgressPhoto({
      id: `photo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      url: photoUrl.trim(),
      angle: photoTag === 'frente' ? 'front' : photoTag === 'perfil' ? 'side' : 'back',
      weightKg: inputWeight,
      notes: photoNotes || undefined,
    });

    setPhotoUrl('');
    setPhotoNotes('');
    showNotification('¡Foto de progreso añadida a tu galería!');
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#b6f047]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b6f047]">
                Registro Simplificado
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              Guardar Progreso
            </h2>
            <p className="text-xs text-gray-400">
              La forma más rápida y directa de registrar tus marcas, peso corporal, medidas y fotos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetPrs}
            className="self-start sm:self-center text-[11px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-xl bg-[#141d2a] border border-[#233246] transition flex items-center gap-1.5 active:scale-95"
            title="Poner marcas personales a cero"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            <span>Poner marcas a 0</span>
          </button>
        </div>

        {/* 4 Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {[
            { id: 'pr', label: 'Marca / 1RM', icon: Trophy, desc: 'Fuerza máxima' },
            { id: 'body', label: 'Peso & Medidas', icon: Scale, desc: 'Báscula y cinta' },
            { id: 'quick_gym', label: 'Sesión Gym', icon: Dumbbell, desc: 'Entrenamiento rápido' },
            { id: 'photo', label: 'Foto Progreso', icon: Camera, desc: 'Evolución visual' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as any)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#152132] border-[#b6f047] text-white shadow-lg shadow-[#b6f047]/10'
                    : 'bg-[#101724] border-[#1d293d] text-gray-400 hover:text-white hover:border-[#2b3c56]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#b6f047]' : 'text-gray-400'}`} />
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#b6f047]" />}
                </div>
                <div>
                  <span className="block text-xs font-black text-white">{tab.label}</span>
                  <span className="text-[10px] text-gray-500 font-medium block truncate">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: GUARDAR MARCA / 1RM */}
        {/* ========================================================= */}
        {activeMode === 'pr' && (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSavePr}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#090e17] border border-[#192435] space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  1. Selecciona el Ejercicio
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {prExercises.map((ex) => {
                    const isSelected = selectedPrKey === ex.key;
                    const curVal = (personalRecords[ex.key] as number) || 0;
                    return (
                      <button
                        key={ex.key}
                        type="button"
                        onClick={() => {
                          setSelectedPrKey(ex.key);
                          setPrWeight(curVal > 0 ? curVal : ex.defaultTarget * 0.7);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-[#162335] border-[#b6f047] text-white'
                            : 'bg-[#111722] border-[#1e2a3c] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-black text-white truncate">{ex.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Actual: <span className={curVal > 0 ? 'text-[#b6f047] font-bold' : 'text-gray-400'}>{curVal > 0 ? `${curVal} kg` : '0 kg'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weight input with quick increments */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-300">
                    2. Peso Levantado (kg)
                  </label>
                  <span className="text-[11px] text-gray-400 font-bold">
                    1RM Estimado: <span className="text-[#b6f047] font-black text-sm">{estimated1RM} kg</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrWeight((w) => Math.max(0, +(w - 2.5).toFixed(1)))}
                    className="w-10 h-10 rounded-xl bg-[#141e2e] border border-[#223146] text-white font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="500"
                    value={prWeight === 0 ? '' : prWeight}
                    onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-[#101724] border border-[#202e42] rounded-xl px-4 py-2.5 text-center text-xl font-black text-white focus:outline-none focus:border-[#b6f047]"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setPrWeight((w) => +(w + 2.5).toFixed(1))}
                    className="w-10 h-10 rounded-xl bg-[#141e2e] border border-[#223146] text-[#b6f047] font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[1, 2.5, 5, 10].map((add) => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => setPrWeight((w) => +(w + add).toFixed(1))}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#141e2e] hover:bg-[#1c2a3e] border border-[#202f43] text-gray-300 hover:text-white text-[11px] font-bold transition active:scale-95"
                    >
                      +{add}kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Reps for 1RM calculator */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  3. Repeticiones conseguidas
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[1, 2, 3, 5, 8, 10, 12].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPrReps(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                        prReps === r
                          ? 'bg-[#b6f047] text-black shadow-sm'
                          : 'bg-[#121927] border border-[#1e2a3c] text-gray-400 hover:text-white'
                      }`}
                    >
                      {r} {r === 1 ? 'rep (1RM)' : 'reps'}
                    </button>
                  ))}
                </div>
                {prReps > 1 && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Calculando 1RM teórico según la fórmula de Epley: ({prWeight}kg × {prReps} reps = <span className="text-[#b6f047] font-bold">{estimated1RM} kg</span>)
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#b6f047] hover:bg-[#a6e036] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#b6f047]/20 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Trophy className="w-4 h-4 fill-black" />
              <span>Guardar Nueva Marca ({estimated1RM} kg)</span>
            </button>
          </motion.form>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GUARDAR PESO & MEDIDAS */}
        {/* ========================================================= */}
        {activeMode === 'body' && (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveWeightAndBody}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#090e17] border border-[#192435] space-y-4">
              {/* Weight Input */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Peso Corporal Actual (kg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputWeight((w) => Math.max(30, +(w - 0.5).toFixed(1)))}
                    className="w-10 h-10 rounded-xl bg-[#141e2e] border border-[#223146] text-white font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="250"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(parseFloat(e.target.value) || 70)}
                    className="flex-1 bg-[#101724] border border-[#202e42] rounded-xl px-4 py-2.5 text-center text-xl font-black text-white focus:outline-none focus:border-[#b6f047]"
                  />
                  <button
                    type="button"
                    onClick={() => setInputWeight((w) => +(w + 0.5).toFixed(1))}
                    className="w-10 h-10 rounded-xl bg-[#141e2e] border border-[#223146] text-[#b6f047] font-black hover:bg-[#1b283d] transition active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Composition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    % Grasa Corporal (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputBodyFat}
                    onChange={(e) => setInputBodyFat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    placeholder="ej: 14.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Masa Muscular (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputMuscleMass}
                    onChange={(e) => setInputMuscleMass(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    placeholder="ej: 62.0"
                  />
                </div>
              </div>

              {/* Tape Measurements */}
              <div className="pt-2 border-t border-[#172233]">
                <label className="block text-xs font-bold text-gray-300 mb-2">
                  Medidas de Contorno (cm)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold mb-0.5">Cintura</span>
                    <input
                      type="number"
                      step="0.5"
                      value={measWaist}
                      onChange={(e) => setMeasWaist(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold mb-0.5">Pecho</span>
                    <input
                      type="number"
                      step="0.5"
                      value={measChest}
                      onChange={(e) => setMeasChest(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold mb-0.5">Bíceps</span>
                    <input
                      type="number"
                      step="0.5"
                      value={measBiceps}
                      onChange={(e) => setMeasBiceps(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold mb-0.5">Muslo</span>
                    <input
                      type="number"
                      step="0.5"
                      value={measThigh}
                      onChange={(e) => setMeasThigh(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Notas de Báscula
                </label>
                <input
                  type="text"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  placeholder="ej: En ayunas, post entrenamiento..."
                  className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#b6f047] hover:bg-[#a6e036] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#b6f047]/20 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Save className="w-4 h-4 fill-black" />
              <span>Guardar Peso y Medidas</span>
            </button>
          </motion.form>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SESIÓN RÁPIDA DE GIMNASIO */}
        {/* ========================================================= */}
        {activeMode === 'quick_gym' && (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveQuickGym}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#090e17] border border-[#192435] space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Nombre de la Sesión
                </label>
                <input
                  type="text"
                  value={quickGymTitle}
                  onChange={(e) => setQuickGymTitle(e.target.value)}
                  className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                  placeholder="ej: Push Day, Espalda y Bíceps..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Duración (minutos)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[30, 45, 60, 75].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setQuickGymDuration(mins)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${
                          quickGymDuration === mins
                            ? 'bg-[#b6f047] text-black'
                            : 'bg-[#121926] text-gray-400 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Volumen Total Estimado (kg)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={quickGymVolume}
                    onChange={(e) => setQuickGymVolume(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Enfoque Muscular Principal
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Pecho', 'Espalda', 'Piernas', 'Hombros y Brazos', 'Fullbody'].map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setQuickGymMuscleGroup(group)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        quickGymMuscleGroup === group
                          ? 'bg-[#b6f047] text-black'
                          : 'bg-[#121926] text-gray-400 hover:text-white'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#b6f047] hover:bg-[#a6e036] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#b6f047]/20 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Dumbbell className="w-4 h-4 fill-black" />
              <span>Guardar Sesión de Gimnasio</span>
            </button>
          </motion.form>
        )}

        {/* ========================================================= */}
        {/* TAB 4: FOTO DE PROGRESO */}
        {/* ========================================================= */}
        {activeMode === 'photo' && (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSavePhoto}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#090e17] border border-[#192435] space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Enlace o URL de la Foto
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mifoto.jpg o sube tu foto"
                  className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Ángulo / Pose
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'frente', label: 'Frente' },
                    { id: 'perfil', label: 'Perfil' },
                    { id: 'espalda', label: 'Espalda' },
                  ].map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setPhotoTag(tag.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                        photoTag === tag.id
                          ? 'bg-[#b6f047] text-black font-black'
                          : 'bg-[#121926] text-gray-400 hover:text-white'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Notas de la foto (opcional)
                </label>
                <input
                  type="text"
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  placeholder="ej: Semana 6 de definición..."
                  className="w-full bg-[#101724] border border-[#202e42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>

              {photoUrl && (
                <div className="p-2 bg-[#121927] rounded-xl flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt="Vista previa"
                    className="w-14 h-14 rounded-lg object-cover border border-[#233246]"
                    crossOrigin="anonymous"
                  />
                  <div className="text-xs text-gray-300">
                    <span className="font-bold text-white block">Vista Previa</span>
                    <span className="text-[10px] text-gray-400">Pose: {photoTag}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#b6f047] hover:bg-[#a6e036] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#b6f047]/20 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Camera className="w-4 h-4 fill-black" />
              <span>Añadir Foto a Mi Evolución</span>
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
};
