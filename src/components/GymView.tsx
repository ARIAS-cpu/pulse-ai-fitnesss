import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Play, 
  Plus, 
  Check, 
  Clock, 
  Timer, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  ListFilter,
  CheckCircle2,
  Calculator,
  Search,
  Activity,
  Heart,
  MapPin,
  Pause,
  Save,
  Trophy,
  ArrowRight,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  Filter,
  Info,
  Edit2,
  BookOpen,
  Zap,
  Repeat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  GymExercise, 
  GymRoutine, 
  GymSet, 
  ActivityRecord, 
  UserProfile, 
  SportKey,
  RoutineExercise
} from '../types';
import { 
  SPORTS, 
  calculateCalories, 
  formatDuration 
} from '../data/initialData';
import { 
  COMPREHENSIVE_EXERCISES, 
  MUSCLE_GROUPS_LIST, 
  EQUIPMENT_FILTER_LIST, 
  COMMON_EXERCISE_TAGS, 
  matchExerciseTag 
} from '../data/exercisesData';
import { GymToolsModal } from './GymToolsModal';
import { AIRoutineGeneratorModal } from './AIRoutineGeneratorModal';
import { Language, TRANSLATIONS } from '../utils/translations';
import { playSetCompleteSound, playRestTimerEndSound, triggerHaptic } from '../utils/soundEffects';

interface GymViewProps {
  userProfile: UserProfile;
  onSaveGymWorkout: (activity: Omit<ActivityRecord, 'id'>) => void;
  currentLanguage: Language;
  initialRoutineToStart?: GymRoutine | null;
  routinesList?: GymRoutine[];
  onUpdateRoutines?: (routines: GymRoutine[]) => void;
}

export const GymView: React.FC<GymViewProps> = ({ 
  userProfile, 
  onSaveGymWorkout,
  currentLanguage,
  initialRoutineToStart,
  routinesList = [],
  onUpdateRoutines
}) => {
  const t = TRANSLATIONS[currentLanguage];

  // Primary navigation tabs
  const [activeTab, setActiveTab] = useState<'workout' | 'my_routines' | 'library' | 'templates' | 'sports'>('workout');

  // Exercise library state
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('todos');
  const [searchExercise, setSearchExercise] = useState<string>('');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<GymExercise | null>(null);

  // Modals
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isAIRoutineModalOpen, setIsAIRoutineModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isSaveRoutineModalOpen, setIsSaveRoutineModalOpen] = useState(false);
  const [saveRoutineName, setSaveRoutineName] = useState('');
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutRpe, setWorkoutRpe] = useState(8);

  // Routine Creation / Editing state
  const [isCreateRoutineModalOpen, setIsCreateRoutineModalOpen] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [newRoutineMuscle, setNewRoutineMuscle] = useState('Personalizada');
  const [newRoutineExercises, setNewRoutineExercises] = useState<RoutineExercise[]>([]);
  const [routineBuilderSearch, setRoutineBuilderSearch] = useState<string>('');
  const [routineBuilderTag, setRoutineBuilderTag] = useState<string>('all');

  // Exercise library tag filtering state
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Active workout state
  const [workoutName, setWorkoutName] = useState('Mi Entrenamiento');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);
  const [workoutDurationSec, setWorkoutDurationSec] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<{
    exercise: GymExercise;
    sets: GymSet[];
  }[]>([]);

  // Rest Timer state
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [restInitialSeconds, setRestInitialSeconds] = useState(90);
  const [isResting, setIsResting] = useState(false);
  const restIntervalRef = useRef<number | null>(null);
  const workoutIntervalRef = useRef<number | null>(null);

  // More Sports state
  const [selectedSport, setSelectedSport] = useState<SportKey>('running');
  const [isSportTrackingActive, setIsSportTrackingActive] = useState(false);
  const [sportDurationSec, setSportDurationSec] = useState(0);
  const [sportDistanceKm, setSportDistanceKm] = useState(0);
  const [sportHeartRate, setSportHeartRate] = useState(138);
  const sportTimerRef = useRef<number | null>(null);

  // Auto-start routine if passed from Home
  useEffect(() => {
    if (initialRoutineToStart) {
      startRoutine(initialRoutineToStart);
    }
  }, [initialRoutineToStart]);

  // Handle active workout timer
  useEffect(() => {
    if (isWorkoutActive && !isWorkoutPaused) {
      workoutIntervalRef.current = window.setInterval(() => {
        setWorkoutDurationSec((prev) => prev + 1);
      }, 1000);
    } else if (workoutIntervalRef.current) {
      clearInterval(workoutIntervalRef.current);
    }
    return () => {
      if (workoutIntervalRef.current) clearInterval(workoutIntervalRef.current);
    };
  }, [isWorkoutActive, isWorkoutPaused]);

  // Handle rest timer countdown
  useEffect(() => {
    if (isResting && restTimerSeconds > 0) {
      restIntervalRef.current = window.setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            playRestTimerEndSound();
            triggerHaptic('success');
            if (restIntervalRef.current) clearInterval(restIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restTimerSeconds]);

  // Sports Live Tracker Timer
  useEffect(() => {
    if (isSportTrackingActive) {
      sportTimerRef.current = window.setInterval(() => {
        setSportDurationSec((prev) => {
          const next = prev + 1;
          if (SPORTS[selectedSport]?.tracksDistance && next % 5 === 0) {
            setSportDistanceKm((d) => +(d + 0.015).toFixed(3));
          }
          return next;
        });
      }, 1000);
    } else if (sportTimerRef.current) {
      clearInterval(sportTimerRef.current);
    }
    return () => {
      if (sportTimerRef.current) clearInterval(sportTimerRef.current);
    };
  }, [isSportTrackingActive, selectedSport]);

  // Calculate live volume & completed sets
  const totalVolumeKg = exerciseLogs.reduce((acc, log) => {
    return acc + log.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weightKg * s.reps) : sAcc, 0);
  }, 0);

  const totalSetsCompleted = exerciseLogs.reduce((acc, log) => {
    return acc + log.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);

  // START A FREESTYLE WORKOUT (BLANK CANVAS)
  const handleStartFreestyleWorkout = () => {
    setWorkoutName('Mi Sesión Libre');
    setExerciseLogs([]);
    setWorkoutDurationSec(0);
    setIsWorkoutActive(true);
    setIsWorkoutPaused(false);
    setActiveTab('workout');
    // Open exercise library immediately so athlete can add their first exercise easily!
    setIsAddExerciseModalOpen(true);
  };

  // START WORKOUT FROM ROUTINE
  const startRoutine = (routine: GymRoutine) => {
    setWorkoutName(routine.title);
    const initialLogs = routine.exercises.map((rEx) => {
      const exercise: GymExercise = COMPREHENSIVE_EXERCISES.find((e) => e.id === rEx.exerciseId) || {
        id: rEx.exerciseId,
        name: 'Ejercicio',
        muscleGroup: 'pecho',
        equipment: 'barra',
        difficulty: 'intermedio',
        instructions: 'Ejecuta con técnica biomecánica controlada.',
      };
      const count = rEx.sets || rEx.defaultSets || 3;
      const weight = rEx.suggestedWeightKg || rEx.defaultWeightKg || 40;
      const reps = rEx.targetReps || rEx.defaultReps || 10;
      const sets: GymSet[] = Array.from({ length: count }, (_, i) => ({
        id: `set-${Date.now()}-${i}-${Math.random()}`,
        setNumber: i + 1,
        weightKg: weight,
        reps: reps,
        completed: false,
        type: 'normal',
      }));
      return { exercise, sets };
    });

    setExerciseLogs(initialLogs);
    setWorkoutDurationSec(0);
    setIsWorkoutActive(true);
    setIsWorkoutPaused(false);
    setActiveTab('workout');
  };

  // ADD AN EXERCISE TO CURRENT WORKOUT
  const handleAddExerciseToWorkout = (exercise: GymExercise) => {
    const defaultWeight = exercise.equipment === 'peso_corporal' ? 0 : 30;
    const initialSets: GymSet[] = [
      { id: `set-${Date.now()}-1`, setNumber: 1, weightKg: defaultWeight, reps: 10, completed: false, type: 'normal' },
      { id: `set-${Date.now()}-2`, setNumber: 2, weightKg: defaultWeight, reps: 10, completed: false, type: 'normal' },
      { id: `set-${Date.now()}-3`, setNumber: 3, weightKg: defaultWeight, reps: 10, completed: false, type: 'normal' },
    ];

    setExerciseLogs((prev) => [...prev, { exercise, sets: initialSets }]);
    setIsAddExerciseModalOpen(false);
    triggerHaptic('medium');
  };

  // REMOVE EXERCISE FROM WORKOUT
  const handleRemoveExercise = (index: number) => {
    setExerciseLogs((prev) => prev.filter((_, i) => i !== index));
  };

  // TOGGLE SET COMPLETED
  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetSet = next[exerciseIndex].sets[setIndex];
      targetSet.completed = !targetSet.completed;

      if (targetSet.completed) {
        playSetCompleteSound();
        triggerHaptic('success');
        setRestTimerSeconds(restInitialSeconds);
        setIsResting(true);
      }
      return next;
    });
  };

  // UPDATE SET WEIGHT OR REPS
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    value: number
  ) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const target = next[exerciseIndex].sets[setIndex];
      target[field] = Math.max(0, value);
      return next;
    });
  };

  // QUICK INCREMENT/DECREMENT SET VALUE
  const handleIncrementSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    delta: number
  ) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const currentVal = next[exerciseIndex].sets[setIndex][field];
      next[exerciseIndex].sets[setIndex][field] = Math.max(0, +(currentVal + delta).toFixed(2));
      return next;
    });
    triggerHaptic('light');
  };

  // CYCLE SET TYPE
  const handleCycleSetType = (exerciseIndex: number, setIndex: number) => {
    const types: Array<GymSet['type']> = ['normal', 'warmup', 'dropset', 'failure'];
    setExerciseLogs((prev) => {
      const next = [...prev];
      const current = next[exerciseIndex].sets[setIndex].type || 'normal';
      const nextIdx = (types.indexOf(current) + 1) % types.length;
      next[exerciseIndex].sets[setIndex].type = types[nextIdx];
      return next;
    });
    triggerHaptic('light');
  };

  // ADD SET TO EXERCISE
  const handleAddSet = (exerciseIndex: number) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const currentSets = next[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      currentSets.push({
        id: `set-${Date.now()}-${currentSets.length}`,
        setNumber: currentSets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 30,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
        type: 'normal',
      });
      return next;
    });
    triggerHaptic('light');
  };

  // DUPLICATE SPECIFIC SET
  const handleDuplicateSet = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const currentSets = next[exerciseIndex].sets;
      const targetSet = currentSets[setIndex];
      currentSets.push({
        id: `set-${Date.now()}-${Math.random()}`,
        setNumber: currentSets.length + 1,
        weightKg: targetSet.weightKg,
        reps: targetSet.reps,
        completed: false,
        type: targetSet.type,
      });
      return next;
    });
    triggerHaptic('medium');
  };

  // DELETE SET
  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const filtered = next[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      // Renumber
      next[exerciseIndex].sets = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return next;
    });
  };

  // SAVE AS CUSTOM REUSABLE ROUTINE
  const handleSaveAsCustomRoutine = () => {
    if (!saveRoutineName.trim()) return;

    const newRoutine: GymRoutine = {
      id: `custom-rout-${Date.now()}`,
      title: saveRoutineName.trim(),
      description: `Creada por ti con ${exerciseLogs.length} ejercicios personalizados.`,
      muscleGroup: exerciseLogs[0]?.exercise.muscleGroup || 'Personalizada',
      isCustom: true,
      level: userProfile.level || 'Intermedio',
      exercises: exerciseLogs.map((item) => ({
        exerciseId: item.exercise.id,
        defaultSets: item.sets.length,
        defaultReps: item.sets[0]?.reps || 10,
        defaultWeightKg: item.sets[0]?.weightKg || 30,
      })),
    };

    if (onUpdateRoutines) {
      onUpdateRoutines([...routinesList, newRoutine]);
    }
    setIsSaveRoutineModalOpen(false);
    setSaveRoutineName('');
    triggerHaptic('success');
    confetti({ particleCount: 50, spread: 60 });
  };

  // FINISH AND SAVE WORKOUT RECORD
  const handleConfirmFinishWorkout = () => {
    const durationMins = Math.max(1, Math.round(workoutDurationSec / 60));
    const calories = calculateCalories('gym', durationMins, userProfile.weightKg);

    const exerciseSummary = exerciseLogs.map((item) => {
      const completedSets = item.sets.filter((s) => s.completed);
      const maxWeight = completedSets.length > 0 
        ? Math.max(0, ...completedSets.map((s) => s.weightKg || 0))
        : 0;
      const totalReps = completedSets.reduce((sum, s) => sum + (s.reps || 0), 0);
      return {
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        maxWeightKg: maxWeight,
        totalReps,
      };
    });

    const workoutRecord: Omit<ActivityRecord, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      sport: 'gym',
      title: workoutName || 'Sesión de Entrenamiento',
      durationMinutes: durationMins,
      calories,
      rpe: workoutRpe,
      notes: workoutNotes || `Volumen total: ${totalVolumeKg.toLocaleString()} kg · ${totalSetsCompleted} series completadas.`,
      gymSets: exerciseLogs.flatMap(e => e.sets),
      totalVolumeKg,
      muscleGroupsTrained: Array.from(new Set(exerciseLogs.map(e => e.exercise.muscleGroup))),
      exerciseSummary,
    };

    onSaveGymWorkout(workoutRecord);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });

    setIsWorkoutActive(false);
    setIsFinishModalOpen(false);
    setExerciseLogs([]);
    setWorkoutDurationSec(0);
    setActiveTab('my_routines');
  };

  // CANCEL WORKOUT
  const handleCancelWorkout = () => {
    if (window.confirm('¿Seguro que deseas descartar la sesión actual? Los datos no guardados se perderán.')) {
      setIsWorkoutActive(false);
      setExerciseLogs([]);
      setWorkoutDurationSec(0);
      setIsResting(false);
    }
  };

  // ROUTINE BUILDER HANDLERS
  const handleToggleExerciseInRoutine = (exerciseId: string) => {
    setNewRoutineExercises((prev) => {
      const exists = prev.some((e) => e.exerciseId === exerciseId);
      if (exists) {
        return prev.filter((e) => e.exerciseId !== exerciseId);
      } else {
        return [
          ...prev,
          {
            exerciseId,
            defaultSets: 3,
            defaultReps: 10,
            defaultWeightKg: 40,
          },
        ];
      }
    });
    triggerHaptic('light');
  };

  const handleUpdateRoutineExercise = (
    index: number,
    field: 'defaultSets' | 'defaultReps' | 'defaultWeightKg',
    value: number
  ) => {
    setNewRoutineExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Math.max(0, value) };
      return next;
    });
  };

  const handleRemoveRoutineExercise = (index: number) => {
    setNewRoutineExercises((prev) => prev.filter((_, i) => i !== index));
    triggerHaptic('light');
  };

  const handleSaveBuiltRoutine = (startImmediately: boolean = false) => {
    if (!newRoutineTitle.trim()) {
      alert('Por favor introduce un nombre para tu rutina.');
      return;
    }
    if (newRoutineExercises.length === 0) {
      alert('Añade al menos un ejercicio a tu rutina.');
      return;
    }

    const builtRoutine: GymRoutine = {
      id: `custom-rout-${Date.now()}`,
      title: newRoutineTitle.trim(),
      description: newRoutineDesc.trim() || `Rutina personalizada con ${newRoutineExercises.length} ejercicios.`,
      muscleGroup: newRoutineMuscle || 'Personalizada',
      isCustom: true,
      exercises: newRoutineExercises,
    };

    if (onUpdateRoutines) {
      onUpdateRoutines([...routinesList, builtRoutine]);
    }

    setIsCreateRoutineModalOpen(false);
    setNewRoutineTitle('');
    setNewRoutineDesc('');
    setNewRoutineExercises([]);
    confetti({ particleCount: 70, spread: 70 });
    triggerHaptic('success');

    if (startImmediately) {
      startRoutine(builtRoutine);
    }
  };

  // FILTER EXERCISES (WITH TAGS & SEARCH)
  const filteredExercises = COMPREHENSIVE_EXERCISES.filter((ex) => {
    const matchesTag = matchExerciseTag(ex, selectedTag);
    const matchesMuscle = selectedMuscle === 'todos' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'todos' || ex.equipment === selectedEquipment;
    const q = searchExercise.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroup.toLowerCase().includes(q) ||
      (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(q)) ||
      (ex.tags && ex.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesTag && matchesMuscle && matchesEquipment && matchesSearch;
  });

  // FILTER EXERCISES FOR ROUTINE BUILDER MODAL
  const filteredRoutineBuilderExercises = COMPREHENSIVE_EXERCISES.filter((ex) => {
    const matchesTag = matchExerciseTag(ex, routineBuilderTag);
    const q = routineBuilderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroup.toLowerCase().includes(q) ||
      (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(q)) ||
      (ex.tags && ex.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-1">
      {/* Top Header / Pro HUD Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c131f] via-[#090e18] to-[#06080d] border border-[#1b2738] p-5 shadow-2xl"
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#00f59b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00f59b] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00f59b]">
                PULSE.AI WORKOUT ENGINE PRO
              </span>
              <span className="text-gray-500 text-xs">·</span>
              <span className="text-[11px] font-bold text-gray-400">
                +75 Ejercicios Biomecánicos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isWorkoutActive ? workoutName : 'Tu Centro de Entrenamiento'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {isWorkoutActive 
                ? 'Configura pesos, series y repeticiones a tu medida en tiempo real.'
                : 'Crea tus propios entrenamientos con control total o entrena de forma libre.'
              }
            </p>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsToolsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#141e2e] hover:bg-[#1c2a3f] border border-[#24354d] text-xs font-bold text-gray-200 px-3.5 py-2.5 rounded-xl transition active:scale-95 shadow-sm"
            >
              <Calculator className="w-4 h-4 text-[#00f59b]" />
              <span>Calculadora 1RM</span>
            </button>

            {!isWorkoutActive && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartFreestyleWorkout}
                className="flex items-center gap-2 bg-gradient-to-r from-[#00f59b] to-[#a3e635] text-black font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-[#00f59b]/25 transition"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Empezar Entrenamiento Libre</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Live HUD Bar if workout is active */}
        {isWorkoutActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-[#1b2738]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center"
          >
            <div className="bg-[#121a28]/70 border border-[#1e2d42] rounded-2xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#38bdf8]" /> Tiempo
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                {formatDuration(workoutDurationSec)}
              </p>
            </div>

            <div className="bg-[#121a28]/70 border border-[#1e2d42] rounded-2xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                <Dumbbell className="w-3 h-3 text-[#00f59b]" /> Volumen Total
              </p>
              <p className="text-lg font-black text-[#00f59b] font-mono mt-0.5">
                {totalVolumeKg.toLocaleString()} <span className="text-xs text-gray-400">kg</span>
              </p>
            </div>

            <div className="bg-[#121a28]/70 border border-[#1e2d42] rounded-2xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#f59e0b]" /> Series
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                {totalSetsCompleted} / {totalSetsCount}
              </p>
            </div>

            <div className="bg-[#121a28]/70 border border-[#1e2d42] rounded-2xl p-2.5">
              <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#ef4444]" /> Calorías
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                {calculateCalories('gym', Math.max(1, Math.round(workoutDurationSec / 60)), userProfile.weightKg)} <span className="text-xs text-gray-400">kcal</span>
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#0b1019] border border-[#1a2433] rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'workout'
              ? 'bg-[#00f59b] text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isWorkoutActive ? 'Sesión en Vivo' : 'Entrenar'}</span>
          {isWorkoutActive && (
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('my_routines')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'my_routines'
              ? 'bg-[#00f59b] text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Mis Rutinas ({routinesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-[#00f59b] text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Biblioteca (+75)</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-[#00f59b] text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sugerencias IA</span>
        </button>

        <button
          onClick={() => setActiveTab('sports')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'sports'
              ? 'bg-[#00f59b] text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Más Deportes</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WORKOUT (ACTIVE OR READY TO START) */}
      {/* ======================================================== */}
      {activeTab === 'workout' && (
        <div className="space-y-4">
          {!isWorkoutActive ? (
            // Idle State: Options to start freestyle or select a routine
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0e1420] border border-[#1e2a3c] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#00f59b]/20 to-[#38bdf8]/20 border border-[#00f59b]/30 flex items-center justify-center text-[#00f59b] shadow-inner">
                <Dumbbell className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-2xl font-black text-white">
                  Crea tu propio entrenamiento
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Aquí tú tienes el control absoluto: añade los ejercicios que quieras, personaliza tus kilos y series, y regístralo todo con facilidad.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartFreestyleWorkout}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00f59b] hover:bg-[#00df8c] text-black font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-[#00f59b]/20 transition"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>Empezar Sesión Libre</span>
                </motion.button>

                <button
                  onClick={() => setActiveTab('my_routines')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#141e2e] hover:bg-[#1a283e] border border-[#25354e] text-white font-bold text-sm px-5 py-3.5 rounded-2xl transition"
                >
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>Elegir de Mis Rutinas</span>
                </button>
              </div>

              {/* Quick suggestion prompt */}
              <div className="pt-4 border-t border-[#1a2536] text-xs text-gray-500 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00f59b]" />
                <span>¿Prefieres ideas guiadas? Puedes consultar las sugerencias del Coach IA en cualquier momento.</span>
              </div>
            </motion.div>
          ) : (
            // ACTIVE LIVE WORKOUT SESSION
            <div className="space-y-4">
              {/* Workout Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d131e] border border-[#1c2738] rounded-2xl p-3 px-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="bg-transparent text-white font-extrabold text-base focus:outline-none focus:border-b border-[#00f59b] max-w-[200px] sm:max-w-xs"
                    placeholder="Nombre del entrenamiento"
                  />
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWorkoutPaused(!isWorkoutPaused)}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                      isWorkoutPaused
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-[#151f2e] border-[#223348] text-gray-300 hover:text-white'
                    }`}
                  >
                    {isWorkoutPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isWorkoutPaused ? 'Reanudar' : 'Pausar'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSaveRoutineName(workoutName);
                      setIsSaveRoutineModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-[#151f2e] border border-[#223348] text-gray-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                    title="Guardar como rutina para reutilizar"
                  >
                    <Save className="w-4 h-4 text-[#00f59b]" />
                    <span className="hidden sm:inline">Guardar Rutina</span>
                  </button>

                  <button
                    onClick={() => setIsFinishModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#00f59b] hover:bg-[#00df8c] text-black font-extrabold text-xs transition active:scale-95 shadow-md shadow-[#00f59b]/20"
                  >
                    Finalizar
                  </button>

                  <button
                    onClick={handleCancelWorkout}
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                    title="Descartar entrenamiento"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floating or Docked Rest Timer if resting */}
              <AnimatePresence>
                {isResting && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gradient-to-r from-[#101b2b] to-[#0c1524] border border-[#00f59b]/40 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00f59b]/15 border border-[#00f59b]/40 flex items-center justify-center text-[#00f59b]">
                        <Timer className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#00f59b]">
                          Descanso en Progreso
                        </p>
                        <p className="text-xl font-black text-white font-mono">
                          {formatDuration(restTimerSeconds)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        onClick={() => setRestTimerSeconds((s) => s + 15)}
                        className="px-2 py-1 bg-[#1a2638] hover:bg-[#22334b] text-gray-300 text-[11px] font-bold rounded-lg transition"
                      >
                        +15s
                      </button>
                      <button
                        onClick={() => setRestTimerSeconds(60)}
                        className="px-2 py-1 bg-[#1a2638] hover:bg-[#22334b] text-gray-300 text-[11px] font-bold rounded-lg transition"
                      >
                        60s
                      </button>
                      <button
                        onClick={() => setRestTimerSeconds(90)}
                        className="px-2 py-1 bg-[#1a2638] hover:bg-[#22334b] text-gray-300 text-[11px] font-bold rounded-lg transition"
                      >
                        90s
                      </button>
                      <button
                        onClick={() => setRestTimerSeconds(120)}
                        className="px-2 py-1 bg-[#1a2638] hover:bg-[#22334b] text-gray-300 text-[11px] font-bold rounded-lg transition"
                      >
                        120s
                      </button>
                      <button
                        onClick={() => setIsResting(false)}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] font-bold rounded-lg transition"
                      >
                        Saltar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List of Exercises in Active Session */}
              {exerciseLogs.length === 0 ? (
                <div className="bg-[#0d131e] border border-dashed border-[#202d40] rounded-3xl p-8 text-center space-y-3">
                  <p className="text-gray-400 text-sm">
                    Aún no has añadido ningún ejercicio a esta sesión.
                  </p>
                  <button
                    onClick={() => setIsAddExerciseModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#00f59b] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir mi primer ejercicio</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exerciseLogs.map((logItem, exIdx) => (
                    <motion.div
                      key={`ex-card-${exIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0e1420] border border-[#1b2636] rounded-2xl overflow-hidden shadow-lg"
                    >
                      {/* Exercise Header */}
                      <div className="bg-[#121926] p-3.5 px-4 flex items-center justify-between border-b border-[#1b2636]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#00f59b]/20 text-[#00f59b] flex items-center justify-center text-xs font-black">
                            {exIdx + 1}
                          </span>
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              {logItem.exercise.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                              <span className="capitalize text-[#00f59b] font-bold">
                                {logItem.exercise.muscleGroup}
                              </span>
                              <span>·</span>
                              <span className="capitalize">{logItem.exercise.equipment.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedExerciseDetail(logItem.exercise)}
                            className="p-1.5 text-gray-400 hover:text-white transition"
                            title="Ver técnica biomecánica"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition"
                            title="Eliminar ejercicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sets Table */}
                      <div className="p-3 sm:p-4 space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-black text-gray-400 px-2">
                          <div className="col-span-2 sm:col-span-2">Serie</div>
                          <div className="col-span-4 sm:col-span-4 text-center">Kilos (kg)</div>
                          <div className="col-span-3 sm:col-span-3 text-center">Reps</div>
                          <div className="col-span-3 sm:col-span-3 text-right">Completar</div>
                        </div>

                        {/* Sets List */}
                        {logItem.sets.map((set, setIdx) => (
                          <div
                            key={set.id}
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition ${
                              set.completed
                                ? 'bg-[#00f59b]/10 border border-[#00f59b]/30'
                                : 'bg-[#131b28]/60 border border-[#1e2a3b]'
                            }`}
                          >
                            {/* Set Number & Type Toggle */}
                            <div className="col-span-2 sm:col-span-2 flex items-center gap-1.5">
                              <button
                                onClick={() => handleCycleSetType(exIdx, setIdx)}
                                className={`text-[11px] font-black px-1.5 py-0.5 rounded uppercase ${
                                  set.type === 'warmup'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : set.type === 'dropset'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : set.type === 'failure'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'text-gray-300'
                                }`}
                                title="Pulsa para cambiar tipo (Normal, Calentamiento, Dropset, Fallo)"
                              >
                                #{set.setNumber}
                              </button>
                            </div>

                            {/* Weight KG Input + Fast Increment Buttons */}
                            <div className="col-span-4 sm:col-span-4 flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleIncrementSetValue(exIdx, setIdx, 'weightKg', -2.5)}
                                className="w-6 h-6 rounded-lg bg-[#1c2738] hover:bg-[#25354c] text-gray-300 text-xs font-bold hidden sm:flex items-center justify-center active:scale-95"
                              >
                                -
                              </button>

                              <input
                                type="number"
                                step="0.5"
                                value={set.weightKg === 0 ? '' : set.weightKg}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                className="w-14 sm:w-16 bg-[#0a0f17] border border-[#233145] text-white text-center font-bold text-xs sm:text-sm py-1 rounded-lg focus:outline-none focus:border-[#00f59b]"
                                placeholder="0"
                              />

                              <button
                                onClick={() => handleIncrementSetValue(exIdx, setIdx, 'weightKg', 2.5)}
                                className="w-6 h-6 rounded-lg bg-[#1c2738] hover:bg-[#25354c] text-[#00f59b] text-xs font-bold hidden sm:flex items-center justify-center active:scale-95"
                              >
                                +
                              </button>
                            </div>

                            {/* Reps Input + Fast Increment Buttons */}
                            <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleIncrementSetValue(exIdx, setIdx, 'reps', -1)}
                                className="w-6 h-6 rounded-lg bg-[#1c2738] hover:bg-[#25354c] text-gray-300 text-xs font-bold hidden sm:flex items-center justify-center active:scale-95"
                              >
                                -
                              </button>

                              <input
                                type="number"
                                value={set.reps === 0 ? '' : set.reps}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                className="w-12 sm:w-14 bg-[#0a0f17] border border-[#233145] text-white text-center font-bold text-xs sm:text-sm py-1 rounded-lg focus:outline-none focus:border-[#00f59b]"
                                placeholder="0"
                              />

                              <button
                                onClick={() => handleIncrementSetValue(exIdx, setIdx, 'reps', 1)}
                                className="w-6 h-6 rounded-lg bg-[#1c2738] hover:bg-[#25354c] text-[#00f59b] text-xs font-bold hidden sm:flex items-center justify-center active:scale-95"
                              >
                                +
                              </button>
                            </div>

                            {/* Checkmark Button & Quick Duplicate */}
                            <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDuplicateSet(exIdx, setIdx)}
                                className="p-1.5 text-gray-500 hover:text-gray-300 transition"
                                title="Duplicar serie"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteSet(exIdx, setIdx)}
                                className="p-1.5 text-gray-600 hover:text-red-400 transition"
                                title="Eliminar serie"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleSet(exIdx, setIdx)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition ${
                                  set.completed
                                    ? 'bg-[#00f59b] text-black shadow-md shadow-[#00f59b]/30'
                                    : 'bg-[#1c2738] text-gray-400 hover:text-white'
                                }`}
                              >
                                <Check className={`w-4 h-4 stroke-[3] ${set.completed ? 'text-black' : 'text-gray-400'}`} />
                              </motion.button>
                            </div>
                          </div>
                        ))}

                        {/* Add Set Button */}
                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => handleAddSet(exIdx)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#00f59b] hover:text-[#00df8c] bg-[#00f59b]/10 hover:bg-[#00f59b]/20 px-3 py-1.5 rounded-xl transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Serie</span>
                          </button>

                          <div className="text-[11px] text-gray-500 font-mono">
                            Subtotal: {logItem.sets.reduce((a, s) => s.completed ? a + (s.weightKg * s.reps) : a, 0).toLocaleString()} kg
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Another Exercise CTA */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddExerciseModalOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-[#202e42] hover:border-[#00f59b]/60 rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-gray-300 hover:text-[#00f59b] bg-[#0e1522]/50 hover:bg-[#0e1522] transition"
                  >
                    <Plus className="w-5 h-5 text-[#00f59b]" />
                    <span>+ Añadir Más Ejercicios a la Sesión</span>
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MIS RUTINAS (CUSTOM ROUTINES & BUILDER) */}
      {/* ======================================================== */}
      {activeTab === 'my_routines' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1420] border border-[#1d293b] rounded-2xl p-4">
            <div>
              <h2 className="text-lg font-black text-white">
                Tus Rutinas Guardadas
              </h2>
              <p className="text-xs text-gray-400">
                Lanza cualquiera de tus rutinas con un clic o diseña una nueva desde cero.
              </p>
            </div>

            <button
              onClick={() => {
                setNewRoutineTitle('');
                setNewRoutineDesc('');
                setNewRoutineExercises([]);
                setIsCreateRoutineModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#00f59b] hover:bg-[#00df8c] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Diseñar Nueva Rutina</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routinesList.map((routine) => (
              <motion.div
                key={routine.id}
                whileHover={{ y: -2 }}
                className="bg-[#0e1420] border border-[#1b2636] hover:border-[#2a3c54] rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00f59b] bg-[#00f59b]/10 px-2 py-0.5 rounded-md">
                      {routine.muscleGroup}
                    </span>
                    {routine.isCustom && (
                      <span className="text-[10px] font-bold text-gray-400 bg-[#16202e] px-2 py-0.5 rounded-md">
                        Personalizada
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white mt-2">
                    {routine.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                    {routine.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#182333] space-y-1">
                    <p className="text-[11px] font-bold text-gray-400">
                      {routine.exercises.length} Ejercicios incluidos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {routine.exercises.slice(0, 4).map((exItem, i) => {
                        const ex = COMPREHENSIVE_EXERCISES.find((e) => e.id === exItem.exerciseId);
                        return (
                          <span
                            key={i}
                            className="text-[10px] bg-[#141d2a] text-gray-300 px-2 py-0.5 rounded"
                          >
                            {ex?.name || 'Ejercicio'}
                          </span>
                        );
                      })}
                      {routine.exercises.length > 4 && (
                        <span className="text-[10px] text-gray-500 self-center">
                          +{routine.exercises.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between gap-2">
                  {routine.isCustom && onUpdateRoutines && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar la rutina "${routine.title}"?`)) {
                          onUpdateRoutines(routinesList.filter((r) => r.id !== routine.id));
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 transition"
                      title="Eliminar rutina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => startRoutine(routine)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00f59b] hover:bg-[#00df8c] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Empezar Esta Rutina</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BIBLIOTECA COMPLETA DE EJERCICIOS (+75) */}
      {/* ======================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-[#0e1420] border border-[#1b2636] rounded-2xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchExercise}
                onChange={(e) => setSearchExercise(e.target.value)}
                placeholder="Buscar por ejercicio, músculo o técnica (ej. Press banca, sentadilla, bíceps)..."
                className="w-full bg-[#131b28] border border-[#223044] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00f59b]"
              />
              {searchExercise && (
                <button
                  onClick={() => setSearchExercise('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tags row: 'chest', 'back', 'legs', 'shoulders', etc. */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 whitespace-nowrap mr-1">
                Tags:
              </span>
              {COMMON_EXERCISE_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(tag.id);
                    // Reset specific muscle filter if selecting a tag
                    if (tag.id !== 'all') setSelectedMuscle('todos');
                  }}
                  className={`px-3 py-1 text-xs font-black rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                    selectedTag === tag.id
                      ? 'bg-[#00f59b] text-black shadow-md'
                      : 'bg-[#141e2a] text-gray-300 hover:text-white border border-[#212f42]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span>#{tag.label.toLowerCase()}</span>
                </button>
              ))}
            </div>

            {/* Muscle Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {MUSCLE_GROUPS_LIST.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMuscle(m.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                    selectedMuscle === m.key
                      ? 'bg-[#00f59b] text-black shadow-md'
                      : 'bg-[#141d2a] text-gray-400 hover:text-white border border-[#212f42]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Equipment Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap mr-1">
                Material:
              </span>
              {EQUIPMENT_FILTER_LIST.map((eq) => (
                <button
                  key={eq.key}
                  onClick={() => setSelectedEquipment(eq.key)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap ${
                    selectedEquipment === eq.key
                      ? 'bg-white text-black'
                      : 'bg-[#121924] text-gray-400 hover:text-white'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Mostrando {filteredExercises.length} ejercicios biomecánicos</span>
            {isWorkoutActive && (
              <span className="text-[#00f59b] font-bold">
                ● Sesión activa en curso
              </span>
            )}
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-[#0e1420] border border-[#1a2536] hover:border-[#27384e] rounded-2xl p-4 flex flex-col justify-between space-y-3 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-[#00f59b] bg-[#00f59b]/10 px-2 py-0.5 rounded">
                      {exercise.muscleGroup}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize bg-[#131b26] px-2 py-0.5 rounded">
                      {exercise.equipment.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-white mt-2">
                    {exercise.name}
                  </h4>
                  {exercise.targetMuscle && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Enfoque: <span className="text-gray-300 font-medium">{exercise.targetMuscle}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                    {Array.isArray(exercise.instructions) ? exercise.instructions.join(' ') : exercise.instructions}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#16202e]">
                  <button
                    onClick={() => setSelectedExerciseDetail(exercise)}
                    className="text-xs font-bold text-gray-300 hover:text-[#00f59b] transition flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Ver biomecánica</span>
                  </button>

                  {isWorkoutActive ? (
                    <button
                      onClick={() => handleAddExerciseToWorkout(exercise)}
                      className="flex items-center gap-1 bg-[#00f59b] hover:bg-[#00df8c] text-black text-xs font-black px-3 py-1.5 rounded-xl transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Añadir a mi sesión</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleStartFreestyleWorkout();
                        handleAddExerciseToWorkout(exercise);
                      }}
                      className="flex items-center gap-1 bg-[#141f2e] hover:bg-[#1d2b3f] text-[#00f59b] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#23334a] transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Entrenar este</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PLANTILLAS Y SUGERENCIAS DEL COACH IA */}
      {/* ======================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#0d1624] to-[#090f1a] border border-[#1b283a] rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="max-w-xl space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00f59b]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#00f59b]">
                  Sugerencias Inteligentes
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                ¿Buscas inspiración o una rutina optimizada?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                El Coach de IA puede estructurar una rutina adaptada a tus días disponibles, puntos débiles o fase de volumen/definición, y cargarla directamente en tu entrenamiento.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setIsAIRoutineModalOpen(true)}
                className="flex items-center gap-2 bg-[#00f59b] hover:bg-[#00df8c] text-black font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-[#00f59b]/20 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Generar Rutina Personalizada con IA</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 px-1">
              Plantillas de División Clásicas (Sugerencias)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#0e1420] border border-[#1b2636] rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-black text-white">
                  Push Day (Empuje)
                </h4>
                <p className="text-xs text-gray-400">
                  Pectoral, Deltoides Anterior/Lateral y Tríceps.
                </p>
                <button
                  onClick={() => {
                    const pushRoutine = routinesList.find((r) => r.id === 'rout-1') || routinesList[0];
                    if (pushRoutine) startRoutine(pushRoutine);
                  }}
                  className="w-full py-2 bg-[#141e2c] hover:bg-[#1a283a] text-xs font-bold text-gray-200 rounded-xl transition"
                >
                  Cargar Sugerencia
                </button>
              </div>

              <div className="bg-[#0e1420] border border-[#1b2636] rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-black text-white">
                  Pull Day (Tracción)
                </h4>
                <p className="text-xs text-gray-400">
                  Dorsales, Trapecio, Deltoides Posterior y Bíceps.
                </p>
                <button
                  onClick={() => {
                    const pullRoutine = routinesList.find((r) => r.id === 'rout-2') || routinesList[1];
                    if (pullRoutine) startRoutine(pullRoutine);
                  }}
                  className="w-full py-2 bg-[#141e2c] hover:bg-[#1a283a] text-xs font-bold text-gray-200 rounded-xl transition"
                >
                  Cargar Sugerencia
                </button>
              </div>

              <div className="bg-[#0e1420] border border-[#1b2636] rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-black text-white">
                  Leg Day & Core (Piernas)
                </h4>
                <p className="text-xs text-gray-400">
                  Cuádriceps, Isquios, Glúteos, Gemelos y Abdomen.
                </p>
                <button
                  onClick={() => {
                    const legRoutine = routinesList.find((r) => r.id === 'rout-3') || routinesList[2];
                    if (legRoutine) startRoutine(legRoutine);
                  }}
                  className="w-full py-2 bg-[#141e2c] hover:bg-[#1a283a] text-xs font-bold text-gray-200 rounded-xl transition"
                >
                  Cargar Sugerencia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MÁS DEPORTES (OUTDOOR & RESISTENCIA) */}
      {/* ======================================================== */}
      {activeTab === 'sports' && (
        <div className="space-y-4">
          <div className="bg-[#0e1420] border border-[#1b2636] rounded-3xl p-5 space-y-4">
            <div>
              <h2 className="text-lg font-black text-white">
                Rastreador de Otros Deportes
              </h2>
              <p className="text-xs text-gray-400">
                Registra tus sesiones outdoor o complementarias sin interferir con tus pesas.
              </p>
            </div>

            {/* Sport selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(SPORTS) as SportKey[]).filter((k) => k !== 'gym').map((key) => {
                const s = SPORTS[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSport(key)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedSport === key
                        ? 'bg-[#152132] border-[#00f59b] shadow-md'
                        : 'bg-[#111824] border-[#1b2638] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-extrabold text-white">{s.label.split('/')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Sport Tracker */}
            <div className="pt-4 border-t border-[#182333] flex flex-col items-center justify-center p-6 bg-[#090e17] rounded-2xl space-y-4">
              <div className="text-center">
                <span className="text-xs font-black uppercase text-[#00f59b] tracking-wider">
                  {SPORTS[selectedSport]?.label}
                </span>
                <p className="text-3xl font-black text-white font-mono mt-1">
                  {formatDuration(sportDurationSec)}
                </p>
                {SPORTS[selectedSport]?.tracksDistance && (
                  <p className="text-sm font-bold text-gray-400 mt-1">
                    Distancia estimada: <span className="text-white">{sportDistanceKm.toFixed(2)} km</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isSportTrackingActive ? (
                  <button
                    onClick={() => setIsSportTrackingActive(true)}
                    className="flex items-center gap-2 bg-[#00f59b] hover:bg-[#00df8c] text-black font-black text-sm px-6 py-3 rounded-2xl transition"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Iniciar Registro</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsSportTrackingActive(false)}
                      className="px-4 py-3 bg-[#172334] text-white font-bold text-sm rounded-2xl"
                    >
                      Pausar
                    </button>
                    <button
                      onClick={() => {
                        const mins = Math.max(1, Math.round(sportDurationSec / 60));
                        const cals = calculateCalories(selectedSport, mins, userProfile.weightKg);
                        onSaveGymWorkout({
                          date: new Date().toISOString().split('T')[0],
                          sport: selectedSport,
                          title: `Sesión de ${SPORTS[selectedSport]?.label}`,
                          durationMinutes: mins,
                          calories: cals,
                          distanceKm: sportDistanceKm > 0 ? sportDistanceKm : undefined,
                          rpe: 7,
                        });
                        confetti({ particleCount: 80 });
                        setIsSportTrackingActive(false);
                        setSportDurationSec(0);
                        setSportDistanceKm(0);
                      }}
                      className="px-5 py-3 bg-[#00f59b] text-black font-black text-sm rounded-2xl"
                    >
                      Terminar y Guardar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD EXERCISE DRAWER TO WORKOUT */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isAddExerciseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-2xl bg-[#0c131f] border border-[#1d2a3d] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 px-5 border-b border-[#1b2636] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Añadir Ejercicio al Entrenamiento
                  </h3>
                  <p className="text-xs text-gray-400">
                    Selecciona cualquier ejercicio de la biblioteca para agregarlo a tu sesión.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar, Tags & Muscle Filter */}
              <div className="p-4 space-y-2.5 border-b border-[#182333] bg-[#090f18]">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchExercise}
                    onChange={(e) => setSearchExercise(e.target.value)}
                    placeholder="Buscar por nombre o tag (#chest, #back, #legs, #arms)..."
                    className="w-full bg-[#121a28] border border-[#202e42] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00f59b]"
                  />
                </div>

                {/* Common Tags Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  <span className="text-[10px] font-black uppercase text-gray-500 whitespace-nowrap mr-0.5">
                    Tags:
                  </span>
                  {COMMON_EXERCISE_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTag(tag.id);
                        if (tag.id !== 'all') setSelectedMuscle('todos');
                      }}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTag === tag.id
                          ? 'bg-[#00f59b] text-black shadow-sm'
                          : 'bg-[#141e2c] text-gray-300 hover:text-white border border-[#212f42]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span>#{tag.label.toLowerCase()}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {MUSCLE_GROUPS_LIST.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setSelectedMuscle(m.key)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                        selectedMuscle === m.key
                          ? 'bg-[#00f59b] text-black'
                          : 'bg-[#141e2c] text-gray-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Selection List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => handleAddExerciseToWorkout(exercise)}
                    className="p-3 bg-[#111926] hover:bg-[#162234] border border-[#1b2738] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition group"
                  >
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-[#00f59b] transition">
                        {exercise.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 capitalize">
                        {exercise.muscleGroup} · {exercise.equipment.replace('_', ' ')}
                      </p>
                    </div>

                    <button className="flex items-center gap-1 bg-[#1a2638] group-hover:bg-[#00f59b] text-gray-300 group-hover:text-black text-xs font-bold px-3 py-1.5 rounded-lg transition">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Añadir</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: BIOMECHANICAL DETAIL MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedExerciseDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1420] border border-[#1e2a3c] rounded-3xl p-6 space-y-4 shadow-2xl overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#00f59b] bg-[#00f59b]/10 px-2 py-0.5 rounded">
                    {selectedExerciseDetail.muscleGroup}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {selectedExerciseDetail.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedExerciseDetail(null)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-gray-300">
                {selectedExerciseDetail.targetMuscle && (
                  <div className="p-3 bg-[#131b28] rounded-xl border border-[#1f2c3e]">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Enfoque Primario</p>
                    <p className="text-white font-bold mt-0.5">{selectedExerciseDetail.targetMuscle}</p>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Ejecución Biomecánica</p>
                  <p className="leading-relaxed bg-[#111722] p-3 rounded-xl border border-[#1b2636]">
                    {Array.isArray(selectedExerciseDetail.instructions)
                      ? selectedExerciseDetail.instructions.join('\n\n')
                      : selectedExerciseDetail.instructions}
                  </p>
                </div>

                {selectedExerciseDetail.secondaryMuscles && selectedExerciseDetail.secondaryMuscles.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Músculos Sinergistas / Secundarios</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedExerciseDetail.secondaryMuscles.map((sm, i) => (
                        <span key={i} className="text-[11px] bg-[#16202e] text-gray-300 px-2.5 py-1 rounded-lg">
                          {sm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedExerciseDetail(null)}
                  className="px-4 py-2 bg-[#1b2636] hover:bg-[#233246] text-white text-xs font-bold rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: SAVE CURRENT WORKOUT AS REUSABLE ROUTINE */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isSaveRoutineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1420] border border-[#1e2a3c] rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-black text-white">
                Guardar como Mi Rutina
              </h3>
              <p className="text-xs text-gray-400">
                Asigna un nombre a esta rutina para poder seleccionarla y repetirla cuando quieras.
              </p>

              <input
                type="text"
                value={saveRoutineName}
                onChange={(e) => setSaveRoutineName(e.target.value)}
                placeholder="Ej. Pecho & Tríceps Pesado, Pierna Enfoque Glúteo..."
                className="w-full bg-[#131b28] border border-[#243347] text-white text-sm p-3 rounded-xl focus:outline-none focus:border-[#00f59b]"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsSaveRoutineModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsCustomRoutine}
                  disabled={!saveRoutineName.trim()}
                  className="px-5 py-2.5 bg-[#00f59b] hover:bg-[#00df8c] disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  Guardar Rutina
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3.5: DEDICATED CUSTOM ROUTINE BUILDER WITH TAGS */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isCreateRoutineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0c131f] border border-[#1e2c3e] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 px-5 border-b border-[#1b2636] flex items-center justify-between bg-[#0e1624]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f59b]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00f59b]">
                      DISEÑADOR DE RUTINAS PERSONALIZADAS
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Crear Nueva Rutina
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateRoutineModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Basic Routine Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#111824] p-3.5 rounded-2xl border border-[#1c2738]">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase">
                      Nombre de la Rutina
                    </label>
                    <input
                      type="text"
                      value={newRoutineTitle}
                      onChange={(e) => setNewRoutineTitle(e.target.value)}
                      placeholder="Ej. Torso Pesado, Pierna Hipertrofia..."
                      className="w-full bg-[#0a0f17] border border-[#223247] text-white text-xs sm:text-sm p-2.5 rounded-xl focus:outline-none focus:border-[#00f59b] mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase">
                      Enfoque Muscular
                    </label>
                    <select
                      value={newRoutineMuscle}
                      onChange={(e) => setNewRoutineMuscle(e.target.value)}
                      className="w-full bg-[#0a0f17] border border-[#223247] text-white text-xs sm:text-sm p-2.5 rounded-xl focus:outline-none focus:border-[#00f59b] mt-1 capitalize"
                    >
                      <option value="Personalizada">Personalizada</option>
                      <option value="Pecho & Tríceps">Pecho & Tríceps (Empuje)</option>
                      <option value="Espalda & Bíceps">Espalda & Bíceps (Tracción)</option>
                      <option value="Piernas & Glúteos">Piernas & Glúteos</option>
                      <option value="Hombros & Brazos">Hombros & Brazos</option>
                      <option value="Torso Completo">Torso Completo</option>
                      <option value="Full Body">Full Body</option>
                      <option value="Core & Abs">Core & Abs</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">
                      Descripción u Objetivo (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newRoutineDesc}
                      onChange={(e) => setNewRoutineDesc(e.target.value)}
                      placeholder="Ej. Rango 6-10 repeticiones pesadas con énfasis en sobrecarga..."
                      className="w-full bg-[#0a0f17] border border-[#223247] text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#00f59b] mt-1"
                    />
                  </div>
                </div>

                {/* Exercises currently added to this new routine */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-[#00f59b]" />
                      <span>Ejercicios Seleccionados ({newRoutineExercises.length})</span>
                    </h4>
                    {newRoutineExercises.length > 0 && (
                      <span className="text-[11px] text-gray-400">
                        Configura series, repeticiones y kilos sugeridos
                      </span>
                    )}
                  </div>

                  {newRoutineExercises.length === 0 ? (
                    <div className="p-4 bg-[#0e1522] border border-dashed border-[#1f2d40] rounded-2xl text-center text-xs text-gray-400">
                      Usa el buscador inferior con tags como <span className="text-[#00f59b] font-bold">#chest</span>, <span className="text-[#38bdf8] font-bold">#back</span> o <span className="text-[#f59e0b] font-bold">#legs</span> para añadir ejercicios a esta rutina.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {newRoutineExercises.map((item, idx) => {
                        const ex = COMPREHENSIVE_EXERCISES.find((e) => e.id === item.exerciseId);
                        return (
                          <div
                            key={item.exerciseId}
                            className="bg-[#111926] border border-[#1e2a3c] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#00f59b]/15 text-[#00f59b] flex items-center justify-center text-[11px] font-black">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-xs sm:text-sm font-extrabold text-white">
                                  {ex?.name || 'Ejercicio'}
                                </p>
                                <p className="text-[10px] text-gray-400 capitalize">
                                  {ex?.muscleGroup} · {ex?.equipment.replace('_', ' ')}
                                </p>
                              </div>
                            </div>

                            {/* Sets / Reps / Weight inputs */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {/* Sets */}
                              <div className="flex items-center gap-1 bg-[#090e17] px-2 py-1 rounded-lg border border-[#1f2b3c]">
                                <span className="text-[10px] font-bold text-gray-400">Series:</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRoutineExercise(idx, 'defaultSets', (item.defaultSets || 3) - 1)}
                                  className="w-5 h-5 rounded bg-[#172233] text-gray-300 text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-white w-4 text-center">
                                  {item.defaultSets || 3}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRoutineExercise(idx, 'defaultSets', (item.defaultSets || 3) + 1)}
                                  className="w-5 h-5 rounded bg-[#172233] text-[#00f59b] text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>

                              {/* Reps */}
                              <div className="flex items-center gap-1 bg-[#090e17] px-2 py-1 rounded-lg border border-[#1f2b3c]">
                                <span className="text-[10px] font-bold text-gray-400">Reps:</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRoutineExercise(idx, 'defaultReps', (item.defaultReps || 10) - 1)}
                                  className="w-5 h-5 rounded bg-[#172233] text-gray-300 text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-white w-5 text-center">
                                  {item.defaultReps || 10}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRoutineExercise(idx, 'defaultReps', (item.defaultReps || 10) + 1)}
                                  className="w-5 h-5 rounded bg-[#172233] text-[#00f59b] text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>

                              {/* Weight */}
                              <div className="flex items-center gap-1 bg-[#090e17] px-2 py-1 rounded-lg border border-[#1f2b3c]">
                                <span className="text-[10px] font-bold text-gray-400">Kg:</span>
                                <input
                                  type="number"
                                  value={item.defaultWeightKg || 0}
                                  onChange={(e) => handleUpdateRoutineExercise(idx, 'defaultWeightKg', parseFloat(e.target.value) || 0)}
                                  className="w-10 bg-transparent text-xs font-black text-[#00f59b] text-center focus:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveRoutineExercise(idx)}
                                className="p-1.5 text-gray-500 hover:text-red-400 transition"
                                title="Eliminar de rutina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Searchable Database of Common Exercises with Tags */}
                <div className="space-y-3 pt-3 border-t border-[#1b2636]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">
                      Buscador de Ejercicios con Tags
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {filteredRoutineBuilderExercises.length} disponibles
                    </span>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={routineBuilderSearch}
                      onChange={(e) => setRoutineBuilderSearch(e.target.value)}
                      placeholder="Buscar por nombre, músculo o tag (#chest, #back, #legs, #shoulders)..."
                      className="w-full bg-[#111926] border border-[#202e42] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00f59b]"
                    />
                    {routineBuilderSearch && (
                      <button
                        onClick={() => setRoutineBuilderSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Tags Selector Pills: 'all', 'chest', 'back', 'legs', etc. */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    <span className="text-[10px] font-black uppercase text-gray-500 whitespace-nowrap mr-0.5">
                      Filtro:
                    </span>
                    {COMMON_EXERCISE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setRoutineBuilderTag(tag.id)}
                        className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                          routineBuilderTag === tag.id
                            ? 'bg-[#00f59b] text-black shadow-md'
                            : 'bg-[#131b28] text-gray-300 hover:text-white border border-[#212f42]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span>#{tag.label.toLowerCase()}</span>
                      </button>
                    ))}
                  </div>

                  {/* Exercises Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {filteredRoutineBuilderExercises.map((exercise) => {
                      const isSelected = newRoutineExercises.some((e) => e.exerciseId === exercise.id);
                      return (
                        <div
                          key={exercise.id}
                          onClick={() => handleToggleExerciseInRoutine(exercise.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#00f59b]/15 border-[#00f59b]'
                              : 'bg-[#111926] hover:bg-[#162132] border-[#1d293b]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {exercise.name}
                            </p>
                            <p className="text-[10px] text-gray-400 capitalize">
                              {exercise.muscleGroup} · {exercise.equipment.replace('_', ' ')}
                            </p>
                          </div>

                          <button
                            type="button"
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition ${
                              isSelected
                                ? 'bg-[#00f59b] text-black'
                                : 'bg-[#1a2536] text-gray-400 hover:text-white'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 px-5 border-t border-[#1b2636] bg-[#0c131f] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-gray-400">
                  Total: <strong className="text-white">{newRoutineExercises.length}</strong> ejercicios incluidos
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreateRoutineModalOpen(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white bg-[#151f2e] rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveBuiltRoutine(false)}
                    disabled={!newRoutineTitle.trim() || newRoutineExercises.length === 0}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#172436] hover:bg-[#20314a] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl border border-[#273a54] transition"
                  >
                    Guardar Rutina
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveBuiltRoutine(true)}
                    disabled={!newRoutineTitle.trim() || newRoutineExercises.length === 0}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#00f59b] hover:bg-[#00df8c] disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-lg shadow-[#00f59b]/20 transition active:scale-95"
                  >
                    Guardar y Entrenar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 4: FINISH WORKOUT VICTORY RECAP */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isFinishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-[#0e1420] border border-[#1e2a3c] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#00f59b]/20 border border-[#00f59b]/40 flex items-center justify-center text-[#00f59b] shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00f59b]">
                  ¡SESIÓN COMPLETADA!
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Resumen de tu Entrenamiento
                </h3>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-2.5 bg-[#121926] p-4 rounded-2xl border border-[#1b2636]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Tiempo</p>
                  <p className="text-lg font-black text-white mt-0.5 font-mono">
                    {formatDuration(workoutDurationSec)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Volumen</p>
                  <p className="text-lg font-black text-[#00f59b] mt-0.5 font-mono">
                    {totalVolumeKg.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Series</p>
                  <p className="text-lg font-black text-white mt-0.5 font-mono">
                    {totalSetsCompleted} / {totalSetsCount}
                  </p>
                </div>
              </div>

              {/* RPE & Notes input */}
              <div className="text-left space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  Esfuerzo Percibido (RPE: 1 - 10)
                </label>
                <div className="flex items-center gap-1.5 justify-between">
                  {[6, 7, 8, 9, 10].map((val) => (
                    <button
                      key={val}
                      onClick={() => setWorkoutRpe(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
                        workoutRpe === val
                          ? 'bg-[#00f59b] text-black shadow'
                          : 'bg-[#151e2c] text-gray-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-300">
                    Notas o Sensaciones (Opcional)
                  </label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="Sensaciones en press banca, técnica, descanso..."
                    rows={2}
                    className="w-full bg-[#121926] border border-[#212f42] text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-[#00f59b] mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsFinishModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-white bg-[#151f2e] rounded-xl transition"
                >
                  Continuar Entrenando
                </button>
                <button
                  onClick={handleConfirmFinishWorkout}
                  className="flex-1 py-3 bg-[#00f59b] hover:bg-[#00df8c] text-black font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#00f59b]/25 transition active:scale-95"
                >
                  Guardar en Progreso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals for Tools & AI Generator */}
      <GymToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
      />

      <AIRoutineGeneratorModal
        isOpen={isAIRoutineModalOpen}
        onClose={() => setIsAIRoutineModalOpen(false)}
        userProfile={userProfile}
        onApplyRoutine={(routine) => {
          setIsAIRoutineModalOpen(false);
          startRoutine(routine);
        }}
      />
    </div>
  );
};
