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
    
    // NotFound
    notFound: {
      title: 'Page Not Found',
      description: 'The page you\'re looking for doesn\'t exist.'
    },
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
      workoutsDescription: 'Track your workouts and get AI analysis',
      foodDescription: 'Log your meals and track calories',
      weeklyDescription: 'Weekly check-ins and progress tracking',
      settingsDescription: 'Manage your profile and settings'
    },
    
    // Home Dashboard
    homeDashboard: {
      nextPlan: {
        today: 'Plan for Today',
        tomorrow: 'Plan for Tomorrow',
        open: 'Open Plan',
        markDone: 'Mark as Done',
        regenerate: 'Regenerate',
        noPlan: 'No plan created for today',
        enableAI: 'Enable AI',
        generate: 'Generate Plan',
        exercises: 'Exercises',
        moreExercises: 'more exercises',
        generateDescription: 'Generate a personalized workout plan for today',
        enableAIDescription: 'Enable AI to generate personalized workout plans'
      },
      kpi: {
        today: 'Today',
        week: 'Week',
        progress: 'Progress',
        calories: 'Calories',
        minutes: 'Minutes',
        exercises: 'Exercises',
        rpe: 'RPE',
        noWorkoutsToday: 'You haven\'t trained today',
        workoutsCount: 'workouts',
        workouts: 'Workouts'
      },
      recent: {
        title: 'Recent Workouts',
        showAll: 'Show All',
        empty: 'No workouts yet',
        add: 'Add Workout',
        import: 'Import JSON'
      },
      banners: {
        metrics: 'Time to update measurements for the past week',
        apiKey: 'Connect OpenAI key to enable AI features',
        finishProfile: 'Complete your profile',
        fill: 'Fill',
        snooze: 'Snooze',
        setup: 'Setup',
        completeProfileMessage: 'Complete your profile to get personalized recommendations',
        enableAIMessage: 'Enable AI to generate personalized workout plans and get analysis',
        metricsMessage: 'Keep track of your progress by updating your body measurements',
        bodyMetricsCheckFailed: 'Body metrics check failed:',
        failedToLoadBanners: 'Failed to load banners:'
      },
      cta: {
        openPlan: 'Open Today\'s Plan',
        generateWorkout: 'Generate Workout',
        generatePlan: 'Generate Plan', // Alias for backward compatibility
        generating: 'Generating...',
        enableAI: 'Enable AI',
        addWorkout: 'Add Workout',
        add: 'Add'
      }
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
      detailedGoalsPlaceholder: 'Add more details about your fitness goals, timeline, preferences...',
      title: 'Settings',
      viewAllDetails: 'View all details',
      databaseManagement: 'Database Management',
      forceUpgradeConfirm: 'This will force upgrade the database. Continue?',
      upgradeSuccess: 'Database upgraded successfully. Please refresh the page.',
      upgradeError: 'Failed to upgrade database. Please refresh the page manually.',
      debugSuccess: 'Found {{count}} AI feedback records. Check console for details.',
      debugError: 'Failed to debug database. Check console for errors.',
      upgrading: 'Upgrading...',
      forceDatabaseUpgrade: 'Force Database Upgrade',
      debugging: 'Debugging...',
      debugAIFeedback: 'Debug AI Feedback',
      databaseHelpText: 'Use "Force Database Upgrade" if you encounter database errors. Use "Debug AI Feedback" to check what AI feedback records exist.',
      english: 'English',
      russian: 'Русский',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel'
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
        title: 'Profile Details',
        viewAll: 'View all details',
        edit: 'Edit',
        detailsTitle: 'Profile Details',
        name: 'Name',
        age: 'Age',
        gender: 'Gender',
        height: 'Height',
        weight: 'Weight',
        goal: 'Goal',
        constraints: 'Constraints',
        equipment: 'Equipment',
        frequency: 'Frequency',
        duration: 'Duration',
        language: 'Language',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        english: 'English',
        russian: 'Русский',
        years: 'years',
        notSet: 'Not set',
        update: 'Update',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        general: 'General',
        goalsPreferences: 'Goals & Preferences',
        goalDescription: 'Goal Description',
        detailedGoals: 'Detailed Goals',
        workoutsPerWeek: 'Workouts per week',
        workoutDuration: 'Workout duration',
        goalPlaceholder: 'Describe your main fitness goal...',
        detailedGoalsPlaceholder: 'Add more details about your fitness goals...',
        nameRequired: 'Name is required',
        ageRange: 'Age must be between 10 and 100',
        heightRange: 'Height must be between 100 and 250 cm',
        weightRange: 'Weight must be between 30 and 300 kg',
        frequencyRange: 'Frequency must be between 1 and 14',
        durationRange: 'Duration must be between 5 and 300 minutes',
        updateSuccess: 'Profile updated successfully',
        updateError: 'Failed to save profile',
        saving: 'Saving...',
        tabs: {
          general: 'General',
          goals: 'Goals & Preferences'
        },
        units: {
          cm: 'cm',
          kg: 'kg',
          min: 'min',
          years: 'years'
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
      startFitnessJourney: 'Start your fitness journey by adding your first workout',
      weekNav: {
        prev: 'Previous',
        next: 'Next',
        current: 'Current Week',
        range: '{{from}} — {{to}}'
      },
      filters: {
        title: 'Filters',
        all: 'All',
        completed: 'Completed',
        planned: 'Planned',
        types: 'Exercise Types',
        rpe: 'RPE',
        aiOnly: 'AI Analysis Only',
        search: 'Search'
      },
      summary: {
        title: 'Week Summary',
        workouts: 'Workouts',
        calories: 'Calories',
        duration: 'Duration (min)',
        avgRpe: 'Avg RPE',
        goalProgress: '{{done}} / {{goal}} workouts',
        collapseSummary: 'Collapse summary',
        expandSummary: 'Expand summary',
        min: 'min',
        weeklyActivity: 'Weekly Activity'
      },
      emptyWeek: {
        title: 'No workouts this week',
        add: 'Add Workout',
        generate: 'Generate Workout'
      }
    },
    
    // StatsPage
    statsPage: {
      title: 'Statistics',
      range: {
        all: 'All Time',
        ytd: 'Year to Date',
        last30: 'Last 30 Days',
        last90: 'Last 90 Days',
        custom: 'Custom Period'
      },
      kpi: {
        workouts: 'Total Workouts',
        calories: 'Calories Burned',
        time: 'Total Time',
        avgRpe: 'Average RPE',
        perWeek: 'Workouts/Week',
        lastWorkout: 'Last Workout',
        activeDays: 'Active Days'
      },
      discipline: {
        title: 'Discipline Breakdown',
        run: 'Running',
        pullups: 'Pull-ups',
        pushups: 'Push-ups',
        plank: 'Plank',
        custom: 'Custom'
      },
      trends: {
        title: 'Trends',
        metric: {
          calories: 'Calories',
          minutes: 'Minutes',
          distance: 'Distance',
          pace: 'Pace'
        },
        groupBy: {
          day: 'By Day',
          week: 'By Week'
        }
      },
      records: {
        title: 'Personal Records',
        longestRun: 'Longest Run',
        bestPace: 'Best Pace',
        maxPullups: 'Max Pull-ups',
        maxPushups: 'Max Push-ups',
        longestPlank: 'Longest Plank',
        viewChart: 'View Chart'
      },
      consistency: {
        title: 'Activity Calendar',
        noData: 'No activity data'
      },
      body: {
        title: 'Body Metrics',
        addMetric: 'Add Measurement',
        last: 'Latest Measurements',
        weight: 'Weight',
        waist: 'Waist',
        bicep: 'Bicep',
        thigh: 'Thigh',
        chest: 'Chest'
      },
      ai: {
        title: 'AI Insights',
        refresh: 'Refresh Insights',
        loading: 'Generating insights...',
        error: 'Failed to generate insights'
      },
      error: 'Error:',
      noData: 'No Data Available',
      noDataMessage: 'Start tracking your workouts to see your statistics here.',
      subtitle: 'Track your fitness progress and trends',
      customDate: {
        startDate: 'Start Date',
        endDate: 'End Date',
        cancel: 'Cancel',
        apply: 'Apply'
      },
      keyMetrics: 'Key Metrics',
      rpe: {
        easy: 'Easy',
        moderate: 'Moderate',
        hard: 'Hard',
        never: 'Never',
        na: 'N/A'
      },
      chart: {
        calories: 'Calories',
        minutes: 'Minutes',
        time: 'Time',
        ofTotal: '% of total',
        sessions: 'Sessions:',
        noData: 'No workout data available for this period',
        collapse: 'Collapse',
        expand: 'Expand',
        sessionsCount: 'sessions',
        kcal: 'kcal',
        min: 'min',
        progress: 'Progress',
        close: 'Close',
        dataPoints: 'Data Points',
        best: 'Best',
        first: 'First',
        latest: 'Latest',
        distance: 'Distance (km)',
        reps: 'Reps',
        pace: 'Pace (min/km)',
        noDataMessage: 'No progress data for this record'
      }
    },
    
    // Body Metrics
    metrics: {
      title: 'Body Metrics',
      setup: 'Setup Metrics',
      reminder: 'Time to update measurements for the past week',
      fillNow: 'Fill Now',
      snooze: 'Snooze',
      modal: {
        title: 'Weekly Measurements',
        addPhoto: 'Add Photo',
        consent: 'Allow sending photos for AI analysis',
        save: 'Save',
        saveAndAnalyze: 'Save and Analyze with AI',
        noPhotos: 'No photos added',
        photosAdded: '{{count}} photos added'
      },
      ai: {
        summary: 'AI Assessment',
        score: 'Score',
        tips: 'Recommendations',
        history: 'Assessment History',
        disclaimer: 'AI assessment is for reference only and is not medical advice.'
      },
      default: {
        weight: 'Weight',
        waist: 'Waist',
        chest: 'Chest',
        bicep: 'Bicep',
        thigh: 'Thigh',
        bodyFat: 'Body Fat %'
      },
      units: {
        kg: 'kg',
        cm: 'cm',
        percent: '%',
        count: 'count',
        custom: 'custom'
      },
      photo: {
        front: 'Front',
        side: 'Side',
        back: 'Back',
        other: 'Other'
      },
      settings: 'Settings',
      allowPhotoAnalysis: 'Allow photo analysis',
      photoAnalysisDesc: 'Allow sending photos to AI for analysis',
      reminderEnabled: 'Enable reminders',
      reminderDesc: 'Show weekly reminder to fill metrics',
      defaultMetrics: 'Default Metrics',
      testEntry: 'Test Entry',
      customMetrics: 'Custom Metrics',
      addCustom: 'Add Custom',
      metricKey: 'Metric Key',
      metricLabel: 'Metric Label',
      unit: 'Unit',
      precision: 'Precision',
      minValue: 'Min Value',
      maxValue: 'Max Value',
      isActive: 'Active',
      isRequired: 'Required',
      fillRequired: 'Please fill in all required fields',
      confirmDelete: 'Are you sure you want to delete this metric?',
      note: 'Add a note...',
      recentEntries: 'Recent Entries',
      noEntries: 'No recent entries'
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
      veryHard: 'Very Hard',
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
      pleaseEnterDescription: 'Please enter workout description',
      aiNotConfigured: 'AI is not configured. Please set up your OpenAI API key in Settings.',
      aiParseFailed: 'AI parsing failed',
      aiRequired: '(AI required)',
      optional: 'Optional',
      optionalDescription: 'Optional: Total time spent on the workout including rest',
      aiWillEstimate: 'AI will automatically estimate RPE and provide feedback after saving',
      estimatesWillBeCalculated: 'Estimates will be calculated after saving',
      aiEstimationInProgress: 'AI estimation in progress...',
      caloriesWillBeEstimated: 'Calories and duration will be estimated automatically',
      addAtLeastOneExercise: 'Please add at least one exercise',
      failedToSave: 'Failed to save workout'
    },

    // Workout Analysis
    workoutAnalysis: {
      enable: 'Analyze workout with AI',
      starting: 'Starting AI analysis...',
      ready: 'AI analysis completed',
      error: 'Failed to perform AI analysis',
      rpe: 'RPE (intensity)',
      feedbackTitle: 'AI Feedback',
      update: 'Update analysis'
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
      rpe: 'RPE',
      rpeHint: 'RPE — subjective intensity rating (1–10)',
      aiFeedback: 'AI Feedback',
      updateAnalysis: 'Update Analysis',
      analysisUpdated: 'Analysis updated',
      caloriesSplit: 'Calories Distribution',
      durationByExercise: 'Duration by Exercise',
      noAnalytics: 'Insufficient data for analytics',
      noAnalysis: 'Analysis not performed yet. Click "Update Analysis".',
      editExercise: 'Edit exercise',
      databaseError: 'Database error: Please refresh the page and try again',
      databaseUpdated: 'Database updated. Please try again',
      invalidApiKey: 'Invalid API key. Please check your settings',
      rateLimitExceeded: 'Rate limit exceeded. Please try again later',
      networkError: 'Network error. Please check your connection',
      holds: 'holds',
      minutes: 'minutes',
      for: 'for',
      // New refactored UI keys
      metrics: {
        calories: 'Total Calories',
        duration: 'Duration (minutes)',
        exercises: 'Exercises',
        rpe: 'RPE (1–10)',
        rpeSourceAI: 'Source: AI',
        rpeSourceManual: 'Source: Manual'
      },
      actions: {
        updateAnalysis: 'Update Analysis',
        recalcEstimates: 'Recalculate AI Estimates',
        editMeta: 'Change date/duration/RPE',
        toWeek: 'To Week',
        prev: 'Previous',
        next: 'Next'
      },
      nav: {
        prev: 'Previous workout',
        next: 'Next workout'
      },
      ai: {
        feedback: 'AI Feedback',
        model: 'Model',
        updated: 'updated',
        notRun: 'Analysis not performed yet. Click "Update Analysis".',
        badgeAI: 'AI Estimated'
      },
      analytics: {
        title: 'Workout Analytics',
        caloriesSplit: 'Calories Distribution',
        durationByExercise: 'Duration by Exercise',
        empty: 'Insufficient data for analytics.',
        ctaRecalc: 'Recalculate AI Estimates'
      },
      exercise: {
        edit: 'Edit',
        sets: 'sets',
        reps: 'reps',
        holds: 'holds',
        sec: 'sec',
        km: 'km',
        min: 'min'
      },
      metaModal: {
        title: 'Change workout metadata',
        date: 'Date',
        durationMin: 'Duration (min)',
        rpe: 'RPE (1–10)',
        cancel: 'Cancel',
        save: 'Save',
        saved: 'Data updated'
      },
      workoutUpdated: 'Workout updated successfully',
      exerciseUpdated: 'Exercise updated successfully',
      updateFailed: 'Failed to update',
      editWorkout: 'Edit workout',
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
    
    // Home Dashboard
    homeDashboard: {
      nextPlan: {
        today: 'План на сегодня',
        tomorrow: 'План на завтра',
        open: 'Открыть план',
        markDone: 'Отметить выполнено',
        regenerate: 'Сгенерировать заново',
        noPlan: 'План на сегодня не создан',
        enableAI: 'Включить ИИ',
        generate: 'Сгенерировать план',
        exercises: 'Упражнения',
        moreExercises: 'упражнений',
        generateDescription: 'Сгенерируйте персональный план тренировки на сегодня',
        enableAIDescription: 'Включите ИИ для генерации персональных планов тренировок'
      },
      kpi: {
        today: 'Сегодня',
        week: 'Неделя',
        progress: 'Прогресс',
        calories: 'Калории',
        minutes: 'Минуты',
        exercises: 'Упражнения',
        rpe: 'RPE',
        noWorkoutsToday: 'Сегодня вы не тренировались',
        workoutsCount: 'тренировок',
        workouts: 'Тренировки'
      },
      recent: {
        title: 'Последние тренировки',
        showAll: 'Показать все',
        empty: 'Пока нет тренировок',
        add: 'Добавить тренировку',
        import: 'Импорт JSON'
      },
      banners: {
        metrics: 'Пора обновить измерения за прошедшую неделю',
        apiKey: 'Подключите ключ OpenAI, чтобы включить ИИ',
        finishProfile: 'Завершите профиль',
        fill: 'Заполнить',
        snooze: 'Отложить',
        setup: 'Настроить',
        completeProfileMessage: 'Завершите профиль, чтобы получить персональные рекомендации',
        enableAIMessage: 'Включите ИИ для генерации персональных планов тренировок и анализа',
        metricsMessage: 'Отслеживайте прогресс, обновляя измерения тела',
        bodyMetricsCheckFailed: 'Проверка метрик тела не удалась:',
        failedToLoadBanners: 'Не удалось загрузить баннеры:'
      },
      cta: {
        openPlan: 'Открыть план на сегодня',
        generateWorkout: 'Сгенерировать тренировку',
        generatePlan: 'Сгенерировать план', // Alias for backward compatibility
        generating: 'Генерация...',
        enableAI: 'Включить ИИ',
        addWorkout: 'Добавить тренировку',
        add: 'Добавить'
      }
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
      detailedGoalsPlaceholder: 'Добавьте подробности о ваших фитнес-целях, временных рамках, предпочтениях...',
      title: 'Настройки',
      viewAllDetails: 'Показать все детали',
      databaseManagement: 'Управление базой данных',
      forceUpgradeConfirm: 'Это принудительно обновит базу данных. Продолжить?',
      upgradeSuccess: 'База данных успешно обновлена. Пожалуйста, обновите страницу.',
      upgradeError: 'Не удалось обновить базу данных. Пожалуйста, обновите страницу вручную.',
      debugSuccess: 'Найдено {{count}} записей AI обратной связи. Проверьте консоль для подробностей.',
      debugError: 'Не удалось отладить базу данных. Проверьте консоль на ошибки.',
      upgrading: 'Обновление...',
      forceDatabaseUpgrade: 'Принудительное обновление БД',
      debugging: 'Отладка...',
      debugAIFeedback: 'Отладка AI обратной связи',
      databaseHelpText: 'Используйте "Принудительное обновление БД" при ошибках базы данных. Используйте "Отладка AI обратной связи" для проверки записей AI обратной связи.',
      english: 'English',
      russian: 'Русский',
      save: 'Сохранить',
      saving: 'Сохранение...',
      
      // NotFound
      notFound: {
        title: 'Страница не найдена',
        description: 'Страница, которую вы ищете, не существует.'
      },
      
      cancel: 'Отмена'
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
        title: 'Детали профиля',
        viewAll: 'Показать все детали',
        edit: 'Редактировать',
        detailsTitle: 'Детали профиля',
        name: 'Имя',
        age: 'Возраст',
        gender: 'Пол',
        height: 'Рост',
        weight: 'Вес',
        goal: 'Цель',
        constraints: 'Ограничения',
        equipment: 'Оборудование',
        frequency: 'Частота',
        duration: 'Длительность',
        language: 'Язык',
        male: 'Мужской',
        female: 'Женский',
        other: 'Другой',
        english: 'English',
        russian: 'Русский',
        years: 'лет',
        notSet: 'Не указано',
        update: 'Обновить',
        save: 'Сохранить',
        cancel: 'Отмена',
        close: 'Закрыть',
        general: 'Общее',
        goalsPreferences: 'Цели и предпочтения',
        goalDescription: 'Описание цели',
        detailedGoals: 'Детальные цели',
        workoutsPerWeek: 'Тренировок в неделю',
        workoutDuration: 'Длительность тренировки',
        goalPlaceholder: 'Опишите вашу основную фитнес-цель...',
        detailedGoalsPlaceholder: 'Добавьте больше деталей о ваших фитнес-целях...',
        nameRequired: 'Имя обязательно',
        ageRange: 'Возраст должен быть от 10 до 100 лет',
        heightRange: 'Рост должен быть от 100 до 250 см',
        weightRange: 'Вес должен быть от 30 до 300 кг',
        frequencyRange: 'Частота должна быть от 1 до 14',
        durationRange: 'Длительность должна быть от 5 до 300 минут',
        updateSuccess: 'Профиль успешно обновлен',
        updateError: 'Не удалось сохранить профиль',
        saving: 'Сохранение...',
        tabs: {
          general: 'Общее',
          goals: 'Цели и предпочтения'
        },
        units: {
          cm: 'см',
          kg: 'кг',
          min: 'мин',
          years: 'лет'
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
      startFitnessJourney: 'Начните свой фитнес-путь, добавив первую тренировку',
      weekNav: {
        prev: 'Предыдущая',
        next: 'Следующая',
        current: 'Текущая неделя',
        range: '{{from}} — {{to}}'
      },
      filters: {
        title: 'Фильтры',
        all: 'Все',
        completed: 'Выполненные',
        planned: 'План',
        types: 'Типы упражнений',
        rpe: 'RPE',
        aiOnly: 'Только с AI-анализом',
        search: 'Поиск'
      },
      summary: {
        title: 'Сводка недели',
        workouts: 'Тренировки',
        calories: 'Калории',
        duration: 'Длительность (мин)',
        avgRpe: 'Средний RPE',
        goalProgress: '{{done}} / {{goal}} тренировок',
        collapseSummary: 'Свернуть сводку',
        expandSummary: 'Развернуть сводку',
        min: 'мин',
        weeklyActivity: 'Активность недели'
      },
      emptyWeek: {
        title: 'Нет тренировок на этой неделе',
        add: 'Добавить тренировку',
        generate: 'Сгенерировать тренировку'
      }
    },
    
    // StatsPage
    statsPage: {
      title: 'Статистика',
      range: {
        all: 'За всё время',
        ytd: 'Текущий год',
        last30: '30 дней',
        last90: '90 дней',
        custom: 'Период'
      },
      kpi: {
        workouts: 'Всего тренировок',
        calories: 'Сожжённые калории',
        time: 'Общее время',
        avgRpe: 'Средний RPE',
        perWeek: 'Тренировок/неделю',
        lastWorkout: 'Последняя тренировка',
        activeDays: 'Дни с активностью'
      },
      discipline: {
        title: 'Разбиение по дисциплинам',
        run: 'Бег',
        pullups: 'Подтягивания',
        pushups: 'Отжимания',
        plank: 'Планка',
        custom: 'Кастомные'
      },
      trends: {
        title: 'Тренды',
        metric: {
          calories: 'Калории',
          minutes: 'Минуты',
          distance: 'Дистанция',
          pace: 'Темп'
        },
        groupBy: {
          day: 'По дням',
          week: 'По неделям'
        }
      },
      records: {
        title: 'Личные рекорды',
        longestRun: 'Самый длинный бег',
        bestPace: 'Лучший темп',
        maxPullups: 'Макс подтягиваний',
        maxPushups: 'Макс отжиманий',
        longestPlank: 'Самая долгая планка',
        viewChart: 'Открыть график'
      },
      consistency: {
        title: 'Календарь активности',
        noData: 'Нет данных об активности'
      },
      body: {
        title: 'Метрики тела',
        addMetric: 'Добавить измерение',
        last: 'Последние измерения',
        weight: 'Вес',
        waist: 'Талия',
        bicep: 'Бицепс',
        thigh: 'Бедро',
        chest: 'Грудь'
      },
      ai: {
        title: 'Инсайты от ИИ',
        refresh: 'Обновить инсайты',
        loading: 'Генерируем инсайты...',
        error: 'Не удалось сгенерировать инсайты'
      },
      error: 'Ошибка:',
      noData: 'Нет данных',
      noDataMessage: 'Начните отслеживать тренировки, чтобы увидеть статистику здесь.',
      subtitle: 'Отслеживайте прогресс и тренды в фитнесе',
      customDate: {
        startDate: 'Дата начала',
        endDate: 'Дата окончания',
        cancel: 'Отмена',
        apply: 'Применить'
      },
      keyMetrics: 'Ключевые метрики',
      rpe: {
        easy: 'Легко',
        moderate: 'Умеренно',
        hard: 'Сложно',
        never: 'Никогда',
        na: 'Н/Д'
      },
      chart: {
        calories: 'Калории',
        minutes: 'Минуты',
        time: 'Время',
        ofTotal: '% от общего',
        sessions: 'Сессии:',
        noData: 'Нет данных о тренировках за этот период',
        collapse: 'Свернуть',
        expand: 'Развернуть',
        sessionsCount: 'сессий',
        kcal: 'ккал',
        min: 'мин',
        progress: 'Прогресс',
        close: 'Закрыть',
        dataPoints: 'Точек данных',
        best: 'Лучший',
        first: 'Первый',
        latest: 'Последний',
        distance: 'Дистанция (км)',
        reps: 'Повторения',
        pace: 'Темп (мин/км)',
        noDataMessage: 'Нет данных о прогрессе для этого рекорда'
      }
    },
    
    // Body Metrics
    metrics: {
      title: 'Метрики тела',
      setup: 'Настроить метрики',
      reminder: 'Пора обновить измерения за прошедшую неделю',
      fillNow: 'Заполнить',
      snooze: 'Отложить',
      modal: {
        title: 'Еженедельные измерения',
        addPhoto: 'Добавить фото',
        consent: 'Разрешаю отправку фото на анализ ИИ',
        save: 'Сохранить',
        saveAndAnalyze: 'Сохранить и проанализировать ИИ',
        noPhotos: 'Фото не добавлены',
        photosAdded: 'Добавлено {{count}} фото'
      },
      ai: {
        summary: 'Оценка ИИ',
        score: 'Оценка',
        tips: 'Рекомендации',
        history: 'История оценок',
        disclaimer: 'Оценка ИИ носит ориентировочный характер и не является медицинским советом.'
      },
      default: {
        weight: 'Вес',
        waist: 'Талия',
        chest: 'Грудь',
        bicep: 'Бицепс',
        thigh: 'Бедро',
        bodyFat: 'Процент жира'
      },
      units: {
        kg: 'кг',
        cm: 'см',
        percent: '%',
        count: 'шт',
        custom: 'пользовательская'
      },
      photo: {
        front: 'Спереди',
        side: 'Сбоку',
        back: 'Сзади',
        other: 'Другое'
      },
      settings: 'Настройки',
      allowPhotoAnalysis: 'Разрешить анализ фото',
      photoAnalysisDesc: 'Разрешить отправку фото для анализа ИИ',
      reminderEnabled: 'Включить напоминания',
      reminderDesc: 'Показывать еженедельное напоминание о заполнении метрик',
      defaultMetrics: 'Стандартные метрики',
      testEntry: 'Тестовая запись',
      customMetrics: 'Пользовательские метрики',
      addCustom: 'Добавить',
      metricKey: 'Ключ метрики',
      metricLabel: 'Название метрики',
      unit: 'Единица измерения',
      precision: 'Точность',
      minValue: 'Минимальное значение',
      maxValue: 'Максимальное значение',
      isActive: 'Активна',
      isRequired: 'Обязательна',
      fillRequired: 'Пожалуйста, заполните все обязательные поля',
      confirmDelete: 'Вы уверены, что хотите удалить эту метрику?',
      note: 'Добавить заметку...',
      recentEntries: 'Последние записи',
      noEntries: 'Нет последних записей'
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
      veryHard: 'Очень тяжело',
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
      parsing: 'Разбор...',
      pleaseEnterDescription: 'Пожалуйста, введите описание тренировки',
      aiNotConfigured: 'ИИ не настроен. Пожалуйста, настройте ваш OpenAI API ключ в Настройках.',
      aiParseFailed: 'Ошибка разбора ИИ',
      aiRequired: '(требуется ИИ)',
      optional: 'Необязательно',
      optionalDescription: 'Необязательно: Общее время, потраченное на тренировку, включая отдых',
      aiWillEstimate: 'ИИ автоматически оценит RPE и предоставит обратную связь после сохранения',
      estimatesWillBeCalculated: 'Оценки будут рассчитаны после сохранения',
      aiEstimationInProgress: 'ИИ оценка в процессе...',
      caloriesWillBeEstimated: 'Калории и длительность будут оценены автоматически',
      addAtLeastOneExercise: 'Пожалуйста, добавьте хотя бы одно упражнение',
      failedToSave: 'Не удалось сохранить тренировку'
    },

    // Workout Analysis
    workoutAnalysis: {
      enable: 'Анализировать тренировку ИИ',
      starting: 'Запускаем анализ ИИ…',
      ready: 'Анализ ИИ добавлен',
      error: 'Не удалось выполнить анализ ИИ',
      rpe: 'RPE (интенсивность)',
      feedbackTitle: 'Фидбэк от ИИ',
      update: 'Обновить анализ'
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
      rpe: 'RPE',
      rpeHint: 'RPE — субъективная оценка интенсивности (1–10)',
      aiFeedback: 'Фидбэк от AI',
      updateAnalysis: 'Обновить анализ',
      analysisUpdated: 'Анализ обновлён',
      caloriesSplit: 'Распределение калорий',
      durationByExercise: 'Продолжительность по упражнениям',
      noAnalytics: 'Недостаточно данных для аналитики',
      noAnalysis: 'Анализ ещё не выполнялся. Нажмите «Обновить анализ».',
      editExercise: 'Редактировать упражнение',
      databaseError: 'Ошибка базы данных: Обновите страницу и попробуйте снова',
      databaseUpdated: 'База данных обновлена. Попробуйте снова',
      invalidApiKey: 'Неверный API ключ. Проверьте настройки',
      rateLimitExceeded: 'Превышен лимит запросов. Попробуйте позже',
      networkError: 'Ошибка сети. Проверьте подключение',
      holds: 'удержаний',
      minutes: 'минут',
      for: 'в течение',
      // New refactored UI keys
      metrics: {
        calories: 'Всего калорий',
        duration: 'Длительность (минуты)',
        exercises: 'Упражнения',
        rpe: 'RPE (1–10)',
        rpeSourceAI: 'Источник: ИИ',
        rpeSourceManual: 'Источник: вручную'
      },
      actions: {
        updateAnalysis: 'Обновить анализ',
        recalcEstimates: 'Пересчитать AI-оценки',
        editMeta: 'Изменить дату/длительность/RPE',
        toWeek: 'К неделе',
        prev: 'Предыдущая',
        next: 'Следующая'
      },
      nav: {
        prev: 'Предыдущая тренировка',
        next: 'Следующая тренировка'
      },
      ai: {
        feedback: 'Фидбэк от ИИ',
        model: 'Модель',
        updated: 'обновлено',
        notRun: 'Анализ ещё не выполнялся. Нажмите «Обновить анализ».',
        badgeAI: 'Оценено ИИ'
      },
      analytics: {
        title: 'Аналитика тренировки',
        caloriesSplit: 'Распределение калорий',
        durationByExercise: 'Продолжительность по упражнениям',
        empty: 'Недостаточно данных для аналитики.',
        ctaRecalc: 'Пересчитать AI-оценки'
      },
      exercise: {
        edit: 'Редактировать',
        sets: 'подходов',
        reps: 'повт.',
        holds: 'удержания',
        sec: 'сек',
        km: 'км',
        min: 'мин'
      },
      metaModal: {
        title: 'Изменить мета-данные тренировки',
        date: 'Дата',
        durationMin: 'Длительность (мин)',
        rpe: 'RPE (1–10)',
        cancel: 'Отмена',
        save: 'Сохранить',
        saved: 'Данные обновлены'
      },
      workoutUpdated: 'Тренировка успешно обновлена',
      exerciseUpdated: 'Упражнение успешно обновлено',
      updateFailed: 'Не удалось обновить',
      editWorkout: 'Редактировать тренировку',
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
