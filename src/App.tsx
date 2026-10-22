import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { HomeView } from './components/HomeView';
import { GymView } from './components/GymView';
import { CoachView } from './components/CoachView';
import { StatsView } from './components/StatsView';
import { GymToolsModal } from './components/GymToolsModal';
import { AIRoutineGeneratorModal } from './components/AIRoutineGeneratorModal';
import { DataExportModal } from './components/DataExportModal';

import { 
  ActivityRecord, 
  SportKey, 
  UserProfile, 
  Goal, 
  Achievement,
  FoodItem,
  WeightEntry,
  BodyMeasurement,
  Challenge,
  AthleteRank,
  PersonalRecords,
  ProgressPhoto,
  DayPlan,
  GymRoutine
} from './types';

import { 
  INITIAL_USER_PROFILE, 
  INITIAL_ACTIVITIES, 
  INITIAL_GOALS, 
  INITIAL_ACHIEVEMENTS,
  INITIAL_FOOD_ITEMS,
  INITIAL_WEIGHT_ENTRIES,
  INITIAL_MEASUREMENTS,
  INITIAL_CHALLENGES,
  INITIAL_LEADERBOARD,
  INITIAL_PERSONAL_RECORDS,
  INITIAL_PROGRESS_PHOTOS,
  INITIAL_WEEKLY_PLAN,
  INITIAL_ROUTINES
} from './data/initialData';

import { Language } from './utils/translations';

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('symmetry_is_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  // Current active view of the 5 main sections
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [routineToStartImmediately, setRoutineToStartImmediately] = useState<GymRoutine | null>(null);

  // Modals state
  const [isGymToolsModalOpen, setIsGymToolsModalOpen] = useState(false);
  const [isAIRoutineModalOpen, setIsAIRoutineModalOpen] = useState(false);
  const [isDataExportModalOpen, setIsDataExportModalOpen] = useState(false);

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('symmetry_lang');
      return (saved as Language) || 'es';
    } catch {
      return 'es';
    }
  });

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('symmetry_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.totalXp === 4250 || parsed.athleteLevel === 12) {
          parsed.totalXp = 0;
          parsed.athleteLevel = 1;
        }
        return parsed;
      }
      return INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Personal Records (1RM) - Clean slate from 0 for new athletes
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>(() => {
    try {
      const isManuallySet = localStorage.getItem('pulse_prs_manually_set') === 'true';
      const savedActivities = localStorage.getItem('symmetry_activities');
      const hasActivities = savedActivities ? JSON.parse(savedActivities).length > 0 : false;
      const saved = localStorage.getItem('symmetry_prs');
      if (saved && (isManuallySet || hasActivities)) {
        const parsed = JSON.parse(saved);
        // Purge legacy mock data
        if ((parsed.benchPressKg === 105 && parsed.squatKg === 140) || (!hasActivities && !isManuallySet)) {
          return INITIAL_PERSONAL_RECORDS;
        }
        return parsed;
      }
      return INITIAL_PERSONAL_RECORDS;
    } catch {
      return INITIAL_PERSONAL_RECORDS;
    }
  });

  // Progress Photos - Start empty
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasMock = Array.isArray(parsed) && parsed.some((p: any) => p.id === 'photo-1' || p.id === 'photo-2');
        if (!hasMock) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [routines, setRoutines] = useState<GymRoutine[]>(() => {
    try {
      const saved = localStorage.getItem('pulse_custom_routines');
      return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  // Weekly Customizable Plan
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_weekly_plan');
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_PLAN;
    } catch {
      return INITIAL_WEEKLY_PLAN;
    }
  });

  // Activities, weight, measurements - Start completely clean (empty)
  const [activities, setActivities] = useState<ActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasMock = Array.isArray(parsed) && parsed.some((a: any) => a.id === 'act-1' || a.id === 'act-2');
        if (!hasMock) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_weight_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasMock = Array.isArray(parsed) && parsed.some((w: any) => w.id === 'w-1');
        if (!hasMock) return parsed;
      }
      return INITIAL_WEIGHT_ENTRIES;
    } catch {
      return INITIAL_WEIGHT_ENTRIES;
    }
  });

  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_measurements');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasMock = Array.isArray(parsed) && parsed.some((m: any) => m.id === 'm-1');
        if (!hasMock) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If has old mock current values (1635, 190)
        if (Array.isArray(parsed) && parsed.some((g: any) => g.current === 1635)) {
          return INITIAL_GOALS;
        }
        return parsed;
      }
      return INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((a: any) => a.id === 'ach-1' && a.unlocked)) {
          return INITIAL_ACHIEVEMENTS;
        }
        return parsed;
      }
      return INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_challenges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((ch: any) => ch.current === 1635 || ch.current === 11200)) {
          return INITIAL_CHALLENGES;
        }
        return parsed;
      }
      return INITIAL_CHALLENGES;
    } catch {
      return INITIAL_CHALLENGES;
    }
  });

  const [leaderboard] = useState<AthleteRank[]>(INITIAL_LEADERBOARD);
  const [waterMl, setWaterMl] = useState<number>(0);

  // Dynamic streak calculation based on real recorded activities
  const streakDays = activities.length > 0 ? (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const uniqueDates = Array.from(new Set(activities.map(a => a.date.split('T')[0]))).sort().reverse();
    if (uniqueDates.length === 0) return 0;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterday)) {
      return 0;
    }
    let streak = 0;
    let checkDate = new Date(uniqueDates.includes(todayStr) ? todayStr : yesterday);
    for (const dateStr of uniqueDates) {
      if (dateStr === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })() : 0;

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('symmetry_is_authenticated', isLoggedIn ? 'true' : 'false');
    } catch {}
  }, [isLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_lang', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_prs', JSON.stringify(personalRecords));
    } catch {}
  }, [personalRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_photos', JSON.stringify(progressPhotos));
    } catch {}
  }, [progressPhotos]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_custom_routines', JSON.stringify(routines));
    } catch {}
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_weekly_plan', JSON.stringify(weeklyPlan));
    } catch {}
  }, [weeklyPlan]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_activities', JSON.stringify(activities));
    } catch {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_weight_entries', JSON.stringify(weightEntries));
    } catch {}
  }, [weightEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('symmetry_measurements', JSON.stringify(measurements));
    } catch {}
  }, [measurements]);

  // Handlers
  const handleLoginSuccess = (profileData: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...profileData,
    }));
    setIsLoggedIn(true);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('symmetry_is_authenticated');
    } catch {}
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setUserProfile((prev) => ({
      ...prev,
      language: lang,
    }));
  };

  const handleSaveActivity = (newAct: Omit<ActivityRecord, 'id'>) => {
    const record: ActivityRecord = {
      ...newAct,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [record, ...prev]);

    // Update goals
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === 'g-1') return { ...g, current: g.current + record.calories };
        if (g.id === 'g-2') return { ...g, current: g.current + record.durationMinutes };
        return g;
      })
    );

    // XP gained
    const xpGained = Math.round(record.calories / 4);
    setUserProfile((prev) => {
      const currentXp = prev.totalXp ?? 0;
      const updatedXp = currentXp + xpGained;
      const updatedLevel = Math.max(1, Math.floor(updatedXp / 350) + 1);
      return {
        ...prev,
        totalXp: updatedXp,
        athleteLevel: updatedLevel,
      };
    });

    // Automatically check and update Personal Records (marcas) from the workout!
    if (record.exerciseSummary && record.exerciseSummary.length > 0) {
      setPersonalRecords((prev) => {
        let updated = { ...prev };
        let anyUpdated = false;

        record.exerciseSummary?.forEach((ex) => {
          const nameLower = ex.exerciseName.toLowerCase();
          const weight = ex.maxWeightKg;
          if (weight <= 0) return;

          if ((nameLower.includes('banca') || nameLower.includes('bench')) && weight > (updated.benchPressKg || 0)) {
            updated.benchPressKg = weight;
            anyUpdated = true;
          } else if ((nameLower.includes('sentadilla') || nameLower.includes('squat')) && weight > (updated.squatKg || 0)) {
            updated.squatKg = weight;
            anyUpdated = true;
          } else if ((nameLower.includes('muerto') || nameLower.includes('deadlift')) && weight > (updated.deadliftKg || 0)) {
            updated.deadliftKg = weight;
            anyUpdated = true;
          } else if ((nameLower.includes('militar') || nameLower.includes('military')) && weight > (updated.militaryPressKg || 0)) {
            updated.militaryPressKg = weight;
            anyUpdated = true;
          } else if ((nameLower.includes('prensa') || nameLower.includes('leg press')) && weight > (updated.legPressKg || 0)) {
            updated.legPressKg = weight;
            anyUpdated = true;
          } else if ((nameLower.includes('dominada') || nameLower.includes('pull-up') || nameLower.includes('pull up')) && weight > (updated.pullUpsKg || 0)) {
            updated.pullUpsKg = weight;
            anyUpdated = true;
          } else if ((nameLower.includes('fondo') || nameLower.includes('dip')) && weight > (updated.dipsKg || 0)) {
            updated.dipsKg = weight;
            anyUpdated = true;
          }
        });

        if (anyUpdated) {
          updated.updatedAt = new Date().toISOString().split('T')[0];
          localStorage.setItem('pulse_prs_manually_set', 'true');
        }
        return updated;
      });
    }
  };

  const handleResetAllData = () => {
    setActivities([]);
    setPersonalRecords(INITIAL_PERSONAL_RECORDS);
    setUserProfile((prev) => ({
      ...prev,
      athleteLevel: 1,
      totalXp: 0,
    }));
    setProgressPhotos([]);
    setMeasurements([]);
    setWaterMl(0);
    localStorage.removeItem('symmetry_activities');
    localStorage.removeItem('symmetry_prs');
    localStorage.removeItem('pulse_prs_manually_set');
    localStorage.removeItem('symmetry_photos');
    localStorage.removeItem('symmetry_measurements');
    localStorage.removeItem('symmetry_challenges');
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddProgressPhoto = (photo: ProgressPhoto) => {
    setProgressPhotos((prev) => [photo, ...prev]);
  };

  const handleDeleteProgressPhoto = (id: string) => {
    setProgressPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddMeasurement = (m: Omit<BodyMeasurement, 'id'> | BodyMeasurement) => {
    const newMeasure: BodyMeasurement = {
      ...m,
      id: 'id' in m ? m.id : `m-${Date.now()}`,
    };
    setMeasurements((prev) => [...prev, newMeasure]);
  };

  const handleAddWeightEntry = (w: Omit<WeightEntry, 'id'> | WeightEntry) => {
    const newEntry: WeightEntry = {
      ...w,
      id: 'id' in w ? w.id : `w-${Date.now()}`,
    };
    setWeightEntries((prev) => [...prev, newEntry]);
  };

  const handleStartRoutineFromHome = (routine: GymRoutine) => {
    setRoutineToStartImmediately(routine);
    setCurrentTab('workout');
  };

  const handleToggleJoinChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, joined: !ch.joined } : ch))
    );
  };

  const handleClaimChallengeReward = (id: string) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          setUserProfile((p) => ({
            ...p,
            totalXp: (p.totalXp ?? 0) + ch.xpReward,
          }));
          return { ...ch, completed: true };
        }
        return ch;
      })
    );
  };

  // If not logged in, show Auth / Login View
  if (!isLoggedIn) {
    return (
      <AuthView
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e6edf3] flex flex-col font-sans selection:bg-[#b6f047] selection:text-black">
      {/* Top Navigation */}
      <Navbar
        streakDays={streakDays}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
        userProfile={userProfile}
        onNavigateToProfile={() => setCurrentTab('profile')}
      />

      {/* Main Content Body: 5 Main Sections */}
      <main className="flex-1 w-full max-w-4xl mx-auto pt-3 px-2 sm:px-4">
        {/* APARTADO 1: PERFIL */}
        {currentTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            progressPhotos={progressPhotos}
            onAddProgressPhoto={handleAddProgressPhoto}
            onDeleteProgressPhoto={handleDeleteProgressPhoto}
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            weightHistory={weightEntries}
            onAddWeightEntry={handleAddWeightEntry}
            personalRecords={personalRecords}
            onUpdatePersonalRecords={setPersonalRecords}
            onResetAllData={handleResetAllData}
            currentLanguage={language}
            onSelectLanguage={handleSelectLanguage}
            onLogout={handleLogout}
          />
        )}

        {/* APARTADO 2: MENÚ PRINCIPAL */}
        {currentTab === 'home' && (
          <HomeView
            userProfile={userProfile}
            activities={activities}
            streakDays={streakDays}
            foodCaloriesConsumedToday={0}
            waterMl={waterMl}
            weeklyPlan={weeklyPlan}
            onUpdateWeeklyPlan={setWeeklyPlan}
            routines={routines}
            onNavigate={setCurrentTab}
            onSelectSport={() => setCurrentTab('workout')}
            onStartRoutine={handleStartRoutineFromHome}
            onOpenGymTools={() => setIsGymToolsModalOpen(true)}
            onOpenAIRoutineModal={() => setIsAIRoutineModalOpen(true)}
            onAddWater={(ml) => setWaterMl((w) => w + ml)}
            onAddWeightQuick={(kg) => {
              setUserProfile((p) => ({ ...p, weightKg: kg }));
              handleAddWeightEntry({
                id: `w-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                weightKg: kg,
              });
            }}
            currentLanguage={language}
          />
        )}

        {/* APARTADO 3: ENTRENAMIENTO (GYM & MÁS DEPORTES) */}
        {currentTab === 'workout' && (
          <GymView
            userProfile={userProfile}
            onSaveGymWorkout={handleSaveActivity}
            currentLanguage={language}
            initialRoutineToStart={routineToStartImmediately}
            routinesList={routines}
            onUpdateRoutines={setRoutines}
          />
        )}

        {/* APARTADO 4: COACH INTELIGENCIA ARTIFICIAL */}
        {currentTab === 'coach' && (
          <CoachView
            userProfile={userProfile}
            currentLanguage={language}
          />
        )}

        {/* APARTADO 5: PROGRESO */}
        {currentTab === 'progress' && (
          <StatsView
            activities={activities}
            goals={goals}
            achievements={achievements}
            userProfile={userProfile}
            weightEntries={weightEntries}
            measurements={measurements}
            challenges={challenges}
            leaderboard={leaderboard}
            personalRecords={personalRecords}
            onUpdatePersonalRecords={setPersonalRecords}
            progressPhotos={progressPhotos}
            onAddProgressPhoto={handleAddProgressPhoto}
            onSaveActivity={handleSaveActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddWeightEntry={handleAddWeightEntry}
            onAddMeasurement={handleAddMeasurement}
            onUpdateProfileWeight={(w) => setUserProfile((p) => ({ ...p, weightKg: w }))}
            onToggleJoinChallenge={handleToggleJoinChallenge}
            onClaimReward={handleClaimChallengeReward}
            onOpenExportModal={() => setIsDataExportModalOpen(true)}
            onResetAllData={handleResetAllData}
            currentLanguage={language}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation with 5 Sections */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setRoutineToStartImmediately(null);
          setCurrentTab(tab);
        }}
        currentLanguage={language}
      />

      {/* Global Modals */}
      <GymToolsModal
        isOpen={isGymToolsModalOpen}
        onClose={() => setIsGymToolsModalOpen(false)}
      />

      <AIRoutineGeneratorModal
        isOpen={isAIRoutineModalOpen}
        onClose={() => setIsAIRoutineModalOpen(false)}
        userProfile={userProfile}
        onApplyRoutine={(routine) => {
          setIsAIRoutineModalOpen(false);
          setCurrentTab('workout');
        }}
      />

      <DataExportModal
        isOpen={isDataExportModalOpen}
        onClose={() => setIsDataExportModalOpen(false)}
        activities={activities}
        foodItems={INITIAL_FOOD_ITEMS}
        weightEntries={weightEntries}
        userProfile={userProfile}
        onResetData={() => {
          localStorage.clear();
          window.location.reload();
        }}
      />
    </div>
  );
}
