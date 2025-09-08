import { create } from 'zustand'
import { useProfileStore } from './profile.store'

type Language = 'en' | 'ru'

interface I18nState {
  currentLanguage: Language
  
  // Actions
  setLanguage: (lang: Language) => void
  initializeLanguage: () => void
  setLanguageFromProfile: () => void
}

export const useI18nStore = create<I18nState>((set) => ({
  currentLanguage: 'en',

  setLanguage: (lang: Language) => {
    set({ currentLanguage: lang })
    localStorage.setItem('language', lang)
    
    // Update profile language if profile exists
    const profileStore = useProfileStore.getState()
    if (profileStore.profile) {
      profileStore.saveProfile({ language: lang })
    }
  },

  initializeLanguage: () => {
    const saved = localStorage.getItem('language') as Language
    if (saved && ['en', 'ru'].includes(saved)) {
      set({ currentLanguage: saved })
    }
  },

  setLanguageFromProfile: () => {
    const profileStore = useProfileStore.getState()
    if (profileStore.profile?.language) {
      set({ currentLanguage: profileStore.profile.language })
      localStorage.setItem('language', profileStore.profile.language)
    }
  }
}))

// Translations
export const translations = {
  en: {
    // Common
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    delete: 'Delete',
    exportAll: 'Export Data',
    importAll: 'Import Data',
    chooseJson: 'Choose JSON',
    import: 'Import',
    replaceMode: 'Replace All',
    mergeMode: 'Merge',
    exportSuccess: 'Data exported successfully',
    importSuccess: 'Import completed',
    fileTooLarge: 'File too large (max 20MB)',
    invalidFormat: 'Invalid file format',
    preview: 'Preview',
    importMode: 'Import Mode',
    replaceModeDescription: 'Clear all existing data and import from file',
    mergeModeDescription: 'Merge with existing data, keep newer records',
    importing: 'Importing...',
    exportedAt: 'Exported at',
    edit: 'Edit',
    add: 'Add',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    back: 'Back',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    home: 'Home',
    
    // Navigation
    workouts: 'Workouts',
    food: 'Food',
    weekly: 'Weekly',
    settings: 'Settings',
    
    // Header
    header: {
      back: 'Back',
      workouts: 'Workouts',
      food: 'Food',
      week: 'Week',
      settings: 'Settings',
      export: 'Export Data',
      generate: 'Generate Workout',
      generating: 'Generating...'
    },
    
    // Profile
    profile: 'Profile',
    language: 'Language',
    english: 'English',
    russian: 'Русский',
    selectLanguage: 'Select Language',
    selectLanguageDescription: 'Choose your preferred language for the application interface',
    languageSelection: 'Language Selection',
    
    // Onboarding
    onboarding: {
      title: 'Onboarding',
      entry: {
        title: 'Welcome to AI Trainer',
        subtitle: 'Choose how to get started',
        importCardTitle: 'Import Profile (JSON)',
        importCardDescription: 'Restore your data from a backup file',
        startCardTitle: 'Start Onboarding',
        startCardDescription: 'Create a new profile step by step',
        helpText: 'Choose to either import an existing profile or create a new one from scratch.'
      },
      progress: {
        stepOf: 'Step {{current}} of {{total}}'
      },
      steps: {
        0: 'Goals',
        1: 'Constraints',
        2: 'Equipment',
        3: 'Metrics',
        4: 'Frequency',
        5: 'Detailed Goals'
      },
      summary: {
        title: 'Profile Summary',
        subtitle: 'Live preview of your profile data',
        basicInfo: 'Basic Info',
        goals: 'Goals & Fitness',
        preferences: 'Preferences',
        clearDraft: 'Clear draft',
        complete: 'Profile setup complete! You can now save and continue.'
      },
      navigation: {
        back: 'Back',
    next: 'Next',
        save: 'Save & Exit',
        complete: 'Complete Setup'
      },
      goals: {
        title: 'What are your fitness goals?',
        description: 'Tell us about your primary fitness objectives',
        yourName: 'Your Name',
        selectGoals: 'Describe your primary fitness goals',
        additionalDetails: 'Additional Details (Optional)',
        descriptionPlaceholder: 'Tell us more about your specific goals...',
        namePlaceholder: 'Enter your name',
        goalsPlaceholder: 'For example: I want to lose 10 kg, gain muscle mass, improve endurance, become stronger, feel better... Describe in detail what you want to achieve.',
        weightLoss: 'Weight Loss',
        muscleGain: 'Muscle Gain',
        endurance: 'Endurance',
        strength: 'Strength',
        generalFitness: 'General Fitness'
      },
      metrics: {
        title: 'Basic Information',
        description: 'Help us personalize your experience',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        age: 'Age (years)',
        agePlaceholder: 'e.g., 25',
        height: 'Height (cm)',
        heightPlaceholder: 'e.g., 175',
        weight: 'Weight (kg)',
        weightPlaceholder: 'e.g., 70'
      },
      constraints: {
        title: 'Physical Constraints',
        description: 'Tell us about any physical limitations or health conditions',
        label: 'Describe any physical constraints or health conditions you have',
        placeholder: 'For example: back pain, knee problems, diabetes, asthma... Describe in detail so we can take this into account when creating workouts.',
        noProblems: 'I have no health problems or physical limitations',
        noProblemsMessage: 'Great! This means you have more opportunities for various types of workouts.',
        constraintsMessage: 'Thank you for the information! We will take these limitations into account when creating your personal training program.'
      },
      equipment: {
        title: 'Available Equipment',
        description: 'Tell us what fitness equipment you have and what sports you prefer',
        equipmentLabel: 'Describe the sports equipment you have',
        equipmentPlaceholder: 'For example: dumbbells, jump rope, yoga mat, exercise bike, pull-up bar... Describe everything you have.',
        sportsLabel: 'What sports or physical activities do you prefer?',
        sportsPlaceholder: 'For example: running, swimming, yoga, strength training, dancing, cycling, basketball... Tell us about what you like.',
        noEquipment: 'I have no sports equipment',
        noEquipmentMessage: 'No problem! We will focus on bodyweight exercises and minimal equipment workouts.',
        equipmentMessage: 'Great! We will create workouts that make the most of your available equipment.',
        sportsMessage: 'Thank you for the information about preferences! We will take this into account when creating your personal training program.'
      },
      detailedGoals: {
        title: 'Detailed Goals',
        description: 'Tell us more about your specific fitness journey',
        additionalDetails: 'Additional Details (Optional)',
        descriptionText: 'Share any specific goals, events, or motivations that will help us personalize your experience',
        placeholder: 'For example: I want to run a 5K in 3 months, I\'m training for a hiking trip, I want to feel more confident in my body, I\'m preparing for a wedding...',
        examplesTitle: 'Examples of what to include:',
        example1: 'Target weight or body composition goals',
        example2: 'Specific events you\'re training for',
        example3: 'Performance milestones you want to achieve',
        example4: 'How you want to feel or look',
        example5: 'Any specific challenges you\'re facing',
        great: 'Great!',
        successMessage: 'We\'ll use this information to create more personalized workout recommendations and track your progress toward these specific goals.',
        readyToComplete: 'Ready to complete your profile setup!'
      },
      frequency: {
        title: 'Workout Schedule',
        description: 'How often and how long do you want to work out?',
        frequencyLabel: 'How many times per week do you want to work out?',
        durationLabel: 'How long should each workout session be?',
        timesPerWeek: 'times per week',
        timePerWeek: 'time per week',
        minutes: 'minutes',
        summary: 'You\'ll be working out {{frequency}} times per week for {{duration}} minutes per session. This is a great starting point that we can adjust as you progress!'
      }
    },
    
    // Workouts
    workout: 'Workout',
    addWorkout: 'Add Workout',
    editWorkout: 'Edit Workout',
    noWorkoutsFound: 'No workouts found',
    addFirstWorkout: 'Add your first workout',
    viewDetails: 'View Details',
    
    // Exercise types
    run: 'Run',
    pullups: 'Pull-ups',
    pushups: 'Push-ups',
    plank: 'Plank',
    custom: 'Custom',
    
    // Exercise fields
    durationMinutes: 'Duration (minutes)',
    distanceKm: 'Distance (km)',
    sets: 'Sets',
    reps: 'Reps',
    notes: 'Notes',
    repsPerSet: 'Reps per set',
    
    // Units
    minutes: 'minutes',
    km: 'km',
    calories: 'calories',
    
    // AI
    analyzeWithAI: 'Analyze with AI',
    analyzing: 'Analyzing...',
    
    // Common actions
    welcome: 'Welcome to AI Trainer',
    welcomeSubtitle: 'Let\'s set up your fitness profile',
    aiTrainer: 'AI Trainer',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    
    // Weekly
    weeklySummary: 'Weekly Summary',
    
    // Food
    foodLog: 'Food Log',
    addFoodLog: 'Add Food Log',
    
    // Settings
    exportProfile: 'Export Profile',
    importProfile: 'Import Profile',
    
    // HomePage
    homePage: {
      workoutsDescription: 'Отслеживайте тренировки и получайте AI анализ',
      foodDescription: 'Ведите дневник питания и отслеживайте калории',
      weeklyDescription: 'Еженедельные проверки и отслеживание прогресса',
      settingsDescription: 'Управляйте профилем и настройками'
    },
    
    // SettingsPage
    settingsPage: {
      back: '← Back',
      language: 'Language',
      profileInformation: 'Profile Information',
      name: 'Name',
      age: 'Age',
      height: 'Height',
      weight: 'Weight',
      gender: 'Gender',
      goals: 'Goals',
      notSet: 'Not set',
      years: 'years',
      cm: 'cm',
      kg: 'kg',
      onboarding: 'Onboarding',
      onboardingDescription: 'Reset the onboarding process to start over with language selection and profile setup.',
      resetOnboarding: 'Reset Onboarding',
      resetConfirmMessage: 'Are you sure you want to reset onboarding? This will clear your profile and start over.',
      detailedGoals: 'Detailed Goals',
      noGoalsSet: 'No goals set',
      dataManagement: 'Data Management',
      loading: 'Loading...',
      failedToUpdateLanguage: 'Failed to update language',
      editLanguage: 'Edit language',
      editProfile: 'Edit profile',
      editGoals: 'Edit goals',
      nameRequired: 'Name is required',
      ageInvalid: 'Age must be between 10 and 120',
      heightInvalid: 'Height must be between 100 and 250 cm',
      weightInvalid: 'Weight must be between 1 and 500 kg',
      goalRequired: 'Goal is required',
      changesSaved: 'Changes saved successfully',
      failedToSave: 'Failed to save changes',
      male: 'Male',
      female: 'Female',
      mainGoal: 'Main Goal',
      goalPlaceholder: 'Describe your main fitness goal...',
      detailedGoalsPlaceholder: 'Add more details about your fitness goals, timeline, preferences...'
    },
    
    // Plan
    plan: {
      title: 'Plan for Today',
      summary: {
        kcal: 'Total Calories',
        minutes: 'Duration (min)',
        exercises: 'Exercises'
      },
      rpe: 'RPE',
      status: {
        as_planned: 'As Planned',
        skipped: 'Skipped',
        less: 'Less',
        more: 'More',
        edited: 'Edited'
      },
      exerciseComment: 'Exercise Comment',
      workoutComment: 'Workout Comment',
      save: 'Save as Workout',
      cancel: 'Cancel',
      regenerate: 'Generate Another Plan',
      generatePlan: 'Generate Plan',
      noPlanAvailable: 'No plan available',
      planGenerated: 'Plan generated successfully',
      generateModal: {
        title: 'New Workout',
        date: 'Workout Date',
        preferences: 'Preferences',
        preferencesPlaceholder: 'Describe your preferences for this workout...',
        lastWorkout: 'Last Workout',
        cancel: 'Cancel',
        generate: 'Generate',
        generating: 'Generating...'
      },
      analysis: 'Workout Analysis',
      adjust: {
        button: 'Adjust Plan',
        placeholder: 'Specify what needs to be changed...',
        apply: 'Apply Changes'
      }
    },
    
    // Weekly
    weeklyPage: {
      description: 'Weekly check-ins and progress tracking',
      addCheckin: 'Add Check-in',
      previousWeek: 'Previous Week',
      nextWeek: 'Next Week',
      weeklyOverview: 'Weekly Overview',
      workoutsCount: 'Workouts',
      workoutCalories: 'Workout Calories',
      foodCalories: 'Food Calories',
      weeklyBalance: 'Weekly Balance',
      thisWeekCheckin: 'This Week\'s Check-in',
      processing: 'Processing chart data...',
      profile: {
        title: 'Profile Information',
        viewAll: 'View all details',
        edit: 'Edit',
        detailsTitle: 'Profile Details',
        tabs: {
          general: 'General',
          goals: 'Goals & Preferences'
        },
        fields: {
          name: 'Name',
          age: 'Age',
          gender: 'Gender',
          height: 'Height (cm)',
          weight: 'Weight (kg)',
          language: 'Language',
          goalTypes: 'Goal Types',
          targetWeight: 'Target Weight (kg)',
          targetEvent: 'Target Event',
          goalDescription: 'Goal Description',
          goalsDetailed: 'Detailed Goals',
          constraints: 'Constraints',
          equipment: 'Equipment',
          frequency: 'Workouts per week',
          duration: 'Workout duration (min)',
          nameRequired: 'Name is required',
          ageInvalid: 'Age must be between 10 and 100',
          heightInvalid: 'Height must be between 100 and 250 cm',
          weightInvalid: 'Weight must be between 30 and 300 kg',
          frequencyInvalid: 'Frequency must be between 1 and 14',
          durationInvalid: 'Duration must be between 5 and 300 minutes'
        },
        actions: {
          close: 'Close',
          update: 'Update',
          save: 'Save'
        },
        toast: {
          saved: 'Profile updated successfully',
          error: 'Failed to save profile'
        }
      },
      aiEstimate: {
        badge: 'AI',
        calculating: 'AI estimation...',
        recalculate: 'Update estimate',
        estimatedByAI: 'Estimated by AI model',
        alwaysUseAI: 'Always estimate through AI',
        savedWithEstimates: 'Workout saved. Estimates will be added.',
        error: 'Failed to get AI estimate',
        tooltip: 'Estimated by gpt-4o-mini model'
      },
      previousCheckins: 'Previous Check-ins',
      weight: 'Weight',
      waist: 'Waist',
      notes: 'Notes',
      progressPhoto: 'Progress Photo',
      photoAvailable: '📷 Photo available',
      updateCheckin: 'Update Check-in',
      addCheckinModal: 'Add Check-in',
      weightRequired: 'Weight (kg) *',
      waistOptional: 'Waist (cm) - Optional',
      progressPhotoOptional: 'Progress Photo - Optional',
      notesOptional: 'Notes - Optional',
      allowPhotoInAI: 'Allow photo to be used in AI analysis',
      weightPlaceholder: 'e.g., 70.5',
      waistPlaceholder: 'e.g., 80',
      notesPlaceholder: 'How was your week? Any observations?',
      pleaseEnterWeight: 'Please enter your weight',
      failedToSaveCheckin: 'Failed to save checkin',
      workout: 'workout',
      workouts: 'workouts',
      foodLog: 'food log',
      foodLogs: 'food logs',
      // New weekly analytics keys
      activityChart: 'Activity by Day',
      typesChart: 'Exercise Types Distribution',
      noData: 'No workout data for this week',
      totalSessions: 'Total Sessions',
      totalWorkouts: 'Total Workouts',
      balance: 'Balance',
      avgRpe: 'Avg RPE',
      types: {
        run: 'Run',
        pullups: 'Pull-ups',
        pushups: 'Push-ups',
        plank: 'Plank',
        custom: 'Custom'
      },
      prs: {
        title: 'Personal Records',
        longestRun: 'Longest Run',
        fastestPace: 'Fastest Pace',
        maxPullups: 'Max Pull-ups',
        maxPushups: 'Max Push-ups',
        longestPlank: 'Longest Plank',
        noRecords: 'No personal records this week'
      },
      progress: {
        title: 'Exercise Progress',
        noData: 'No exercise data for this week',
        openDetails: 'Click to view chart',
        totalWeek: 'Total for week'
      },
      metrics: {
        distance: 'Distance',
        duration: 'Duration',
        reps: 'Reps',
        sets: 'Sets',
        sessions: 'Sessions',
        holds: 'Holds'
      },
      loading: 'Loading analytics...',
      addWorkout: 'Add some workouts to see your activity chart',
      charts: {
        activity: 'Activity by Day',
        completed: 'Workout Calories',
        planned: 'Planned (AI)',
        duration: 'Duration (min)',
        runKm: 'Distance (km)',
        runMin: 'Duration (min)',
        reps: 'Reps',
        seconds: 'Seconds'
      },
      tooltip: {
        date: 'Date',
        completedKcal: 'Workouts (kcal)',
        plannedKcal: 'Planned (kcal)',
        foodKcal: 'Food (kcal)',
        workouts: 'Workouts',
        minutesTotal: 'Total Minutes',
        workoutsCount: 'Workouts',
        workout: 'Workout Details'
      },
      status: {
        planned: 'Planned',
        completed: 'Completed',
        skipped: 'Skipped'
      }
    },
    
    // JsonFileButtons
    jsonFileButtons: {
      dataExportedSuccessfully: 'Data exported successfully!',
      exportFailed: 'Export failed',
      dataImportedSuccessfully: 'Data imported successfully!',
      importFailed: 'Import failed',
      pleaseSelectValidJsonFile: 'Please select a valid JSON file',
      fileSizeMustBeLessThan10MB: 'File size must be less than 10MB',
      exportAllData: 'Export All Data',
      exporting: 'Exporting...',
      importData: 'Import Data',
      importing: 'Importing...',
      export: 'Export:',
      exportDescription: 'Download all your data as a JSON file for backup.',
      import: 'Import:',
      importDescription: 'Restore your data from a previously exported JSON file.',
      note: 'Note:',
      importNote: 'Importing will replace all existing data. Make sure to backup first.'
    },
    
    // WorkoutsPage
    workoutsPage: {
      trackWorkoutsAndProgress: 'Track your workouts and progress',
      loadingWorkouts: 'Loading workouts...',
      startFitnessJourney: 'Start your fitness journey by adding your first workout'
    },
    
    // WorkoutForm
    workoutForm: {
      formMode: 'Form Mode',
      textMode: 'Text Mode',
      date: 'Date',
      rpe: 'RPE (Rate of Perceived Exertion)',
      easy: 'Easy',
      moderate: 'Moderate',
      hard: 'Hard',
      exercises: 'Exercises',
      addExercise: 'Add Exercise',
      noExercisesAdded: 'No exercises added yet. Click "Add Exercise" to get started.',
      workoutSummary: 'Workout Summary',
      totalCalories: 'Total Calories:',
      duration: 'Duration:',
      totalDuration: 'Total Workout Duration',
      durationMinutes: 'Duration (minutes)',
      exercisesCount: 'Exercises:',
      describeWorkout: 'Describe your workout',
      workoutDescriptionPlaceholder: 'Example: ran 5 km, pull-ups 7-5-3-3-2, push-ups 20-20-15, plank 60-45-50',
      workoutDescriptionHelp: 'Describe your workout in natural language. The AI will parse it into structured exercises.',
      parseAndContinue: 'Parse and Continue',
      parsing: 'Parsing...',
      pleaseAddExercise: 'Please add at least one exercise',
      failedToSave: 'Failed to save workout',
      pleaseEnterDescription: 'Please enter workout description',
      failedToParse: 'Failed to parse workout text. Please use the form mode instead.',
      aiNotConfigured: 'AI is not configured. Please set up your OpenAI API key in Settings.',
      aiParseFailed: 'AI parsing failed. Please try again or use form mode.'
    },
    
    // WorkoutCard
    workoutCard: {
      today: 'Today',
      yesterday: 'Yesterday',
      calories: 'Calories',
      duration: 'Duration',
      exercises: 'Exercises',
      moreExercises: 'more exercises',
      aiReviewed: 'AI Reviewed',
      reps: 'reps',
      min: 'min',
      km: 'km'
    },
    
    // Exercise types
    exerciseTypes: {
      run: 'Run',
      pullups: 'Pull-ups',
      pushups: 'Push-ups',
      plank: 'Plank',
      custom: 'Custom'
    },
    
    // WorkoutDetailsPage
    workoutDetailsPage: {
      workoutNotFound: 'Workout not found',
      backToWorkouts: 'Back to Workouts',
      workoutDetails: 'Workout Details',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      deleteConfirm: 'Are you sure you want to delete this workout?',
      failedToDelete: 'Failed to delete workout',
      totalCalories: 'Total Calories',
      duration: 'Duration (minutes)',
      exercises: 'Exercises',
      aiReviewed: 'AI Reviewed',
      aiAnalysis: 'AI Analysis',
      aiAnalysisDescription: 'This workout has been analyzed by AI. View the full analysis and recommendations in the AI section.',
      noRepsSpecified: 'No reps specified',
      noTimeSpecified: 'No time specified',
      customExercise: 'Custom exercise',
      exerciseDetails: 'Exercise details',
      sets: 'sets',
      total: 'total',
      holds: 'holds',
      minutes: 'minutes',
      for: 'for',
      workoutUpdated: 'Workout updated successfully',
      exerciseUpdated: 'Exercise updated successfully',
      updateFailed: 'Failed to update',
      editWorkout: 'Edit workout',
      editExercise: 'Edit exercise',
      exerciseType: 'Exercise Type',
      distance: 'Distance',
      repsPerSet: 'Reps per set',
      commaSeparated: 'comma separated',
      seconds: 'Seconds',
      exerciseName: 'Exercise Name',
      notes: 'Notes'
    },
    
    // AISettings
    aiSettings: {
      title: 'AI Configuration',
      description: 'Configure your OpenAI API key to enable AI features like workout analysis and recommendations.',
      apiKeyLabel: 'OpenAI API Key',
      apiKeyPlaceholder: 'sk-...',
      saveKey: 'Save Key',
      clearKey: 'Clear Key',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      pleaseEnterKey: 'Please enter an API key',
      keyNotChanged: 'Key was not changed',
      keySaved: 'API key saved successfully',
      keyCleared: 'API key cleared',
      confirmClear: 'Are you sure you want to clear the API key?',
      configureFirst: 'Please configure API key first',
      connectionSuccess: 'Connection successful!',
      connectionFailed: 'Connection failed. Please check your API key.',
      lastTestSuccess: 'Last connection test: Success',
      lastTestFailed: 'Last connection test: Failed',
      configured: 'AI features are enabled',
      notConfigured: 'AI features are disabled - API key required',
      helpTitle: 'How to get an OpenAI API key:',
      helpStep1: 'Visit OpenAI Platform (platform.openai.com)',
      helpStep2: 'Sign up or log in to your account',
      helpStep3: 'Go to API Keys section',
      helpStep4: 'Create a new secret key',
      helpStep5: 'Copy the key and paste it above'
    }
  },
  
  ru: {
    // Common
    save: 'Сохранить',
    saving: 'Сохраняю...',
    cancel: 'Отмена',
    delete: 'Удалить',
    exportAll: 'Выгрузить данные',
    importAll: 'Импорт данных',
    chooseJson: 'Выбрать JSON',
    import: 'Импортировать',
    replaceMode: 'Заменить все',
    mergeMode: 'Объединить',
    exportSuccess: 'Данные успешно выгружены',
    importSuccess: 'Импорт завершён',
    fileTooLarge: 'Файл слишком большой (макс 20МБ)',
    invalidFormat: 'Неверный формат файла',
    preview: 'Предпросмотр',
    importMode: 'Режим импорта',
    replaceModeDescription: 'Очистить все существующие данные и импортировать из файла',
    mergeModeDescription: 'Объединить с существующими данными, сохранить более новые записи',
    importing: 'Импортирую...',
    exportedAt: 'Экспортировано',
    edit: 'Редактировать',
    add: 'Добавить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    back: 'Назад',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    yes: 'Да',
    no: 'Нет',
    home: 'Главная',
    
    // Navigation
    workouts: 'Тренировки',
    food: 'Питание',
    weekly: 'Неделя',
    settings: 'Настройки',
    
    // Header
    header: {
      back: 'Назад',
      workouts: 'Тренировки',
      food: 'Питание',
      week: 'Неделя',
      settings: 'Настройки',
      export: 'Выгрузить данные',
      generate: 'Сгенерировать тренировку',
      generating: 'Генерация…'
    },
    
    // Profile
    profile: 'Профиль',
    language: 'Язык',
    english: 'English',
    russian: 'Русский',
    selectLanguage: 'Выберите язык',
    selectLanguageDescription: 'Выберите предпочитаемый язык для интерфейса приложения',
    languageSelection: 'Выбор языка',
    
    // Onboarding
    onboarding: {
      title: 'Настройка',
      entry: {
        title: 'Добро пожаловать в AI Тренер',
        subtitle: 'Выберите, как начать',
        importCardTitle: 'Импорт профиля (JSON)',
        importCardDescription: 'Восстановите свои данные из резервной копии',
        startCardTitle: 'Начать настройку',
        startCardDescription: 'Создайте новый профиль шаг за шагом',
        helpText: 'Выберите, чтобы импортировать существующий профиль или создать новый с нуля.'
      },
      progress: {
        stepOf: 'Шаг {{current}} из {{total}}'
      },
      steps: {
        0: 'Цели',
        1: 'Ограничения',
        2: 'Оборудование',
        3: 'Метрики',
        4: 'Частота',
        5: 'Детальные цели'
      },
      summary: {
        title: 'Сводка профиля',
        subtitle: 'Живая предпросмотр ваших данных профиля',
        basicInfo: 'Основная информация',
        goals: 'Цели и фитнес',
        preferences: 'Предпочтения',
        clearDraft: 'Очистить черновик',
        complete: 'Настройка профиля завершена! Теперь вы можете сохранить и продолжить.'
      },
      navigation: {
        back: 'Назад',
    next: 'Далее',
        save: 'Сохранить и выйти',
        complete: 'Завершить настройку'
      },
      goals: {
        title: 'Какие у вас фитнес-цели?',
        description: 'Расскажите нам о ваших основных фитнес-целях',
        yourName: 'Ваше имя',
        selectGoals: 'Опишите ваши основные фитнес-цели',
        additionalDetails: 'Дополнительные детали (Необязательно)',
        descriptionPlaceholder: 'Расскажите нам больше о ваших конкретных целях...',
        namePlaceholder: 'Введите ваше имя',
        goalsPlaceholder: 'Например: я хочу потерять 10 кг, набрать мышечную массу, улучшить выносливость, стать сильнее, чувствовать себя лучше... Опишите подробно, чего вы хотите достичь.',
        weightLoss: 'Потеря веса',
        muscleGain: 'Набор мышечной массы',
        endurance: 'Выносливость',
        strength: 'Сила',
        generalFitness: 'Общий фитнес'
      },
      metrics: {
        title: 'Основная информация',
        description: 'Помогите нам персонализировать ваш опыт',
        gender: 'Пол',
        male: 'Мужской',
        female: 'Женский',
        other: 'Другой',
        age: 'Возраст (лет)',
        agePlaceholder: 'например, 25',
        height: 'Рост (см)',
        heightPlaceholder: 'например, 175',
        weight: 'Вес (кг)',
        weightPlaceholder: 'например, 70'
      },
      constraints: {
        title: 'Физические ограничения',
        description: 'Расскажите нам о любых физических ограничениях или состояниях здоровья',
        label: 'Опишите любые физические ограничения или состояния здоровья, которые у вас есть',
        placeholder: 'Например: боль в спине, проблемы с коленями, диабет, астма... Опишите подробно, чтобы мы могли учесть это при создании тренировок.',
        noProblems: 'У меня нет проблем со здоровьем или физических ограничений',
        noProblemsMessage: 'Отлично! Это означает, что у вас больше возможностей для различных типов тренировок.',
        constraintsMessage: 'Спасибо за информацию! Мы учтем эти ограничения при создании вашей персональной тренировочной программы.'
      },
      equipment: {
        title: 'Доступное оборудование',
        description: 'Расскажите нам, какое фитнес-оборудование у вас есть и какие виды спорта вам нравятся',
        equipmentLabel: 'Опишите спортивное оборудование, которое у вас есть',
        equipmentPlaceholder: 'Например: гантели, скакалка, коврик для йоги, велосипед, подтягивающаяся перекладина... Опишите все, что у вас есть.',
        sportsLabel: 'Какие виды спорта или физические активности вам нравятся?',
        sportsPlaceholder: 'Например: бег, плавание, йога, силовая тренировка, танцы, велосипед, баскетбол... Расскажите нам, что вам нравится.',
        noEquipment: 'У меня нет спортивного оборудования',
        noEquipmentMessage: 'Никаких проблем! Мы сосредоточимся на упражнениях с собственным весом и тренировках с минимальным оборудованием.',
        equipmentMessage: 'Отлично! Мы создадим тренировки, которые максимально используют ваше доступное оборудование.',
        sportsMessage: 'Спасибо за информацию о предпочтениях! Мы учтем это при создании вашей персональной тренировочной программы.'
      },
      detailedGoals: {
        title: 'Детальные цели',
        description: 'Расскажите нам больше о вашем конкретном фитнес-пути',
        additionalDetails: 'Дополнительные детали (Необязательно)',
        descriptionText: 'Поделитесь любыми конкретными целями, событиями или мотивами, которые помогут нам персонализировать ваш опыт',
        placeholder: 'Например: я хочу пробежать 5 км за 3 месяца, я тренируюсь для похода в горы, я хочу чувствовать себя более уверенно в своем теле, я готовлюсь к свадьбе...',
        examplesTitle: 'Примеры того, что следует включить:',
        example1: 'Цели по весу или составу тела',
        example2: 'Конкретные события, за которые вы тренируетесь',
        example3: 'Показатели производительности, которые вы хотите достичь',
        example4: 'Как вы хотите себя чувствовать или выглядеть',
        example5: 'Любые конкретные проблемы, с которыми вы сталкиваетесь',
        great: 'Отлично!',
        successMessage: 'Мы будем использовать эту информацию для создания более персонализированных рекомендаций по тренировкам и отслеживания вашего прогресса к этим конкретным целям.'
      },
      frequency: {
        title: 'Расписание тренировок',
        description: 'Как часто и как долго вы хотите тренироваться?',
        frequencyLabel: 'Сколько раз в неделю вы хотите тренироваться?',
        durationLabel: 'Как долго должна быть каждая тренировочная сессия?',
        timesPerWeek: 'раз в неделю',
        timePerWeek: 'время в неделю',
        minutes: 'минут',
        summary: 'Вы будете тренироваться {{frequency}} раз в неделю по {{duration}} минут. Это отличная отправная точка, которую мы можем отрегулировать по мере вашего прогресса!'
      }
    },
    
    // Workouts
    workout: 'Тренировка',
    addWorkout: 'Добавить тренировку',
    editWorkout: 'Редактировать тренировку',
    noWorkoutsFound: 'Тренировки не найдены',
    addFirstWorkout: 'Добавить первую тренировку',
    viewDetails: 'Подробнее',
    
    // Exercise types
    run: 'Бег',
    pullups: 'Подтягивания',
    pushups: 'Отжимания',
    plank: 'Планка',
    custom: 'Кастомное',
    
    // Exercise fields
    durationMinutes: 'Длительность (минуты)',
    distanceKm: 'Расстояние (км)',
    sets: 'Подходы',
    reps: 'Повторения',
    notes: 'Заметки',
    repsPerSet: 'Повторения в подходе',
    
    // Units
    minutes: 'минут',
    km: 'км',
    calories: 'калории',
    
    // AI
    analyzeWithAI: 'Анализировать с AI',
    analyzing: 'Анализирую...',
    
    // Common actions
    welcome: 'Добро пожаловать в AI Тренер',
    welcomeSubtitle: 'Давайте настроим ваш фитнес-профиль',
    aiTrainer: 'AI Тренер',
    next: 'Далее',
    previous: 'Назад',
    continue: 'Продолжить',
    
    // Weekly
    weeklySummary: 'Сводка недели',
    
    // Food
    foodLog: 'Дневник питания',
    addFoodLog: 'Добавить запись',
    
    // Settings
    exportProfile: 'Экспорт профиля',
    importProfile: 'Импорт профиля',
    
    // HomePage
    homePage: {
      workoutsDescription: 'Отслеживайте тренировки и получайте AI анализ',
      foodDescription: 'Ведите дневник питания и отслеживайте калории',
      weeklyDescription: 'Еженедельные проверки и отслеживание прогресса',
      settingsDescription: 'Управляйте профилем и настройками'
    },
    
    // SettingsPage
    settingsPage: {
      back: '← Назад',
      language: 'Язык',
      profileInformation: 'Информация о профиле',
      name: 'Имя',
      age: 'Возраст',
      height: 'Рост',
      weight: 'Вес',
      gender: 'Пол',
      goals: 'Цели',
      notSet: 'Не указано',
      years: 'лет',
      cm: 'см',
      kg: 'кг',
      onboarding: 'Настройка',
      onboardingDescription: 'Сбросить процесс настройки, чтобы начать заново с выбора языка и настройки профиля.',
      resetOnboarding: 'Сбросить настройку',
      resetConfirmMessage: 'Вы уверены, что хотите сбросить настройку? Это очистит ваш профиль и начнет заново.',
      detailedGoals: 'Детальные цели',
      noGoalsSet: 'Цели не установлены',
      dataManagement: 'Управление данными',
      loading: 'Загрузка...',
      failedToUpdateLanguage: 'Не удалось обновить язык',
      editLanguage: 'Редактировать язык',
      editProfile: 'Редактировать профиль',
      editGoals: 'Редактировать цели',
      nameRequired: 'Имя обязательно',
      ageInvalid: 'Возраст должен быть от 10 до 120 лет',
      heightInvalid: 'Рост должен быть от 100 до 250 см',
      weightInvalid: 'Вес должен быть от 1 до 500 кг',
      goalRequired: 'Цель обязательна',
      changesSaved: 'Изменения успешно сохранены',
      failedToSave: 'Не удалось сохранить изменения',
      male: 'Мужской',
      female: 'Женский',
      mainGoal: 'Основная цель',
      goalPlaceholder: 'Опишите вашу основную фитнес-цель...',
      detailedGoalsPlaceholder: 'Добавьте подробности о ваших фитнес-целях, временных рамках, предпочтениях...'
    },
    
    // Plan
    plan: {
      title: 'План на сегодня',
      summary: {
        kcal: 'Всего калорий',
        minutes: 'Длительность (мин)',
        exercises: 'Упражнения'
      },
      rpe: 'RPE',
      status: {
        as_planned: 'Как план',
        skipped: 'Пропустил',
        less: 'Меньше',
        more: 'Больше',
        edited: 'Отредактировано'
      },
      exerciseComment: 'Комментарий к упражнению',
      workoutComment: 'Комментарий к тренировке',
      save: 'Сохранить как тренировку',
      cancel: 'Отменить',
      regenerate: 'Сгенерировать другой план',
      generatePlan: 'Сгенерировать план',
      noPlanAvailable: 'План недоступен',
      planGenerated: 'План успешно сгенерирован',
      generateModal: {
        title: 'Новая тренировка',
        date: 'Дата тренировки',
        preferences: 'Предпочтения',
        preferencesPlaceholder: 'Опишите ваши предпочтения для этой тренировки...',
        lastWorkout: 'Прошлая тренировка',
        cancel: 'Отмена',
        generate: 'Сгенерировать',
        generating: 'Генерация...'
      },
      analysis: 'Анализ прошлой тренировки',
      adjust: {
        button: 'Скорректировать план',
        placeholder: 'Уточните, что нужно изменить...',
        apply: 'Применить изменения'
      }
    },
    
    // Weekly
    weeklyPage: {
      description: 'Еженедельные проверки и отслеживание прогресса',
      addCheckin: 'Добавить проверку',
      previousWeek: 'Предыдущая неделя',
      nextWeek: 'Следующая неделя',
      weeklyOverview: 'Обзор недели',
      workoutsCount: 'Тренировки',
      workoutCalories: 'Калории тренировок',
      foodCalories: 'Калории питания',
      weeklyBalance: 'Недельный баланс',
      thisWeekCheckin: 'Проверка этой недели',
      processing: 'Обработка данных графика...',
      profile: {
        title: 'Информация о профиле',
        viewAll: 'Показать все детали',
        edit: 'Редактировать',
        detailsTitle: 'Детали профиля',
        tabs: {
          general: 'Общее',
          goals: 'Цели и предпочтения'
        },
        fields: {
          name: 'Имя',
          age: 'Возраст',
          gender: 'Пол',
          height: 'Рост (см)',
          weight: 'Вес (кг)',
          language: 'Язык',
          goalTypes: 'Типы целей',
          targetWeight: 'Целевой вес (кг)',
          targetEvent: 'Целевое событие',
          goalDescription: 'Описание целей',
          goalsDetailed: 'Детальные цели',
          constraints: 'Ограничения',
          equipment: 'Оборудование',
          frequency: 'Тренировок в неделю',
          duration: 'Длительность тренировки (мин)',
          nameRequired: 'Имя обязательно',
          ageInvalid: 'Возраст должен быть от 10 до 100 лет',
          heightInvalid: 'Рост должен быть от 100 до 250 см',
          weightInvalid: 'Вес должен быть от 30 до 300 кг',
          frequencyInvalid: 'Частота должна быть от 1 до 14 раз в неделю',
          durationInvalid: 'Длительность должна быть от 5 до 300 минут'
        },
        actions: {
          close: 'Закрыть',
          update: 'Обновить',
          save: 'Сохранить'
        },
        toast: {
          saved: 'Профиль обновлён',
          error: 'Не удалось сохранить профиль'
        }
      },
      aiEstimate: {
        badge: 'ИИ',
        calculating: 'Оценка ИИ…',
        recalculate: 'Обновить оценку',
        estimatedByAI: 'Оценено моделью ИИ',
        alwaysUseAI: 'Всегда оценивать через ИИ',
        savedWithEstimates: 'Тренировка сохранена. Оценки будут добавлены.',
        error: 'Не удалось получить оценку ИИ',
        tooltip: 'Оценено моделью gpt-4o-mini'
      },
      previousCheckins: 'Предыдущие проверки',
      weight: 'Вес',
      waist: 'Талия',
      notes: 'Заметки',
      progressPhoto: 'Фото прогресса',
      photoAvailable: '📷 Фото доступно',
      updateCheckin: 'Обновить проверку',
      addCheckinModal: 'Добавить проверку',
      weightRequired: 'Вес (кг) *',
      waistOptional: 'Талия (см) - необязательно',
      progressPhotoOptional: 'Фото прогресса - необязательно',
      notesOptional: 'Заметки - необязательно',
      allowPhotoInAI: 'Разрешить использование фото в ИИ анализе',
      weightPlaceholder: 'например, 70.5',
      waistPlaceholder: 'например, 80',
      notesPlaceholder: 'Как прошла неделя? Есть наблюдения?',
      pleaseEnterWeight: 'Пожалуйста, введите ваш вес',
      failedToSaveCheckin: 'Не удалось сохранить проверку',
      workout: 'тренировка',
      workouts: 'тренировки',
      foodLog: 'запись питания',
      foodLogs: 'записи питания',
      // New weekly analytics keys
      activityChart: 'Активность по дням',
      typesChart: 'Распределение по типам упражнений',
      noData: 'Нет данных о тренировках за эту неделю',
      totalSessions: 'Всего сессий',
      totalWorkouts: 'Всего тренировок',
      balance: 'Баланс',
      avgRpe: 'Средний RPE',
      types: {
        run: 'Бег',
        pullups: 'Подтягивания',
        pushups: 'Отжимания',
        plank: 'Планка',
        custom: 'Другое'
      },
      prs: {
        title: 'Личные рекорды',
        longestRun: 'Самый длинный бег',
        fastestPace: 'Самый быстрый темп',
        maxPullups: 'Максимум подтягиваний',
        maxPushups: 'Максимум отжиманий',
        longestPlank: 'Самая долгая планка',
        noRecords: 'Нет личных рекордов на этой неделе'
      },
      progress: {
        title: 'Прогресс по упражнениям',
        noData: 'Нет данных об упражнениях за эту неделю',
        openDetails: 'Открыть график',
        totalWeek: 'Всего за неделю'
      },
      metrics: {
        distance: 'Дистанция',
        duration: 'Длительность',
        reps: 'Повторения',
        sets: 'Подходы',
        sessions: 'Сессии',
        holds: 'Удержания'
      },
      loading: 'Загрузка аналитики...',
      addWorkout: 'Добавьте тренировки, чтобы увидеть график активности',
      charts: {
        activity: 'Активность по дням',
        completed: 'Калории тренировок',
        planned: 'План (ИИ)',
        duration: 'Длительность (мин)',
        runKm: 'Дистанция (км)',
        runMin: 'Длительность бега (мин)',
        reps: 'Повторения',
        seconds: 'Секунды'
      },
      tooltip: {
        date: 'Дата',
        completedKcal: 'Тренировки (ккал)',
        plannedKcal: 'План (ккал)',
        foodKcal: 'Питание (ккал)',
        workouts: 'Тренировки',
        minutesTotal: 'Всего минут',
        workoutsCount: 'Тренировок',
        workout: 'Детали тренировки'
      },
      status: {
        planned: 'План',
        completed: 'Завершена',
        skipped: 'Пропущена'
      }
    },
    
    // JsonFileButtons
    jsonFileButtons: {
      dataExportedSuccessfully: 'Данные успешно экспортированы!',
      exportFailed: 'Экспорт не удался',
      dataImportedSuccessfully: 'Данные успешно импортированы!',
      importFailed: 'Импорт не удался',
      pleaseSelectValidJsonFile: 'Пожалуйста, выберите валидный JSON файл',
      fileSizeMustBeLessThan10MB: 'Размер файла должен быть меньше 10MB',
      exportAllData: 'Экспортировать все данные',
      exporting: 'Экспортирую...',
      importData: 'Импортировать данные',
      importing: 'Импортирую...',
      export: 'Экспорт:',
      exportDescription: 'Скачайте все свои данные в виде JSON файла для резервного копирования.',
      import: 'Импорт:',
      importDescription: 'Восстановите свои данные из ранее экспортированного JSON файла.',
      note: 'Примечание:',
      importNote: 'Импорт заменит все существующие данные. Убедитесь, что сначала сделайте резервную копию.'
    },
    
    // WorkoutsPage
    workoutsPage: {
      trackWorkoutsAndProgress: 'Отслеживайте тренировки и прогресс',
      loadingWorkouts: 'Загружаю тренировки...',
      startFitnessJourney: 'Начните свой фитнес-путь, добавив первую тренировку'
    },
    
    // WorkoutForm
    workoutForm: {
      formMode: 'Режим формы',
      textMode: 'Текстовый режим',
      date: 'Дата',
      rpe: 'RPE (Уровень воспринимаемой нагрузки)',
      easy: 'Легко',
      moderate: 'Умеренно',
      hard: 'Тяжело',
      exercises: 'Упражнения',
      addExercise: 'Добавить упражнение',
      noExercisesAdded: 'Упражнения еще не добавлены. Нажмите "Добавить упражнение" чтобы начать.',
      workoutSummary: 'Сводка тренировки',
      totalCalories: 'Всего калорий:',
      duration: 'Длительность:',
      totalDuration: 'Общая длительность тренировки',
      durationMinutes: 'Длительность (минуты)',
      exercisesCount: 'Упражнения:',
      describeWorkout: 'Опишите вашу тренировку',
      workoutDescriptionPlaceholder: 'Пример: пробежал 5 км, подтянулся 7-5-3-3-2, отжимания 20-20-15, планка 60-45-50',
      workoutDescriptionHelp: 'Опишите вашу тренировку естественным языком. ИИ разберет её на структурированные упражнения.',
      parseAndContinue: 'Разобрать и продолжить',
      parsing: 'Разбираю...',
      pleaseAddExercise: 'Пожалуйста, добавьте хотя бы одно упражнение',
      failedToSave: 'Не удалось сохранить тренировку',
      pleaseEnterDescription: 'Пожалуйста, введите описание тренировки',
      failedToParse: 'Не удалось разобрать текст тренировки. Пожалуйста, используйте режим формы.',
      aiNotConfigured: 'ИИ не настроен. Пожалуйста, настройте ваш OpenAI API ключ в Настройках.',
      aiParseFailed: 'Парсинг ИИ не удался. Попробуйте еще раз или используйте режим формы.'
    },
    
    // WorkoutCard
    workoutCard: {
      today: 'Сегодня',
      yesterday: 'Вчера',
      calories: 'Калории',
      duration: 'Длительность',
      exercises: 'Упражнения',
      moreExercises: 'еще упражнений',
      aiReviewed: 'Проанализировано ИИ',
      reps: 'повт.',
      min: 'мин',
      km: 'км'
    },
    
    // Exercise types
    exerciseTypes: {
      run: 'Бег',
      pullups: 'Подтягивания',
      pushups: 'Отжимания',
      plank: 'Планка',
      custom: 'Свое упражнение'
    },
    
    // WorkoutDetailsPage
    workoutDetailsPage: {
      workoutNotFound: 'Тренировка не найдена',
      backToWorkouts: 'Назад к тренировкам',
      workoutDetails: 'Детали тренировки',
      edit: 'Редактировать',
      delete: 'Удалить',
      deleting: 'Удаляю...',
      deleteConfirm: 'Вы уверены, что хотите удалить эту тренировку?',
      failedToDelete: 'Не удалось удалить тренировку',
      totalCalories: 'Всего калорий',
      duration: 'Длительность (минуты)',
      exercises: 'Упражнения',
      aiReviewed: 'Проанализировано ИИ',
      aiAnalysis: 'Анализ ИИ',
      aiAnalysisDescription: 'Эта тренировка была проанализирована ИИ. Посмотрите полный анализ и рекомендации в разделе ИИ.',
      noRepsSpecified: 'Повторения не указаны',
      noTimeSpecified: 'Время не указано',
      customExercise: 'Свое упражнение',
      exerciseDetails: 'Детали упражнения',
      sets: 'подходов',
      total: 'всего',
      holds: 'удержаний',
      minutes: 'минут',
      for: 'в течение',
      workoutUpdated: 'Тренировка успешно обновлена',
      exerciseUpdated: 'Упражнение успешно обновлено',
      updateFailed: 'Не удалось обновить',
      editWorkout: 'Редактировать тренировку',
      editExercise: 'Редактировать упражнение',
      exerciseType: 'Тип упражнения',
      distance: 'Расстояние',
      repsPerSet: 'Повторения в подходе',
      commaSeparated: 'через запятую',
      seconds: 'Секунды',
      exerciseName: 'Название упражнения',
      notes: 'Заметки'
    },
    
    // AISettings
    aiSettings: {
      title: 'Настройка ИИ',
      description: 'Настройте ваш API ключ OpenAI для включения функций ИИ, таких как анализ тренировок и рекомендации.',
      apiKeyLabel: 'API ключ OpenAI',
      apiKeyPlaceholder: 'sk-...',
      saveKey: 'Сохранить ключ',
      clearKey: 'Очистить ключ',
      testConnection: 'Проверить соединение',
      testing: 'Проверяю...',
      pleaseEnterKey: 'Пожалуйста, введите API ключ',
      keyNotChanged: 'Ключ не был изменен',
      keySaved: 'API ключ успешно сохранен',
      keyCleared: 'API ключ очищен',
      confirmClear: 'Вы уверены, что хотите очистить API ключ?',
      configureFirst: 'Пожалуйста, сначала настройте API ключ',
      connectionSuccess: 'Соединение успешно!',
      connectionFailed: 'Соединение не удалось. Проверьте ваш API ключ.',
      lastTestSuccess: 'Последняя проверка соединения: Успешно',
      lastTestFailed: 'Последняя проверка соединения: Неудачно',
      configured: 'Функции ИИ включены',
      notConfigured: 'Функции ИИ отключены - требуется API ключ',
      helpTitle: 'Как получить API ключ OpenAI:',
      helpStep1: 'Посетите OpenAI Platform (platform.openai.com)',
      helpStep2: 'Зарегистрируйтесь или войдите в свой аккаунт',
      helpStep3: 'Перейдите в раздел API Keys',
      helpStep4: 'Создайте новый секретный ключ',
      helpStep5: 'Скопируйте ключ и вставьте его выше'
    }
  }
}

// Hook to get translations
export const useTranslations = () => {
  const { currentLanguage } = useI18nStore()
  return translations[currentLanguage]
}
