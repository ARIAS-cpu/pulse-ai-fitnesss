import { Language } from './utils/translations';
export type { Language };

export type SportKey = 
  | 'gym'
  | 'running'
  | 'walking'
  | 'cycling'
  | 'football'
  | 'swimming'
  | 'hiking'
  | 'yoga'
  | 'hiit'
  | 'boxing'
  | 'basketball';

export interface SportInfo {
  key: SportKey;
  label: string;
  met: number;
  tracksDistance: boolean;
  color: string;
}

export interface ActivityRecord {
  id: string;
  sport: SportKey;
  title: string;
  durationMinutes: number;
  distanceKm?: number;
  calories: number;
  heartRateAvg?: number;
  averageHeartRate?: number;
  date: string; // ISO string
  notes?: string;
  rpe?: number; // Rate of Perceived Exertion 1-10
  gymSets?: GymSet[];
  totalVolumeKg?: number;
  muscleGroupsTrained?: string[];
  exerciseSummary?: {
    exerciseId: string;
    exerciseName: string;
    maxWeightKg: number;
    totalReps: number;
  }[];
}

export interface GymExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string | string[];
  targetMuscle?: string;
  description?: string;
  gifUrl?: string;
  secondaryMuscles?: string[];
  tags?: string[];
}

export interface GymSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  completed: boolean;
  type?: 'normal' | 'warmup' | 'dropset' | 'failure';
  notes?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  sets?: number;
  targetReps?: number;
  suggestedWeightKg?: number;
  notes?: string;
}

export interface GymRoutine {
  id: string;
  title: string;
  description: string;
  muscleGroup: string;
  exercises: RoutineExercise[];
  isCustom?: boolean;
  level?: string;
  estimatedDurationMinutes?: number;
}

export interface DayPlan {
  dayId: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  dayName: string;
  isRest: boolean;
  routineId?: string;
  routineTitle?: string;
}

export interface PersonalRecords {
  benchPressKg: number;
  squatKg: number;
  deadliftKg: number;
  militaryPressKg: number;
  pullUpsKg: number; // weight added or bodyweight reps
  dipsKg: number;
  legPressKg: number;
  updatedAt: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  url: string; // data URL or mock image
  angle: 'front' | 'side' | 'back';
  weightKg?: number;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'semanal' | 'mensual';
  sport?: SportKey;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  icon?: string;
  unlocked: boolean;
  unlockedAt?: string;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  age?: number;
  weightKg: number;
  heightCm: number;
  goal: string;
  level: string;
  athleteLevel?: number;
  totalXp?: number;
  dailyCalorieTarget: number;
  weeklyMinutesTarget: number;
  weeklyWorkoutsTarget: number;
  language?: Language;
  avatarUrl?: string;
  // Nutrition targets
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  targetWaterMl?: number;
}

export type MealType = 'desayuno' | 'almuerzo' | 'merienda' | 'cena' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  portion: string;
  time: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bicepsLeftCm?: number;
  bicepsRightCm?: number;
  thighLeftCm?: number;
  thighRightCm?: number;
  calvesCm?: number;
  neckCm?: number;
  forearmsCm?: number;
  bicepsCm?: number; // legacy backward compatibility
  thighCm?: number;  // legacy backward compatibility
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'cardio' | 'gym' | 'streak' | 'nutrition';
  current: number;
  target: number;
  unit: string;
  xpReward: number;
  joined: boolean;
  completed: boolean;
  daysLeft: number;
}

export interface AthleteRank {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AuthSession {
  isLoggedIn: boolean;
  user: UserProfile | null;
  token?: string;
}
