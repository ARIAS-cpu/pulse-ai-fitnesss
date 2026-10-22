export type Language = 'es' | 'ca' | 'en';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    profile: string;
    home: string;
    workout: string;
    coach: string;
    progress: string;
  };
  auth: {
    title: string;
    subtitle: string;
    loginTab: string;
    registerTab: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    goalLabel: string;
    levelLabel: string;
    loginButton: string;
    registerButton: string;
    demoButton: string;
    demoDescription: string;
    selectLanguage: string;
    logout: string;
    welcomeBack: string;
  };
  profile: {
    title: string;
    subtitle: string;
    personalData: string;
    gymData: string;
    photosTab: string;
    measurementsTab: string;
    recordsTab: string;
    calculatorsTab: string;
    age: string;
    height: string;
    currentWeight: string;
    level: string;
    goal: string;
    addPhoto: string;
    photoDate: string;
    photoTag: string;
    front: string;
    side: string;
    back: string;
    addMeasurement: string;
    chest: string;
    waist: string;
    hips: string;
    bicepsL: string;
    bicepsR: string;
    thighL: string;
    thighR: string;
    calves: string;
    neck: string;
    forearm: string;
    personalRecords: string;
    benchPress: string;
    squat: string;
    deadlift: string;
    militaryPress: string;
    pullUps: string;
    dips: string;
    legPress: string;
    editRecords: string;
    saveChanges: string;
    bodyFat: string;
    muscleMass: string;
    newWeightEntry: string;
    saveWeight: string;
    biometrics: string;
    bmi: string;
    ffmi: string;
    bmr: string;
    tdee: string;
    whr: string;
    exportData: string;
  };
  home: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    todayWorkoutTitle: string;
    startWorkoutNow: string;
    restDay: string;
    streakDays: string;
    weeklySchedule: string;
    customizeSchedule: string;
    activeCalories: string;
    weeklyMinutes: string;
    completedSessions: string;
    quickTools: string;
    plateCalculator: string;
    restTimer: string;
    aiRoutine: string;
    waterTracker: string;
    quickWeight: string;
    weeklyChallenge: string;
    xpGained: string;
    hydrationQuickAdd: string;
    viewAllExercises: string;
  };
  workout: {
    title: string;
    subtitle: string;
    gymTab: string;
    exercisesTab: string;
    moreSportsTab: string;
    createRoutine: string;
    myRoutines: string;
    startRoutine: string;
    activeSession: string;
    finishWorkout: string;
    cancelWorkout: string;
    addExercise: string;
    set: string;
    reps: string;
    weight: string;
    rpe: string;
    completed: string;
    restTimerActive: string;
    searchExercise: string;
    allMuscles: string;
    chest: string;
    back: string;
    legs: string;
    shoulders: string;
    arms: string;
    core: string;
    equipment: string;
    startSport: string;
    duration: string;
    distance: string;
    pace: string;
    caloriesBurned: string;
    saveSportActivity: string;
  };
  coach: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    quickQuestions: string[];
    welcomeMessage: string;
    thinking: string;
  };
  progress: {
    title: string;
    subtitle: string;
    overviewTab: string;
    saveProgressTab: string;
    otherSportsTab: string;
    volumeTab: string;
    symmetryTab: string;
    historyTab: string;
    achievementsTab: string;
    totalVolume: string;
    totalWorkouts: string;
    totalCalories: string;
    totalHours: string;
    volumeByMuscle: string;
    symmetryTitle: string;
    symmetryExplanation: string;
    weightProgress: string;
    prsUnlocked: string;
    unlockedBadge: string;
    leaderboard: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    appName: 'PULSE.AI',
    tagline: 'Gym & Fitness Intelligence',
    nav: {
      profile: 'Perfil',
      home: 'Principal',
      workout: 'Entrenar',
      coach: 'Coach IA',
      progress: 'Progreso',
    },
    auth: {
      title: 'Bienvenido a PULSE.AI',
      subtitle: 'La aplicación definitiva de gimnasio, estética y rendimiento atlético',
      loginTab: 'Iniciar Sesión',
      registerTab: 'Crear Cuenta',
      emailLabel: 'Correo Electrónico',
      emailPlaceholder: 'atleta@pulse.ai',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: '••••••••',
      nameLabel: 'Nombre o Alias',
      namePlaceholder: 'Ej. Marc García',
      goalLabel: 'Objetivo de Gym',
      levelLabel: 'Nivel Atlético',
      loginButton: 'Entrar a PULSE.AI',
      registerButton: 'Registrar y Empezar',
      demoButton: '⚡ Entrar como Invitado (Demo Rápido)',
      demoDescription: 'Explora toda la app con datos reales precargados sin registrarte',
      selectLanguage: 'Idioma / Language / Idioma',
      logout: 'Cerrar Sesión',
      welcomeBack: '¡Hola de nuevo!',
    },
    profile: {
      title: 'Perfil de Atleta',
      subtitle: 'Datos personales, composición corporal, fotos y récords de gym',
      personalData: 'Datos Personales',
      gymData: 'Métricas de Gym',
      photosTab: 'Fotos de Progreso',
      measurementsTab: 'Medidas Corporales',
      recordsTab: 'Récords PRs',
      calculatorsTab: 'Calculadoras',
      age: 'Edad',
      height: 'Altura (cm)',
      currentWeight: 'Peso Actual (kg)',
      level: 'Nivel',
      goal: 'Objetivo',
      addPhoto: 'Subir Foto de Progreso',
      photoDate: 'Fecha',
      photoTag: 'Ángulo',
      front: 'Frontal',
      side: 'Perfil',
      back: 'Espalda',
      addMeasurement: 'Registrar Medidas',
      chest: 'Pecho',
      waist: 'Cintura',
      hips: 'Cadera',
      bicepsL: 'Bíceps Izq.',
      bicepsR: 'Bíceps Der.',
      thighL: 'Muslo Izq.',
      thighR: 'Muslo Der.',
      calves: 'Gemelos',
      neck: 'Cuello',
      forearm: 'Antebrazo',
      personalRecords: 'Récords Personales (1RM)',
      benchPress: 'Press de Banca',
      squat: 'Sentadilla con Barra',
      deadlift: 'Peso Muerto',
      militaryPress: 'Press Militar',
      pullUps: 'Dominadas Lastradas',
      dips: 'Fondos Lastrados',
      legPress: 'Prensa de Piernas',
      editRecords: 'Actualizar Récords',
      saveChanges: 'Guardar Cambios',
      bodyFat: '% Grasa Corporal',
      muscleMass: 'Masa Muscular (kg)',
      newWeightEntry: 'Registrar Peso de Hoy',
      saveWeight: 'Guardar Peso',
      biometrics: 'Fórmula & Biometría',
      bmi: 'IMC',
      ffmi: 'FFMI (Masa Libre de Grasa)',
      bmr: 'TMB (Metabolismo Basal)',
      tdee: 'TDEE (Gasto Diario Total)',
      whr: 'Ratio Cintura / Altura',
      exportData: 'Exportar Datos',
    },
    home: {
      greetingMorning: '¡Buenos días, atleta!',
      greetingAfternoon: '¡Buenas tardes, atleta!',
      greetingEvening: '¡Buenas noches, atleta!',
      todayWorkoutTitle: 'Entrenamiento de Hoy',
      startWorkoutNow: 'Empezar Entrenamiento',
      restDay: 'Día de Descanso Activo',
      streakDays: 'días de racha',
      weeklySchedule: 'Plan Semanal de Entrenamientos',
      customizeSchedule: 'Personalizar Días',
      activeCalories: 'Calorías Quemadas',
      weeklyMinutes: 'Minutos Semanales',
      completedSessions: 'Sesiones Hechas',
      quickTools: 'Caja de Herramientas de Gym',
      plateCalculator: 'Calculadora de Discos',
      restTimer: 'Cronómetro de Descanso',
      aiRoutine: 'Generador de Rutinas IA',
      waterTracker: 'Control de Agua',
      quickWeight: 'Anotar Peso',
      weeklyChallenge: 'Desafío Semanal',
      xpGained: 'XP Ganados',
      hydrationQuickAdd: '+250ml Agua',
      viewAllExercises: 'Ver Ejercicios',
    },
    workout: {
      title: 'Zona de Entrenamiento',
      subtitle: 'Gym Pro de alta precisión, biblioteca de técnica y más deportes',
      gymTab: 'Gimnasio Pro',
      exercisesTab: 'Biblioteca Ejercicios',
      moreSportsTab: 'Más Deportes',
      createRoutine: 'Crear Rutina',
      myRoutines: 'Mis Rutinas Guardadas',
      startRoutine: 'Entrenar Esta Rutina',
      activeSession: 'Sesión en Vivo',
      finishWorkout: 'Terminar y Guardar',
      cancelWorkout: 'Cancelar Sesión',
      addExercise: '+ Añadir Ejercicio',
      set: 'Serie',
      reps: 'Reps',
      weight: 'kg',
      rpe: 'RPE (Esfuerzo)',
      completed: 'Hecha',
      restTimerActive: 'Descanso entre series',
      searchExercise: 'Buscar ejercicio o músculo...',
      allMuscles: 'Todos los músculos',
      chest: 'Pecho',
      back: 'Espalda',
      legs: 'Piernas',
      shoulders: 'Hombros',
      arms: 'Brazos',
      core: 'Core & Abdomen',
      equipment: 'Equipamiento',
      startSport: 'Iniciar Deporte',
      duration: 'Duración',
      distance: 'Distancia',
      pace: 'Ritmo',
      caloriesBurned: 'Calorías estimadas',
      saveSportActivity: 'Guardar Deporte',
    },
    coach: {
      title: 'Pulse.AI Coach IA',
      subtitle: 'Entrenador de fuerza, biomecánica, nutrición y recuperación deportiva',
      placeholder: 'Pregúntame cualquier duda sobre el gym, técnicas, nutrición o cargas...',
      send: 'Enviar',
      quickQuestions: [
        '¿Cómo superar un estancamiento en Press Banca?',
        '¿Qué comer 1 hora antes de entrenar fuerza?',
        'Diferencia entre RPE 8 y RIR 2 en sentadillas',
        '¿Cómo organizar un split Push-Pull-Legs?',
      ],
      welcomeMessage: '¡Hola! Soy tu **Coach de Pulse.AI**. Estoy aquí para resolver todas tus dudas sobre técnica, programación de cargas en el gym, nutrición y rendimiento. ¿En qué te puedo ayudar hoy?',
      thinking: 'Analizando con IA de Pulse.AI...',
    },
    progress: {
      title: 'Análisis de Progreso',
      subtitle: 'Evolución de cargas, simetría muscular y registros históricos',
      overviewTab: 'General',
      saveProgressTab: 'Guardar Progreso',
      otherSportsTab: 'Otros Deportes',
      volumeTab: 'Volumen (kg)',
      symmetryTab: 'Simetría Muscular',
      historyTab: 'Historial',
      achievementsTab: 'Logros',
      totalVolume: 'Volumen Acumulado',
      totalWorkouts: 'Entrenamientos',
      totalCalories: 'Calorías Totales',
      totalHours: 'Horas Entrenadas',
      volumeByMuscle: 'Distribución de Volumen por Músculo',
      symmetryTitle: 'Índice de Simetría Corporal',
      symmetryExplanation: 'Mide el equilibrio entre grupos musculares antagonistas para evitar descompensaciones y maximizar la estética.',
      weightProgress: 'Evolución del Peso Corporal',
      prsUnlocked: 'Récords Personales Activos',
      unlockedBadge: '¡Desbloqueado!',
      leaderboard: 'Clasificación de Atletas',
    },
  },
  ca: {
    appName: 'PULSE.AI',
    tagline: 'Gym & Fitness Intelligence',
    nav: {
      profile: 'Perfil',
      home: 'Principal',
      workout: 'Entrenar',
      coach: 'Coach IA',
      progress: 'Progrés',
    },
    auth: {
      title: 'Benvingut a PULSE.AI',
      subtitle: 'L\'aplicació definitiva de gimnàs, estètica i rendiment atlètic',
      loginTab: 'Iniciar Sessió',
      registerTab: 'Crear Compte',
      emailLabel: 'Correu Electrònic',
      emailPlaceholder: 'atleta@pulse.ai',
      passwordLabel: 'Contrasenya',
      passwordPlaceholder: '••••••••',
      nameLabel: 'Nom o Àlies',
      namePlaceholder: 'Ex. Marc García',
      goalLabel: 'Objectiu de Gym',
      levelLabel: 'Nivell Atlètic',
      loginButton: 'Entrar a PULSE.AI',
      registerButton: 'Registrar i Començar',
      demoButton: '⚡ Entrar com a Convidat (Demo Ràpid)',
      demoDescription: 'Explora tota l\'app amb dades reals precarregades sense registrar-te',
      selectLanguage: 'Idioma / Language / Idioma',
      logout: 'Tancar Sessió',
      welcomeBack: 'Hola de nou!',
    },
    profile: {
      title: 'Perfil d\'Atleta',
      subtitle: 'Dades personals, composició corporal, fotos i rècords de gym',
      personalData: 'Dades Personals',
      gymData: 'Mètriques de Gym',
      photosTab: 'Fotos de Progrés',
      measurementsTab: 'Mesures Corporals',
      recordsTab: 'Rècords PRs',
      calculatorsTab: 'Calculadores',
      age: 'Edat',
      height: 'Alçada (cm)',
      currentWeight: 'Pes Actual (kg)',
      level: 'Nivell',
      goal: 'Objectiu',
      addPhoto: 'Pujar Foto de Progrés',
      photoDate: 'Data',
      photoTag: 'Angle',
      front: 'Frontal',
      side: 'Perfil',
      back: 'Espatlla',
      addMeasurement: 'Registrar Mesures',
      chest: 'Pit',
      waist: 'Cintura',
      hips: 'Maluc',
      bicepsL: 'Bíceps Esq.',
      bicepsR: 'Bíceps Dre.',
      thighL: 'Cuixa Esq.',
      thighR: 'Cuixa Dre.',
      calves: 'Bessons',
      neck: 'Coll',
      forearm: 'Avantbraç',
      personalRecords: 'Rècords Personals (1RM)',
      benchPress: 'Press de Banca',
      squat: 'Sentadilla amb Barra',
      deadlift: 'Pes Mort',
      militaryPress: 'Press Militar',
      pullUps: 'Dominades Llastrades',
      dips: 'Fons Llastrats',
      legPress: 'Premsa de Cames',
      editRecords: 'Actualitzar Rècords',
      saveChanges: 'Desar Canvis',
      bodyFat: '% Greix Corporal',
      muscleMass: 'Massa Muscular (kg)',
      newWeightEntry: 'Registrar Pes d\'Avui',
      saveWeight: 'Desar Pes',
      biometrics: 'Fórmula & Biometria',
      bmi: 'IMC',
      ffmi: 'FFMI (Massa Lliure de Greix)',
      bmr: 'TMB (Metabolisme Basal)',
      tdee: 'TDEE (Despesa Diària Total)',
      whr: 'Ràtio Cintura / Alçada',
      exportData: 'Exportar Dades',
    },
    home: {
      greetingMorning: 'Bon dia, atleta!',
      greetingAfternoon: 'Bona tarda, atleta!',
      greetingEvening: 'Bona nit, atleta!',
      todayWorkoutTitle: 'Entrenament d\'Avui',
      startWorkoutNow: 'Començar Entrenament',
      restDay: 'Dia de Descans Actiu',
      streakDays: 'dies de ratxa',
      weeklySchedule: 'Pla Setmanal d\'Entrenaments',
      customizeSchedule: 'Personalitzar Dies',
      activeCalories: 'Calories Cremades',
      weeklyMinutes: 'Minuts Setmanals',
      completedSessions: 'Sessions Fetes',
      quickTools: 'Caixa d\'Eines de Gym',
      plateCalculator: 'Calculadora de Discos',
      restTimer: 'Cronòmetre de Descans',
      aiRoutine: 'Generador de Rutines IA',
      waterTracker: 'Control d\'Aigua',
      quickWeight: 'Anotar Pes',
      weeklyChallenge: 'Repte Setmanal',
      xpGained: 'XP Guanyats',
      hydrationQuickAdd: '+250ml Aigua',
      viewAllExercises: 'Veure Exercicis',
    },
    workout: {
      title: 'Zona d\'Entrenament',
      subtitle: 'Gym Pro d\'alta precisió, biblioteca de tècnica i més esports',
      gymTab: 'Gimnàs Pro',
      exercisesTab: 'Biblioteca Exercicis',
      moreSportsTab: 'Més Esports',
      createRoutine: 'Crear Rutina',
      myRoutines: 'Les Meves Rutines Guardades',
      startRoutine: 'Entrenar Aquesta Rutina',
      activeSession: 'Sessió en Viu',
      finishWorkout: 'Acabar i Desar',
      cancelWorkout: 'Cancel·lar Sessió',
      addExercise: '+ Afegir Exercici',
      set: 'Sèrie',
      reps: 'Reps',
      weight: 'kg',
      rpe: 'RPE (Esforç)',
      completed: 'Feta',
      restTimerActive: 'Descans entre sèries',
      searchExercise: 'Cercar exercici o múscul...',
      allMuscles: 'Tots els músculs',
      chest: 'Pit',
      back: 'Espatlla',
      legs: 'Cames',
      shoulders: 'Espatlles',
      arms: 'Braços',
      core: 'Core & Abdomen',
      equipment: 'Equipament',
      startSport: 'Iniciar Esport',
      duration: 'Durada',
      distance: 'Distància',
      pace: 'Ritme',
      caloriesBurned: 'Calories estimades',
      saveSportActivity: 'Desar Esport',
    },
    coach: {
      title: 'Pulse.AI Coach IA',
      subtitle: 'Entrenador de força, biomecànica, nutrició i recuperació esportiva',
      placeholder: 'Pregunta\'m qualsevol dubte sobre el gym, tècniques, nutrició o càrregues...',
      send: 'Enviar',
      quickQuestions: [
        'Com superar un estancament a Press Banca?',
        'Què menjar 1 hora abans d\'entrenar força?',
        'Diferència entre RPE 8 i RIR 2 a esquats',
        'Com organitzar un split Push-Pull-Legs?',
      ],
      welcomeMessage: 'Hola! Sóc el teu **Coach de Pulse.AI**. Estic aquí per resoldre tots els teus dubtes sobre tècnica, programació de càrregues al gimnàs, nutrició i rendiment. En què et puc ajudar avui?',
      thinking: 'Analitzant amb IA de Pulse.AI...',
    },
    progress: {
      title: 'Anàlisi de Progrés',
      subtitle: 'Evolució de càrregues, simetria muscular i registres històrics',
      overviewTab: 'General',
      saveProgressTab: 'Desar Progrés',
      otherSportsTab: 'Altres Esports',
      volumeTab: 'Volum (kg)',
      symmetryTab: 'Simetria Muscular',
      historyTab: 'Historial',
      achievementsTab: 'Assoliments',
      totalVolume: 'Volum Acumulat',
      totalWorkouts: 'Entrenaments',
      totalCalories: 'Calories Totals',
      totalHours: 'Hores Entrenades',
      volumeByMuscle: 'Distribució de Volum per Múscul',
      symmetryTitle: 'Índex de Simetria Corporal',
      symmetryExplanation: 'Mesura l\'equilibri entre grups musculars antagonistes per evitar descompensacions i maximitzar l\'estètica.',
      weightProgress: 'Evolució del Pes Corporal',
      prsUnlocked: 'Rècords Personals Actius',
      unlockedBadge: 'Desbloquejat!',
      leaderboard: 'Classificació d\'Atletes',
    },
  },
  en: {
    appName: 'PULSE.AI',
    tagline: 'Gym & Fitness Intelligence',
    nav: {
      profile: 'Profile',
      home: 'Home',
      workout: 'Workout',
      coach: 'AI Coach',
      progress: 'Progress',
    },
    auth: {
      title: 'Welcome to PULSE.AI',
      subtitle: 'The premier gym training, physique aesthetics and athletic app',
      loginTab: 'Log In',
      registerTab: 'Sign Up',
      emailLabel: 'Email Address',
      emailPlaceholder: 'athlete@pulse.ai',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      nameLabel: 'Athlete Name or Alias',
      namePlaceholder: 'e.g. Alex Hunter',
      goalLabel: 'Gym Goal',
      levelLabel: 'Athletic Level',
      loginButton: 'Enter PULSE.AI',
      registerButton: 'Sign Up & Start',
      demoButton: '⚡ Fast Guest Access (Instant Demo)',
      demoDescription: 'Explore the full app with preloaded real gym data without signup',
      selectLanguage: 'Language / Idioma',
      logout: 'Log Out',
      welcomeBack: 'Welcome back!',
    },
    profile: {
      title: 'Athlete Profile',
      subtitle: 'Personal details, body composition, physique photos & gym PRs',
      personalData: 'Personal Info',
      gymData: 'Gym Metrics',
      photosTab: 'Progress Photos',
      measurementsTab: 'Body Measurements',
      recordsTab: 'Personal Records (PRs)',
      calculatorsTab: 'Calculators',
      age: 'Age',
      height: 'Height (cm)',
      currentWeight: 'Current Weight (kg)',
      level: 'Level',
      goal: 'Goal',
      addPhoto: 'Upload Progress Photo',
      photoDate: 'Date',
      photoTag: 'Angle',
      front: 'Front',
      side: 'Side',
      back: 'Back',
      addMeasurement: 'Log Measurements',
      chest: 'Chest',
      waist: 'Waist',
      hips: 'Hips',
      bicepsL: 'Left Bicep',
      bicepsR: 'Right Bicep',
      thighL: 'Left Thigh',
      thighR: 'Right Thigh',
      calves: 'Calves',
      neck: 'Neck',
      forearm: 'Forearm',
      personalRecords: 'Personal Records (1RM)',
      benchPress: 'Barbell Bench Press',
      squat: 'Barbell Back Squat',
      deadlift: 'Conventional Deadlift',
      militaryPress: 'Overhead Press',
      pullUps: 'Weighted Pull-ups',
      dips: 'Weighted Dips',
      legPress: 'Leg Press',
      editRecords: 'Update Records',
      saveChanges: 'Save Changes',
      bodyFat: 'Body Fat %',
      muscleMass: 'Muscle Mass (kg)',
      newWeightEntry: 'Log Today\'s Weight',
      saveWeight: 'Save Weight',
      biometrics: 'Formulas & Biometrics',
      bmi: 'BMI',
      ffmi: 'FFMI (Fat-Free Mass Index)',
      bmr: 'BMR (Basal Metabolic Rate)',
      tdee: 'TDEE (Total Daily Energy)',
      whr: 'Waist-to-Height Ratio',
      exportData: 'Export Data',
    },
    home: {
      greetingMorning: 'Good morning, athlete!',
      greetingAfternoon: 'Good afternoon, athlete!',
      greetingEvening: 'Good evening, athlete!',
      todayWorkoutTitle: 'Today\'s Workout',
      startWorkoutNow: 'Start Workout',
      restDay: 'Active Rest Day',
      streakDays: 'day streak',
      weeklySchedule: 'Weekly Training Schedule',
      customizeSchedule: 'Customize Days',
      activeCalories: 'Burned Calories',
      weeklyMinutes: 'Weekly Minutes',
      completedSessions: 'Sessions Done',
      quickTools: 'Gym Toolbox',
      plateCalculator: 'Plate Calculator',
      restTimer: 'Rest Timer',
      aiRoutine: 'AI Routine Generator',
      waterTracker: 'Water Tracker',
      quickWeight: 'Quick Weight Log',
      weeklyChallenge: 'Weekly Challenge',
      xpGained: 'XP Gained',
      hydrationQuickAdd: '+250ml Water',
      viewAllExercises: 'Browse Exercises',
    },
    workout: {
      title: 'Workout Zone',
      subtitle: 'Pro Gym tracking, exercise technique library & outdoor sports',
      gymTab: 'Gym Pro',
      exercisesTab: 'Exercise Library',
      moreSportsTab: 'More Sports',
      createRoutine: 'Create Routine',
      myRoutines: 'My Saved Routines',
      startRoutine: 'Start Routine',
      activeSession: 'Live Session',
      finishWorkout: 'Finish & Save',
      cancelWorkout: 'Cancel Session',
      addExercise: '+ Add Exercise',
      set: 'Set',
      reps: 'Reps',
      weight: 'kg',
      rpe: 'RPE (Effort)',
      completed: 'Done',
      restTimerActive: 'Rest between sets',
      searchExercise: 'Search exercise or muscle...',
      allMuscles: 'All muscles',
      chest: 'Chest',
      back: 'Back',
      legs: 'Legs',
      shoulders: 'Shoulders',
      arms: 'Arms',
      core: 'Core & Abs',
      equipment: 'Equipment',
      startSport: 'Start Sport',
      duration: 'Duration',
      distance: 'Distance',
      pace: 'Pace',
      caloriesBurned: 'Estimated Calories',
      saveSportActivity: 'Save Sport Activity',
    },
    coach: {
      title: 'Pulse.AI Coach',
      subtitle: 'Strength coach, biomechanics, nutrition & athletic recovery advisor',
      placeholder: 'Ask any question about gym lifting, technique, programming or nutrition...',
      send: 'Send',
      quickQuestions: [
        'How to break through a bench press plateau?',
        'What should I eat 1 hour before lifting heavy?',
        'Difference between RPE 8 and RIR 2 on squats?',
        'How should I structure a Push-Pull-Legs split?',
      ],
      welcomeMessage: 'Hello! I am your **Pulse.AI Coach**. I am here to help you with lifting technique, progressive overload programming, nutrition, and recovery. What are we working on today?',
      thinking: 'Analyzing with Pulse.AI...',
    },
    progress: {
      title: 'Progress Analytics',
      subtitle: 'Load progression, muscle symmetry balance and historical records',
      overviewTab: 'Overview',
      saveProgressTab: 'Save Progress',
      otherSportsTab: 'Other Sports',
      volumeTab: 'Volume (kg)',
      symmetryTab: 'Muscle Symmetry',
      historyTab: 'History',
      achievementsTab: 'Achievements',
      totalVolume: 'Total Volume Lifted',
      totalWorkouts: 'Workouts',
      totalCalories: 'Total Calories',
      totalHours: 'Hours Trained',
      volumeByMuscle: 'Volume Distribution by Muscle',
      symmetryTitle: 'Muscular Symmetry Index',
      symmetryExplanation: 'Measures the volume balance across opposing muscle groups to prevent imbalances and maximize aesthetic symmetry.',
      weightProgress: 'Body Weight Progression',
      prsUnlocked: 'Active Personal Records',
      unlockedBadge: 'Unlocked!',
      leaderboard: 'Athletes Leaderboard',
    },
  },
};
