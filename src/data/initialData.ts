import { 
  SportInfo, 
  SportKey, 
  GymExercise, 
  GymRoutine, 
  Achievement, 
  Goal, 
  UserProfile, 
  ActivityRecord,
  FoodItem,
  WeightEntry,
  BodyMeasurement,
  Challenge,
  AthleteRank,
  PersonalRecords,
  ProgressPhoto,
  DayPlan
} from '../types';

export const SPORTS: Record<SportKey, SportInfo> = {
  gym: { key: 'gym', label: 'Gimnasio Pro', met: 6.0, tracksDistance: false, color: '#b6f047' },
  running: { key: 'running', label: 'Running / Carrera', met: 9.8, tracksDistance: true, color: '#38bdf8' },
  walking: { key: 'walking', label: 'Caminata Rápida', met: 3.5, tracksDistance: true, color: '#10b981' },
  cycling: { key: 'cycling', label: 'Ciclismo', met: 7.5, tracksDistance: true, color: '#f59e0b' },
  football: { key: 'football', label: 'Fútbol / Deportes', met: 8.5, tracksDistance: true, color: '#06b6d4' },
  swimming: { key: 'swimming', label: 'Natación', met: 8.0, tracksDistance: true, color: '#0ea5e9' },
  hiking: { key: 'hiking', label: 'Senderismo / Trail', met: 6.0, tracksDistance: true, color: '#84cc16' },
  yoga: { key: 'yoga', label: 'Yoga & Movilidad', met: 3.0, tracksDistance: false, color: '#a855f7' },
  hiit: { key: 'hiit', label: 'HIIT / Calistenia', met: 10.0, tracksDistance: false, color: '#ef4444' },
  boxing: { key: 'boxing', label: 'Boxeo / Combate', met: 9.0, tracksDistance: false, color: '#ec4899' },
  basketball: { key: 'basketball', label: 'Baloncesto', met: 8.0, tracksDistance: true, color: '#f97316' },
};

export function calculateCalories(sport: SportKey, durationMinutes: number, weightKg: number = 70): number {
  const met = SPORTS[sport]?.met || 6.0;
  return Math.round((met * 3.5 * weightKg / 200) * durationMinutes);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins % 60}m ${secs}s`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Moreno',
  email: 'alex.moreno@pulse.ai',
  age: 26,
  weightKg: 76.5,
  heightCm: 179,
  goal: 'Hipertrofia Muscular & Simetría Estética',
  level: 'Intermedio',
  athleteLevel: 1,
  totalXp: 0,
  dailyCalorieTarget: 600,
  weeklyMinutesTarget: 240,
  weeklyWorkoutsTarget: 4,
  language: 'es',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  targetProteinG: 160,
  targetCarbsG: 240,
  targetFatG: 65,
  targetWaterMl: 2500,
};

export const INITIAL_PERSONAL_RECORDS: PersonalRecords = {
  benchPressKg: 0,
  squatKg: 0,
  deadliftKg: 0,
  militaryPressKg: 0,
  pullUpsKg: 0,
  dipsKg: 0,
  legPressKg: 0,
  updatedAt: new Date().toISOString().split('T')[0],
};

export const INITIAL_PROGRESS_PHOTOS: ProgressPhoto[] = [];

export const INITIAL_WEEKLY_PLAN: DayPlan[] = [
  { dayId: 'mon', dayName: 'Lunes', isRest: false, routineId: 'rout-1', routineTitle: 'Push Day (Pecho, Hombro, Tríceps)' },
  { dayId: 'tue', dayName: 'Martes', isRest: false, routineId: 'rout-2', routineTitle: 'Pull Day (Espalda, Bíceps, Trapecio)' },
  { dayId: 'wed', dayName: 'Miércoles', isRest: false, routineId: 'rout-3', routineTitle: 'Legs & Core (Cuádriceps, Isquios, Abs)' },
  { dayId: 'thu', dayName: 'Jueves', isRest: true, routineTitle: 'Descanso Activo / Movilidad' },
  { dayId: 'fri', dayName: 'Viernes', isRest: false, routineTitle: 'Upper Body Torso Pro' },
  { dayId: 'sat', dayName: 'Sábado', isRest: false, routineId: 'rout-5', routineTitle: 'Glúteos, Femoral & Gemelos' },
  { dayId: 'sun', dayName: 'Domingo', isRest: true, routineTitle: 'Descanso Total & Recuperación' },
];

export const INITIAL_MEASUREMENTS: BodyMeasurement[] = [];

import { COMPREHENSIVE_EXERCISES } from './exercisesData';

export const INITIAL_EXERCISES: GymExercise[] = COMPREHENSIVE_EXERCISES;

export const INITIAL_ROUTINES: GymRoutine[] = [
  {
    id: 'rout-1',
    title: 'Push Day (Pecho, Hombro, Tríceps)',
    description: 'Enfocado en desarrollo de fuerza e hipertrofia del tren superior.',
    muscleGroup: 'Pecho y Hombros',
    exercises: [
      { exerciseId: 'ex-1', defaultSets: 4, defaultReps: 8, defaultWeightKg: 70 },
      { exerciseId: 'ex-2', defaultSets: 3, defaultReps: 10, defaultWeightKg: 24 },
      { exerciseId: 'ex-11', defaultSets: 3, defaultReps: 8, defaultWeightKg: 45 },
      { exerciseId: 'ex-12', defaultSets: 4, defaultReps: 15, defaultWeightKg: 10 },
      { exerciseId: 'ex-16', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25 }
    ]
  },
  {
    id: 'rout-2',
    title: 'Pull Day (Espalda, Deltoides Posterior, Bíceps)',
    description: 'Densidad y amplitud de espalda combinada con brazos.',
    muscleGroup: 'Espalda y Bíceps',
    exercises: [
      { exerciseId: 'ex-4', defaultSets: 4, defaultReps: 8, defaultWeightKg: 0 },
      { exerciseId: 'ex-5', defaultSets: 4, defaultReps: 10, defaultWeightKg: 60 },
      { exerciseId: 'ex-6', defaultSets: 3, defaultReps: 12, defaultWeightKg: 55 },
      { exerciseId: 'ex-13', defaultSets: 4, defaultReps: 15, defaultWeightKg: 20 },
      { exerciseId: 'ex-14', defaultSets: 3, defaultReps: 10, defaultWeightKg: 30 }
    ]
  },
  {
    id: 'rout-3',
    title: 'Leg Day & Core (Piernas Fuertes)',
    description: 'Cuádriceps, cadena posterior y estabilidad de abdomen.',
    muscleGroup: 'Piernas y Core',
    exercises: [
      { exerciseId: 'ex-7', defaultSets: 4, defaultReps: 6, defaultWeightKg: 90 },
      { exerciseId: 'ex-8', defaultSets: 3, defaultReps: 10, defaultWeightKg: 140 },
      { exerciseId: 'ex-9', defaultSets: 3, defaultReps: 10, defaultWeightKg: 30 },
      { exerciseId: 'ex-10', defaultSets: 4, defaultReps: 15, defaultWeightKg: 60 },
      { exerciseId: 'ex-17', defaultSets: 3, defaultReps: 60, defaultWeightKg: 0 }
    ]
  }
];

export const INITIAL_ACTIVITIES: ActivityRecord[] = [];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g-1', title: 'Calorías semanales activas', target: 2800, current: 0, unit: 'kcal', period: 'semanal' },
  { id: 'g-2', title: 'Minutos de entrenamiento', target: 240, current: 0, unit: 'min', period: 'semanal' },
  { id: 'g-3', title: 'Distancia en Running', target: 25, current: 0, unit: 'km', period: 'semanal', sport: 'running' }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', title: 'Primera Gota', description: 'Completa tu primer entrenamiento registrado.', iconName: 'Flame', unlocked: false, progress: 0, maxProgress: 1 },
  { id: 'ach-2', title: 'Racha de 7 Días', description: 'Entrena 7 días consecutivos sin fallar.', iconName: 'Zap', unlocked: false, progress: 0, maxProgress: 7 },
  { id: 'ach-3', title: 'Club de los 100 km', description: 'Acumula 100 km de actividad al aire libre.', iconName: 'Award', unlocked: false, progress: 0, maxProgress: 100 },
  { id: 'ach-4', title: 'Titán del Gimnasio', description: 'Registra 10 entrenamientos de fuerza.', iconName: 'Dumbbell', unlocked: false, progress: 0, maxProgress: 10 },
  { id: 'ach-5', title: 'Quema 5.000 kcal', description: 'Consumo calórico total en la app.', iconName: 'Trophy', unlocked: false, progress: 0, maxProgress: 5000 }
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [];

export const INITIAL_WEIGHT_ENTRIES: WeightEntry[] = [
  { id: 'w-init', date: new Date().toISOString().split('T')[0], weightKg: 76.5, notes: 'Peso inicial de registro' }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Desafío Titán PulseAI',
    description: 'Quema 4.000 kcal en actividades deportivas esta semana.',
    category: 'cardio',
    current: 0,
    target: 4000,
    unit: 'kcal',
    xpReward: 350,
    joined: false,
    completed: false,
    daysLeft: 7,
  },
  {
    id: 'ch-2',
    title: 'Iron Grip — 15 Toneladas',
    description: 'Mueve 15.000 kg acumulados en series de gimnasio.',
    category: 'gym',
    current: 0,
    target: 15000,
    unit: 'kg',
    xpReward: 500,
    joined: false,
    completed: false,
    daysLeft: 7,
  },
  {
    id: 'ch-3',
    title: 'Semana Implacable (5/5)',
    description: 'Completa al menos 5 sesiones de entrenamiento.',
    category: 'streak',
    current: 0,
    target: 5,
    unit: 'sesiones',
    xpReward: 400,
    joined: false,
    completed: false,
    daysLeft: 7,
  },
  {
    id: 'ch-4',
    title: 'Objetivo Hidratación 7 Días',
    description: 'Alcanza los 2.500 ml diarios de agua durante 7 días seguidos.',
    category: 'nutrition',
    current: 0,
    target: 7,
    unit: 'días',
    xpReward: 250,
    joined: false,
    completed: false,
    daysLeft: 7,
  },
];

export const INITIAL_LEADERBOARD: AthleteRank[] = [
  { rank: 1, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', xp: 4850, level: 14, badge: 'Leyenda Élite' },
  { rank: 2, name: 'Carlos Mendoza', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', xp: 4210, level: 12, badge: 'Máster Hyrox' },
  { rank: 3, name: 'Sofia Valdés', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', xp: 3450, level: 10, badge: 'Atleta Pro' },
  { rank: 4, name: 'Mateo Silva', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', xp: 2980, level: 9, badge: 'Velocista' },
  { rank: 5, name: 'Lucía Navarro', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', xp: 2650, level: 8, badge: 'Iron Runner' },
  { rank: 6, name: 'Alex Moreno', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', xp: 0, level: 1, badge: 'Atleta Iniciado', isCurrentUser: true },
];
