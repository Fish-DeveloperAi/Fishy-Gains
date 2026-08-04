// context/LanguageContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACK_LANGUAGE = 'en';

// Locale used for date/number formatting per language.
const LOCALES = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-EG',
};

// 1. Define your translations
const translations = {
  en: {
    // Shared / Navigation
    cancel: "Cancel",
    delete: "Delete",
    done: "Done",
    create: "Create",
    finish: "Finish",
    save: "Save",
    add: "Add",
    all: "All",
    optional: "Optional",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{{count}} days ago",
    min: "min",

    // HomeScreen
    welcomeBack: "Welcome back",
    thisWeek: "This Week",
    totalWorkouts: "Total Workouts",
    totalVolume: "Total Volume",
    weeklyActivity: "Weekly Activity",
    recentPrs: "Recent PRs",
    startWorkout: "Start Workout",
    recentWorkouts: "Recent Workouts",
    noWorkoutsLogged: "No workouts logged yet.",
    startRoutineToSee: "Start a routine to see it here.",
    day: "Day",
    days: "Days",

    // Ocean Rank card
    oceanRank: "Ocean Rank",
    total: "Total",
    current: "Current",
    next: "Next",
    maxRankAchieved: "Max Rank Achieved!",
    squat: "Squat",
    bench: "Bench",
    deadlift: "Deadlift",
    shrimp: "Shrimp",
    sardine: "Sardine",
    mackerel: "Mackerel",
    tuna: "Tuna",
    dolphin: "Dolphin",
    orca: "Orca",
    spermWhale: "Sperm Whale",

    // RoutinesScreen & StartRoutineScreen
    createNewRoutine: "Create New Routine",
    noRoutinesYet: "No routines yet",
    createOneToStart: "Create one to start logging fast.",
    deleteRoutine: "Delete Routine",
    deleteRoutineWarning: "This cannot be undone.",
    newRoutine: "New Routine",
    egPushDay: "e.g. Push Day",
    routineNotFound: "Routine not found",
    exerciseOrder: "EXERCISE ORDER",
    routineNoExercises: "This routine has no exercises yet.",
    editRoutine: "Edit Routine",
    exercise: "exercise",

    // EditRoutineScreen & ExercisePickerScreen
    exercises: "EXERCISES",
    exercisesCount: "Exercises",
    noExercisesAdded: "No exercises added yet",
    addExercise: "Add Exercise",
    searchExercises: "Search exercises...",
    noExercisesFound: "No exercises found",
    addCustomExercise: "Add Custom Exercise",

    // AddExerciseScreen
    nameRequired: "Name Required",
    enterExerciseName: "Please enter an exercise name.",
    exerciseName: "EXERCISE NAME",
    egCableLateralRaise: "e.g. Cable Lateral Raise",
    muscleGroup: "MUSCLE GROUP",
    equipment: "EQUIPMENT",
    saveExercise: "Save Exercise",

    // LogWorkoutScreen
    freestyleWorkout: "Freestyle Workout",
    invalidWeight: "Invalid Weight",
    invalidWeightMsg: "Please enter a valid weight.",
    invalidReps: "Invalid Reps",
    invalidRepsMsg: "Please enter a valid number of reps.",
    finishWorkoutPrompt: "Are you ready to finish this workout?",
    keepGoing: "Keep Going",
    noExercisesYet: "No exercises yet",
    addExerciseToStart: "Add an exercise to start logging sets.",
    target: "Target",
    restTimer: "REST TIMER",
    rest: "Rest",
    skip: "Skip",
    set: "SET",
    previous: "PREVIOUS",
    weightKg: "WEIGHT (KG)",
    weight: "WEIGHT",
    reps: "REPS",
    nextExercise: "Next Exercise",
    finishWorkout: "Finish Workout",

    // FinishWorkoutScreen & WorkoutSummaryScreen
    workoutComplete: "Workout Complete!",
    workoutSummary: "Workout Summary",
    loadingSummary: "Loading summary…",
    loadingDetails: "Loading workout details...",
    duration: "Duration",
    volumeKg: "Volume (kg)",
    volume: "Volume",
    sets: "Sets",
    estCalories: "Est. Calories",
    prs: "PRs",
    pr: "PR",
    notes: "NOTES",
    notesPlaceholder: "How did it feel? Anything to remember for next time...",
    exercisesPerformed: "EXERCISES PERFORMED",
    shareWorkout: "Share Workout Card",
    preparing: "Preparing...",
    shareFailed: "Share Failed",
    shareFailedMsg: "Could not generate the shareable image.",
    shareUnavailable: "Sharing Unavailable",
    shareUnavailableMsg: "Sharing is not available on this device.",
    shareYourWorkout: "Share Your Workout",
    personalRecord: "Personal Record",
    personalRecords: "Personal Records",
    crushed: "Crushed",
    trackYourGains: "Track your gains with Fishy Gains",

    // ExerciseHistoryScreen
    progress: "Progress",
    personalBest: "PERSONAL BEST",
    noHistory: "No history for this exercise yet",

    // ThemePickerScreen & SettingsScreen
    appearance: "Appearance",
    pickTheme: "Pick the theme that fits your vibe",
    settings: "Settings",
    preferences: "PREFERENCES",
    language: "LANGUAGE",
    selectTheme: "Select a theme",

    // AchievementsScreen
    unlocked: "Unlocked",
    keepTrainingToUnlock: "Keep training to unlock this.",
    trophyCase: "Trophy Case",
    achievementUnlocked: "Achievement Unlocked!",
    awesome: "Awesome",

    // BodyLogScreen
    enterValue: "Enter a Value",
    enterWeightOrFat: "Please enter a weight or body fat percentage.",
    invalidBodyFat: "Invalid Body Fat",
    invalidBodyFatMsg: "Please enter a valid percentage between 0 and 100.",
    currentWeight: "CURRENT WEIGHT",
    bodyFatLabel: "BODY FAT",
    logEntry: "Log Entry",
    history: "HISTORY",
    noEntriesYet: "No entries yet",
    chest: "Chest",
    waist: "Waist",
    arms: "Arms",
    newBodyLog: "New Body Log",
    chestCm: "CHEST (CM)",
    waistCm: "WAIST (CM)",
    armsCm: "ARMS (CM)",
    bodyFatPercent: "BODY FAT %",
    egWeightValue: "e.g. 75",

    // App Navigation & Errors
    somethingWentWrong: "Something went wrong",
    failedToInitDb: "Failed to initialize database",
    routinesTitle: "Routines",
    routinePreview: "Routine Preview",
    newExerciseTitle: "New Exercise",
    workoutTitle: "Workout",
    bodyTracking: "Body Tracking",
    exerciseHistoryTitle: "Exercise History",

    // DB / General Mappings (Categories, Muscles, Ranks)
    unknownExercise: "Unknown Exercise",
    unknown: "Unknown",
    other: "Other",
    none: "None",
    strength: "Strength",
    unranked: "Unranked",
    plankton: "Plankton",
    shark: "Shark",
    leviathan: "Leviathan",
    core: "Core",
    back: "Back",
    shoulders: "Shoulders",
    legs: "Legs",
    cardio: "Cardio",
    fullBody: "Full Body",
    barbell: "Barbell",
    dumbbell: "Dumbbell",
    machine: "Machine",
    cable: "Cable",
    bodyweight: "Bodyweight",

    // Achievements (title / description per achievement id)
    first_splash_title: "First Splash",
    first_splash_desc: "Complete your first workout.",
    hooked_title: "Hooked",
    hooked_desc: "Complete 10 workouts.",
    school_of_fish_title: "School of Fish",
    school_of_fish_desc: "Complete 50 workouts.",
    ocean_veteran_title: "Ocean Veteran",
    ocean_veteran_desc: "Complete 100 workouts.",
    unstoppable_current_title: "Unstoppable Current",
    unstoppable_current_desc: "Maintain a 7-day workout streak.",
    tidal_force_title: "Tidal Force",
    tidal_force_desc: "Maintain a 30-day workout streak.",
    consistency_pays_title: "Consistency Pays",
    consistency_pays_desc: "Complete at least one workout for 8 consecutive weeks.",
    dawn_surfer_title: "Dawn Surfer",
    dawn_surfer_desc: "Complete a workout before 6:00 AM.",
    heavy_catch_title: "Heavy Catch",
    heavy_catch_desc: "Lift 10,000 kg in a single workout.",
    volume_monster_title: "Volume Monster",
    volume_monster_desc: "Lift 1,000,000 kg across all workouts.",
    century_club_title: "Century Club",
    century_club_desc: "Complete 1,000 total sets.",
    deep_sea_diver_title: "Deep Sea Diver",
    deep_sea_diver_desc: "Complete a single workout lasting over 2 hours.",
    kraken_grip_title: "Kraken Grip",
    kraken_grip_desc: "Deadlift 200 kg.",
    steel_fins_title: "Steel Fins",
    steel_fins_desc: "Squat 180 kg.",
    chest_of_the_sea_title: "Chest of the Sea",
    chest_of_the_sea_desc: "Bench Press 100 kg.",
    trident_master_title: "Trident Master",
    trident_master_desc: "Log a Squat, Bench Press, and Deadlift in a single workout.",
    apex_predator_title: "Apex Predator",
    apex_predator_desc: "Reach Shark Rank.",
    leviathan_title: "Leviathan",
    leviathan_desc: "Reach the legendary Leviathan Rank.",
  },

  fr: {
    cancel: "Annuler",
    delete: "Supprimer",
    done: "Terminé",
    create: "Créer",
    finish: "Terminer",
    save: "Enregistrer",
    add: "Ajouter",
    all: "Tous",
    optional: "Optionnel",
    today: "Aujourd'hui",
    yesterday: "Hier",
    daysAgo: "il y a {{count}} jours",
    min: "min",

    welcomeBack: "De retour",
    thisWeek: "Cette semaine",
    totalWorkouts: "Total Entraînements",
    totalVolume: "Volume Total",
    weeklyActivity: "Activité Hebdo",
    recentPrs: "RP Récents",
    startWorkout: "Démarrer",
    recentWorkouts: "Entraînements Récents",
    noWorkoutsLogged: "Aucun entraînement enregistré.",
    startRoutineToSee: "Démarrez un programme pour le voir ici.",
    day: "Jour",
    days: "Jours",

    oceanRank: "Rang Océanique",
    total: "Total",
    current: "Actuel",
    next: "Suivant",
    maxRankAchieved: "Rang maximal atteint !",
    squat: "Squat",
    bench: "Développé couché",
    deadlift: "Soulevé de terre",
    shrimp: "Crevette",
    sardine: "Sardine",
    mackerel: "Maquereau",
    tuna: "Thon",
    dolphin: "Dauphin",
    orca: "Orque",
    spermWhale: "Cachalot",

    createNewRoutine: "Créer un programme",
    noRoutinesYet: "Aucun programme",
    createOneToStart: "Créez-en un pour commencer.",
    deleteRoutine: "Supprimer le programme",
    deleteRoutineWarning: "Cette action est irréversible.",
    newRoutine: "Nouveau Programme",
    egPushDay: "ex. Push Day",
    routineNotFound: "Programme introuvable",
    exerciseOrder: "ORDRE DES EXERCICES",
    routineNoExercises: "Ce programme n'a aucun exercice.",
    editRoutine: "Modifier",
    exercise: "exercice",

    exercises: "EXERCICES",
    exercisesCount: "Exercices",
    noExercisesAdded: "Aucun exercice ajouté",
    addExercise: "Ajouter un exercice",
    searchExercises: "Rechercher...",
    noExercisesFound: "Aucun exercice trouvé",
    addCustomExercise: "Exercice personnalisé",

    nameRequired: "Nom requis",
    enterExerciseName: "Veuillez entrer un nom d'exercice.",
    exerciseName: "NOM DE L'EXERCICE",
    egCableLateralRaise: "ex. Élévation latérale à la poulie",
    muscleGroup: "GROUPE MUSCULAIRE",
    equipment: "ÉQUIPEMENT",
    saveExercise: "Enregistrer l'exercice",

    freestyleWorkout: "Entraînement Libre",
    invalidWeight: "Poids invalide",
    invalidWeightMsg: "Veuillez entrer un poids valide.",
    invalidReps: "Répétitions invalides",
    invalidRepsMsg: "Veuillez entrer un nombre valide.",
    finishWorkoutPrompt: "Êtes-vous prêt à terminer ?",
    keepGoing: "Continuer",
    noExercisesYet: "Aucun exercice",
    addExerciseToStart: "Ajoutez un exercice pour commencer.",
    target: "Objectif",
    restTimer: "REPOS",
    rest: "Repos",
    skip: "Passer",
    set: "SÉRIE",
    previous: "PRÉCÉDENT",
    weightKg: "POIDS (KG)",
    weight: "POIDS",
    reps: "RÉPS",
    nextExercise: "Exercice Suivant",
    finishWorkout: "Terminer",

    workoutComplete: "Entraînement Terminé !",
    workoutSummary: "Résumé",
    loadingSummary: "Chargement…",
    loadingDetails: "Chargement des détails...",
    duration: "Durée",
    volumeKg: "Volume (kg)",
    volume: "Volume",
    sets: "Séries",
    estCalories: "Calories est.",
    prs: "RP",
    pr: "RP",
    notes: "NOTES",
    notesPlaceholder: "Comment c'était ? Un truc à retenir...",
    exercisesPerformed: "EXERCICES EFFECTUÉS",
    shareWorkout: "Partager",
    preparing: "Préparation...",
    shareFailed: "Échec du partage",
    shareFailedMsg: "Impossible de générer l'image.",
    shareUnavailable: "Partage indisponible",
    shareUnavailableMsg: "Le partage n'est pas disponible.",
    shareYourWorkout: "Partagez votre entraînement",
    personalRecord: "Record Personnel",
    personalRecords: "Records Personnels",
    crushed: "Battus",
    trackYourGains: "Suivez vos progrès avec Fishy Gains",

    progress: "Progression",
    personalBest: "RECORD PERSONNEL",
    noHistory: "Aucun historique",

    appearance: "Apparence",
    pickTheme: "Choisis le thème de ton choix",
    settings: "Paramètres",
    preferences: "PRÉFÉRENCES",
    language: "LANGUE",
    selectTheme: "Choisir un thème",

    unlocked: "Débloqué",
    keepTrainingToUnlock: "Continuez à vous entraîner pour débloquer ceci.",
    trophyCase: "Vitrine de trophées",
    achievementUnlocked: "Succès débloqué !",
    awesome: "Génial",

    enterValue: "Entrez une valeur",
    enterWeightOrFat: "Veuillez entrer un poids ou un pourcentage de graisse corporelle.",
    invalidBodyFat: "Graisse corporelle invalide",
    invalidBodyFatMsg: "Veuillez entrer un pourcentage valide entre 0 et 100.",
    currentWeight: "POIDS ACTUEL",
    bodyFatLabel: "GRAISSE CORPORELLE",
    logEntry: "Ajouter une entrée",
    history: "HISTORIQUE",
    noEntriesYet: "Aucune entrée pour le moment",
    chest: "Poitrine",
    waist: "Taille",
    arms: "Bras",
    newBodyLog: "Nouvelle entrée corporelle",
    chestCm: "POITRINE (CM)",
    waistCm: "TAILLE (CM)",
    armsCm: "BRAS (CM)",
    bodyFatPercent: "% GRAISSE CORPORELLE",
    egWeightValue: "ex. 75",

    somethingWentWrong: "Quelque chose s'est mal passé",
    failedToInitDb: "Échec de l'initialisation de la base de données",
    routinesTitle: "Programmes",
    routinePreview: "Aperçu du programme",
    newExerciseTitle: "Nouvel exercice",
    workoutTitle: "Entraînement",
    bodyTracking: "Suivi corporel",
    exerciseHistoryTitle: "Historique de l'exercice",

    unknownExercise: "Exercice inconnu",
    unknown: "Inconnu",
    other: "Autre",
    none: "Aucun",
    strength: "Force",
    unranked: "Non classé",
    plankton: "Plancton",
    shark: "Requin",
    leviathan: "Léviathan",
    core: "Ceinture abdominale",
    back: "Dos",
    shoulders: "Épaules",
    legs: "Jambes",
    cardio: "Cardio",
    fullBody: "Corps entier",
    barbell: "Barre",
    dumbbell: "Haltère",
    machine: "Machine",
    cable: "Poulie",
    bodyweight: "Poids du corps",

    first_splash_title: "Premier Plongeon",
    first_splash_desc: "Terminez votre premier entraînement.",
    hooked_title: "Accroché",
    hooked_desc: "Terminez 10 entraînements.",
    school_of_fish_title: "Banc de Poissons",
    school_of_fish_desc: "Terminez 50 entraînements.",
    ocean_veteran_title: "Vétéran des Océans",
    ocean_veteran_desc: "Terminez 100 entraînements.",
    unstoppable_current_title: "Courant Irrésistible",
    unstoppable_current_desc: "Maintenez une série de 7 jours d'entraînement.",
    tidal_force_title: "Force des Marées",
    tidal_force_desc: "Maintenez une série de 30 jours d'entraînement.",
    consistency_pays_title: "La Régularité Paie",
    consistency_pays_desc: "Faites au moins un entraînement pendant 8 semaines consécutives.",
    dawn_surfer_title: "Surfeur de l'Aube",
    dawn_surfer_desc: "Terminez un entraînement avant 6h00.",
    heavy_catch_title: "Grosse Prise",
    heavy_catch_desc: "Soulevez 10 000 kg en un seul entraînement.",
    volume_monster_title: "Monstre de Volume",
    volume_monster_desc: "Soulevez 1 000 000 kg au total.",
    century_club_title: "Club des Cent",
    century_club_desc: "Réalisez 1 000 séries au total.",
    deep_sea_diver_title: "Plongeur des Abysses",
    deep_sea_diver_desc: "Réalisez un entraînement de plus de 2 heures.",
    kraken_grip_title: "Poigne du Kraken",
    kraken_grip_desc: "Soulevé de terre à 200 kg.",
    steel_fins_title: "Nageoires d'Acier",
    steel_fins_desc: "Squat à 180 kg.",
    chest_of_the_sea_title: "Coffre des Mers",
    chest_of_the_sea_desc: "Développé couché à 100 kg.",
    trident_master_title: "Maître du Trident",
    trident_master_desc: "Enregistrez un squat, un développé couché et un soulevé de terre dans le même entraînement.",
    apex_predator_title: "Prédateur Suprême",
    apex_predator_desc: "Atteignez le rang Requin.",
    leviathan_title: "Léviathan",
    leviathan_desc: "Atteignez le rang légendaire Léviathan.",
  },

  ar: {
    cancel: "إلغاء",
    delete: "حذف",
    done: "تم",
    create: "إنشاء",
    finish: "إنهاء",
    save: "حفظ",
    add: "إضافة",
    all: "الكل",
    optional: "اختياري",
    today: "اليوم",
    yesterday: "أمس",
    daysAgo: "قبل {{count}} أيام",
    min: "دقيقة",

    welcomeBack: "مرحباً بعودتك",
    thisWeek: "هذا الأسبوع",
    totalWorkouts: "إجمالي التدريبات",
    totalVolume: "إجمالي الحجم",
    weeklyActivity: "النشاط الأسبوعي",
    recentPrs: "الأرقام الشخصية الأخيرة",
    startWorkout: "بدء التدريب",
    recentWorkouts: "التدريبات الأخيرة",
    noWorkoutsLogged: "لم يتم تسجيل أي تدريبات بعد.",
    startRoutineToSee: "ابدأ روتيناً لرؤيته هنا.",
    day: "يوم",
    days: "أيام",

    oceanRank: "رتبة المحيط",
    total: "المجموع",
    current: "الحالي",
    next: "التالي",
    maxRankAchieved: "تم بلوغ أعلى رتبة!",
    squat: "سكوات",
    bench: "بنش برس",
    deadlift: "ديدليفت",
    shrimp: "روبيان",
    sardine: "سردين",
    mackerel: "ماكريل",
    tuna: "تونة",
    dolphin: "دلفين",
    orca: "أوركا",
    spermWhale: "حوت العنبر",

    createNewRoutine: "إنشاء روتين جديد",
    noRoutinesYet: "لا توجد روتينات بعد",
    createOneToStart: "قم بإنشاء واحد للبدء.",
    deleteRoutine: "حذف الروتين",
    deleteRoutineWarning: "لا يمكن التراجع عن هذا الإجراء.",
    newRoutine: "روتين جديد",
    egPushDay: "مثال: يوم الدفع",
    routineNotFound: "الروتين غير موجود",
    exerciseOrder: "ترتيب التمارين",
    routineNoExercises: "هذا الروتين لا يحتوي على تمارين بعد.",
    editRoutine: "تعديل الروتين",
    exercise: "تمرين",

    exercises: "التمارين",
    exercisesCount: "تمارين",
    noExercisesAdded: "لم تتم إضافة أي تمارين",
    addExercise: "إضافة تمرين",
    searchExercises: "البحث عن تمارين...",
    noExercisesFound: "لم يتم العثور على تمارين",
    addCustomExercise: "إضافة تمرين مخصص",

    nameRequired: "الاسم مطلوب",
    enterExerciseName: "الرجاء إدخال اسم التمرين.",
    exerciseName: "اسم التمرين",
    egCableLateralRaise: "مثال: رفرفة جانبية بالكابل",
    muscleGroup: "المجموعة العضلية",
    equipment: "المعدات",
    saveExercise: "حفظ التمرين",

    freestyleWorkout: "تدريب حر",
    invalidWeight: "وزن غير صالح",
    invalidWeightMsg: "الرجاء إدخال وزن صالح.",
    invalidReps: "تكرارات غير صالحة",
    invalidRepsMsg: "الرجاء إدخال عدد تكرارات صالح.",
    finishWorkoutPrompt: "هل أنت مستعد لإنهاء هذا التدريب؟",
    keepGoing: "المتابعة",
    noExercisesYet: "لا توجد تمارين بعد",
    addExerciseToStart: "أضف تمريناً لبدء تسجيل المجموعات.",
    target: "الهدف",
    restTimer: "مؤقت الراحة",
    rest: "راحة",
    skip: "تخطي",
    set: "المجموعة",
    previous: "السابق",
    weightKg: "الوزن (كجم)",
    weight: "الوزن",
    reps: "التكرارات",
    nextExercise: "التمرين التالي",
    finishWorkout: "إنهاء التدريب",

    workoutComplete: "اكتمل التدريب!",
    workoutSummary: "ملخص التدريب",
    loadingSummary: "جارٍ تحميل الملخص…",
    loadingDetails: "جارٍ تحميل تفاصيل التدريب...",
    duration: "المدة",
    volumeKg: "الحجم (كجم)",
    volume: "الحجم",
    sets: "المجموعات",
    estCalories: "السعرات التقديرية",
    prs: "أرقام شخصية",
    pr: "رقم شخصي",
    notes: "ملاحظات",
    notesPlaceholder: "كيف كان شعورك؟ أي شيء تريد تذكره للمرة القادمة...",
    exercisesPerformed: "التمارين المنفذة",
    shareWorkout: "مشاركة بطاقة التدريب",
    preparing: "جارٍ التحضير...",
    shareFailed: "فشلت المشاركة",
    shareFailedMsg: "تعذر إنشاء الصورة القابلة للمشاركة.",
    shareUnavailable: "المشاركة غير متاحة",
    shareUnavailableMsg: "المشاركة غير متاحة على هذا الجهاز.",
    shareYourWorkout: "شارك تدريبك",
    personalRecord: "رقم شخصي",
    personalRecords: "أرقام شخصية",
    crushed: "تم تحطيمها",
    trackYourGains: "تابع تقدمك مع Fishy Gains",

    progress: "التقدم",
    personalBest: "أفضل رقم شخصي",
    noHistory: "لا يوجد سجل لهذا التمرين بعد",

    appearance: "المظهر",
    pickTheme: "اختر السمة التي تناسب ذوقك",
    settings: "الإعدادات",
    preferences: "التفضيلات",
    language: "اللغة",
    selectTheme: "اختر سمة",

    unlocked: "مفتوح",
    keepTrainingToUnlock: "استمر في التدريب لفتح هذا.",
    trophyCase: "خزانة الكؤوس",
    achievementUnlocked: "تم فتح إنجاز!",
    awesome: "رائع",

    enterValue: "أدخل قيمة",
    enterWeightOrFat: "الرجاء إدخال وزن أو نسبة دهون الجسم.",
    invalidBodyFat: "نسبة دهون غير صالحة",
    invalidBodyFatMsg: "الرجاء إدخال نسبة صحيحة بين 0 و 100.",
    currentWeight: "الوزن الحالي",
    bodyFatLabel: "نسبة الدهون",
    logEntry: "تسجيل قراءة",
    history: "السجل",
    noEntriesYet: "لا توجد إدخالات بعد",
    chest: "الصدر",
    waist: "الخصر",
    arms: "الذراعين",
    newBodyLog: "تسجيل قياسات جديد",
    chestCm: "الصدر (سم)",
    waistCm: "الخصر (سم)",
    armsCm: "الذراعين (سم)",
    bodyFatPercent: "نسبة الدهون %",
    egWeightValue: "مثال: 75",

    somethingWentWrong: "حدث خطأ ما",
    failedToInitDb: "فشل في تهيئة قاعدة البيانات",
    routinesTitle: "الروتينات",
    routinePreview: "معاينة الروتين",
    newExerciseTitle: "تمرين جديد",
    workoutTitle: "التدريب",
    bodyTracking: "تتبع الجسم",
    exerciseHistoryTitle: "سجل التمرين",

    unknownExercise: "تمرين غير معروف",
    unknown: "غير معروف",
    other: "أخرى",
    none: "لا شيء",
    strength: "قوة",
    unranked: "غير مصنف",
    plankton: "عوالق (بلانكتون)",
    shark: "قرش",
    leviathan: "ليفياثان",
    core: "عضلات البطن",
    back: "الظهر",
    shoulders: "الأكتاف",
    legs: "الأرجل",
    cardio: "كارديو",
    fullBody: "الجسم كامل",
    barbell: "بار",
    dumbbell: "دمبل",
    machine: "جهاز",
    cable: "كابل",
    bodyweight: "وزن الجسم",

    first_splash_title: "أول غطسة",
    first_splash_desc: "أكمل أول تدريب لك.",
    hooked_title: "على الخطاف",
    hooked_desc: "أكمل 10 تدريبات.",
    school_of_fish_title: "سرب أسماك",
    school_of_fish_desc: "أكمل 50 تدريباً.",
    ocean_veteran_title: "محارب المحيط",
    ocean_veteran_desc: "أكمل 100 تدريب.",
    unstoppable_current_title: "تيار لا يتوقف",
    unstoppable_current_desc: "حافظ على سلسلة تدريب لمدة 7 أيام.",
    tidal_force_title: "قوة المد",
    tidal_force_desc: "حافظ على سلسلة تدريب لمدة 30 يوماً.",
    consistency_pays_title: "الاستمرارية تؤتي ثمارها",
    consistency_pays_desc: "أكمل تدريباً واحداً على الأقل لمدة 8 أسابيع متتالية.",
    dawn_surfer_title: "راكب أمواج الفجر",
    dawn_surfer_desc: "أكمل تدريباً قبل الساعة 6:00 صباحاً.",
    heavy_catch_title: "صيد ثقيل",
    heavy_catch_desc: "ارفع 10,000 كجم في تدريب واحد.",
    volume_monster_title: "وحش الحجم",
    volume_monster_desc: "ارفع 1,000,000 كجم عبر جميع التدريبات.",
    century_club_title: "نادي المئة",
    century_club_desc: "أكمل 1,000 مجموعة إجمالاً.",
    deep_sea_diver_title: "غواص الأعماق",
    deep_sea_diver_desc: "أكمل تدريباً واحداً يستمر أكثر من ساعتين.",
    kraken_grip_title: "قبضة الكراكن",
    kraken_grip_desc: "ديدليفت 200 كجم.",
    steel_fins_title: "زعانف فولاذية",
    steel_fins_desc: "سكوات 180 كجم.",
    chest_of_the_sea_title: "صندوق البحر",
    chest_of_the_sea_desc: "بنش برس 100 كجم.",
    trident_master_title: "سيد الرمح الثلاثي",
    trident_master_desc: "سجّل سكوات وبنش برس وديدليفت في تدريب واحد.",
    apex_predator_title: "المفترس الأعلى",
    apex_predator_desc: "الوصول إلى رتبة القرش.",
    leviathan_title: "ليفياثان",
    leviathan_desc: "الوصول إلى رتبة ليفياثان الأسطورية.",
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(translations);

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [activeLanguage, setActiveLanguage] = useState(FALLBACK_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  // Load saved language on startup
  useEffect(() => {
    let cancelled = false;
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@language');
        // Guard against a stored language that no longer exists.
        if (!cancelled && savedLang && translations[savedLang]) {
          setActiveLanguage(savedLang);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };
    loadLanguage();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update state and save to storage
  const changeLanguage = useCallback(async (langCode) => {
    if (!translations[langCode]) return;
    setActiveLanguage(langCode);
    try {
      await AsyncStorage.setItem('@language', langCode);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  /**
   * The translation function.
   *
   * t('key')                       -> translated string (falls back to English, then the key)
   * t('key', 'Fallback text')      -> uses the fallback when the key is missing everywhere
   * t('key', { count: 3 })         -> interpolates {{count}} placeholders
   * t('key', 'Fallback', { n: 1 }) -> both
   *
   * It is memoised on `activeLanguage` so that components using `t` in a
   * dependency array (App.js, LogWorkoutScreen, ExerciseHistoryScreen…) only
   * re-run when the language actually changes, instead of on every render.
   */
  const t = useCallback(
    (key, fallbackOrParams, maybeParams) => {
      if (!key) return '';

      let fallback;
      let params = maybeParams;
      if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
      else if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams;

      const dictionary = translations[activeLanguage] || translations[FALLBACK_LANGUAGE];
      let value = dictionary[key];
      if (value === undefined) value = translations[FALLBACK_LANGUAGE][key];
      if (value === undefined) value = fallback !== undefined ? fallback : key;

      if (params) {
        value = String(value).replace(/\{\{\s*(\w+)\s*\}\}/g, (match, token) =>
          params[token] !== undefined ? String(params[token]) : match
        );
      }
      return value;
    },
    [activeLanguage]
  );

  // Lets callers check for a key without triggering the key-name fallback.
  const hasTranslation = useCallback(
    (key) =>
      Boolean(key) &&
      ((translations[activeLanguage] && translations[activeLanguage][key] !== undefined) ||
        translations[FALLBACK_LANGUAGE][key] !== undefined),
    [activeLanguage]
  );

  const locale = LOCALES[activeLanguage] || LOCALES[FALLBACK_LANGUAGE];

  // Memoised so consumers re-render only when the language changes.
  const value = useMemo(
    () => ({ activeLanguage, changeLanguage, t, hasTranslation, locale }),
    [activeLanguage, changeLanguage, t, hasTranslation, locale]
  );

  if (!isReady) return null; // Wait for storage to load

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  // Defensive fallback: a component rendered outside the provider still gets a
  // working `t` instead of crashing with "cannot destructure property 't'".
  if (!context) {
    return {
      activeLanguage: FALLBACK_LANGUAGE,
      changeLanguage: () => {},
      t: (key, fallbackOrParams) =>
        translations[FALLBACK_LANGUAGE][key] ||
        (typeof fallbackOrParams === 'string' ? fallbackOrParams : key),
      hasTranslation: (key) => translations[FALLBACK_LANGUAGE][key] !== undefined,
      locale: LOCALES[FALLBACK_LANGUAGE],
    };
  }
  return context;
};

export default LanguageContext;
