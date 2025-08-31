import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Language = 'en' | 'ru'

export const useI18nStore = defineStore('i18n', () => {
  const currentLanguage = ref<Language>('en')

  // Translations
  const translations = {
    en: {
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
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
      
      // Navigation
      home: 'Home',
      workouts: 'Workouts',
      food: 'Food',
      weekly: 'Weekly',
      settings: 'Settings',
      
      // Profile
      profile: 'Profile',
      name: 'Name',
      age: 'Age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      goal: 'Goal',
      goalDescription: 'Goal Description',
      saveProfile: 'Save Profile',
      saving: 'Saving...',
      profileUpdated: 'Profile updated successfully!',
      profileUpdateFailed: 'Failed to save profile. Please try again.',
      
      // Goals
      weightLoss: 'Weight Loss',
      muscleGain: 'Muscle Gain',
      endurance: 'Endurance',
      strength: 'Strength',
      generalFitness: 'General Fitness',
      
      // AI Settings
      aiSettings: 'AI Settings',
      openaiApiKey: 'OpenAI API Key',
      test: 'Test',
      testing: 'Testing...',
      connectionStatus: 'Connection Status',
      notConfigured: 'Not configured',
      apiKeySet: 'API key set',
      connected: 'Connected ✓',
      connectionFailed: 'Connection failed ✗',
      clearKey: 'Clear Key',
      aiConnectionSuccess: 'AI connection successful!',
      aiConnectionFailed: 'AI connection failed. Please check your API key.',
      apiKeyCleared: 'API key cleared',
      
      // Data Management
      dataManagement: 'Data Management',
      exportData: 'Export Data',
      importData: 'Import Data',
      resetAllData: 'Reset All Data',
      resetting: 'Resetting...',
      confirmReset: 'Confirm Reset',
      resetDescription: 'This will permanently delete all your data:',
      resetItems: [
        'All workouts',
        'All food logs',
        'All weekly check-ins',
        'All AI plans',
        'Your profile settings'
      ],
      resetWarning: 'This action cannot be undone!',
      allDataReset: 'All data has been reset',
      resetFailed: 'Failed to reset data. Please try again.',
      
      // Workouts
      workout: 'Workout',
      addWorkout: 'Add Workout',
      editWorkout: 'Edit Workout',
      workoutType: 'Workout Type',
      duration: 'Duration (min)',
      calories: 'Calories',
      notes: 'Notes',
      date: 'Date',
      run: 'Run',
      pullups: 'Pull-ups',
      pushups: 'Push-ups',
      plank: 'Plank',
      custom: 'Custom',
      distance: 'Distance (km)',
      reps: 'Reps',
      sets: 'Sets',
      workoutWeight: 'Weight (kg)',
      customExercise: 'Custom Exercise',
      noWorkoutsFound: 'No workouts found',
      workoutDetails: 'Workout Details',
      workoutAnalysis: 'Workout Analysis',
      nextWorkoutRecommendation: 'Next Workout Recommendation',
      analyzeWorkout: 'Analyze Workout',
      analyzing: 'Analyzing...',
      workoutAnalyzed: 'Workout analyzed successfully!',
      workoutAnalysisFailed: 'Failed to analyze workout. Please try again.',
      
      // Food
      foodLog: 'Food Log',
      addFoodLog: 'Add Food Log',
      editFoodLog: 'Edit Food Log',
      protein: 'Protein (g)',
      carbs: 'Carbs (g)',
      fat: 'Fat (g)',
      noFoodLogsFound: 'No food logs found',
      dailyCalories: 'Daily Calories',
      weeklyCalories: 'Weekly Calories',
      calorieGoal: 'Calorie Goal',
      calorieBalance: 'Calorie Balance',
      
      // Weekly
      weeklyCheckin: 'Weekly Check-in',
      weeklyWeight: 'Weight',
      waist: 'Waist (cm)',
      photo: 'Photo',
      allowPhotoInAI: 'Allow photo in AI analysis',
      takePhoto: 'Take Photo',
      retakePhoto: 'Retake Photo',
      weeklySummary: 'Weekly Summary',
      weightTrend: 'Weight Trend',
      weeklyAdvice: 'Weekly Advice',
      getWeeklyAdvice: 'Get Weekly Advice',
      gettingAdvice: 'Getting advice...',
      weeklyAdviceReceived: 'Weekly advice received!',
      weeklyAdviceFailed: 'Failed to get weekly advice. Please try again.',
      noWeeklyCheckinsFound: 'No weekly check-ins found',
      
      // Home
      dailySummary: 'Daily Summary',
      quickActions: 'Quick Actions',
      nextWorkout: 'Next Workout',
      recentWorkouts: 'Recent Workouts',
      noWorkouts: 'No workouts yet',
      addFirstWorkout: 'Add your first workout',
      todayCalories: 'Today\'s Calories',
      thisWeekCalories: 'This Week\'s Calories',
      startWorkout: 'Start Workout',
      logFood: 'Log Food',
      homeWeeklyCheckin: 'Weekly Check-in',
      
      // Onboarding
      onboarding: 'Onboarding',
      welcome: 'Welcome to AI Trainer',
      welcomeSubtitle: 'Let\'s set up your fitness profile',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      
      // Onboarding Goals
      whatIsYourGoal: 'What is your main fitness goal?',
      selectYourGoal: 'Select your primary goal',
      describeYourGoal: 'Describe your goal in detail',
      goalPlaceholder: 'Tell us more about your fitness goals...',
      
      // Onboarding Constraints
      healthConstraints: 'Health Constraints',
      doYouHaveConstraints: 'Do you have any health constraints?',
      constraintsDescription: 'This helps us create safer workout plans',
      addConstraint: 'Add Constraint',
      constraintPlaceholder: 'e.g., knee injury, back pain, etc.',
      
      // Onboarding Equipment
      availableEquipment: 'Available Equipment',
      whatEquipment: 'What equipment do you have access to?',
      equipmentDescription: 'Select all that apply',
      noEquipment: 'No Equipment',
      dumbbells: 'Dumbbells',
      resistanceBands: 'Resistance Bands',
      pullUpBar: 'Pull-up Bar',
      yogaMat: 'Yoga Mat',
      treadmill: 'Treadmill',
      otherEquipment: 'Other',
      
      // Onboarding Metrics
      personalMetrics: 'Personal Metrics',
      enterYourMetrics: 'Please enter your personal metrics',
      metricsDescription: 'This helps us calculate calories and create personalized plans',
      
      // Onboarding Frequency
      workoutFrequency: 'Workout Frequency',
      howOften: 'How often do you want to work out?',
      frequencyDescription: 'Select your preferred workout frequency',
      timesPerWeek: 'times per week',
      workoutDuration: 'How long do you want each workout to be?',
      durationDescription: 'Select your preferred workout duration',
      minutes: 'minutes',
      
      // Language
      language: 'Language',
      english: 'English',
      russian: 'Russian',
      
      // Not Found
      pageNotFound: 'Page Not Found',
      pageNotFoundDescription: 'The page you are looking for does not exist.',
      goHome: 'Go Home',
      
      // Export/Import
      exportSuccess: 'Data exported successfully!',
      exportFailed: 'Failed to export data. Please try again.',
      importSuccess: 'Data imported successfully!',
      importFailed: 'Failed to import data. Please check your file.',
      importConfirmTitle: 'Import Data',
      importConfirmMessage: 'This will replace all your current data. Are you sure?',
      selectFile: 'Select File',
      
      // Photo
      cameraNotAvailable: 'Camera not available',
      photoCaptureFailed: 'Failed to capture photo',
      photoCompressionFailed: 'Failed to compress photo',
      photoTooLarge: 'Photo is too large',
      photoInvalid: 'Invalid photo format'
    },
    ru: {
      // Common
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
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
      
      // Navigation
      home: 'Главная',
      workouts: 'Тренировки',
      food: 'Питание',
      weekly: 'Неделя',
      settings: 'Настройки',
      
      // Profile
      profile: 'Профиль',
      name: 'Имя',
      age: 'Возраст',
      gender: 'Пол',
      male: 'Мужской',
      female: 'Женский',
      other: 'Другой',
      height: 'Рост (см)',
      weight: 'Вес (кг)',
      goal: 'Цель',
      goalDescription: 'Описание цели',
      saveProfile: 'Сохранить профиль',
      saving: 'Сохранение...',
      profileUpdated: 'Профиль успешно обновлен!',
      profileUpdateFailed: 'Не удалось сохранить профиль. Попробуйте еще раз.',
      
      // Goals
      weightLoss: 'Похудение',
      muscleGain: 'Набор мышечной массы',
      endurance: 'Выносливость',
      strength: 'Сила',
      generalFitness: 'Общая физическая форма',
      
      // AI Settings
      aiSettings: 'Настройки ИИ',
      openaiApiKey: 'OpenAI API ключ',
      test: 'Тест',
      testing: 'Тестирование...',
      connectionStatus: 'Статус подключения',
      notConfigured: 'Не настроено',
      apiKeySet: 'API ключ установлен',
      connected: 'Подключено ✓',
      connectionFailed: 'Подключение не удалось ✗',
      clearKey: 'Очистить ключ',
      aiConnectionSuccess: 'Подключение к ИИ успешно!',
      aiConnectionFailed: 'Подключение к ИИ не удалось. Проверьте API ключ.',
      apiKeyCleared: 'API ключ очищен',
      
      // Data Management
      dataManagement: 'Управление данными',
      exportData: 'Экспорт данных',
      importData: 'Импорт данных',
      resetAllData: 'Сбросить все данные',
      resetting: 'Сброс...',
      confirmReset: 'Подтвердить сброс',
      resetDescription: 'Это навсегда удалит все ваши данные:',
      resetItems: [
        'Все тренировки',
        'Все записи о питании',
        'Все недельные отчеты',
        'Все планы ИИ',
        'Настройки профиля'
      ],
      resetWarning: 'Это действие нельзя отменить!',
      allDataReset: 'Все данные сброшены',
      resetFailed: 'Не удалось сбросить данные. Попробуйте еще раз.',
      
      // Workouts
      workout: 'Тренировка',
      addWorkout: 'Добавить тренировку',
      editWorkout: 'Редактировать тренировку',
      workoutType: 'Тип тренировки',
      duration: 'Длительность (мин)',
      calories: 'Калории',
      notes: 'Заметки',
      date: 'Дата',
      run: 'Бег',
      pullups: 'Подтягивания',
      pushups: 'Отжимания',
      plank: 'Планка',
      custom: 'Своя',
      distance: 'Расстояние (км)',
      reps: 'Повторения',
      sets: 'Подходы',
      workoutWeight: 'Вес (кг)',
      customExercise: 'Свое упражнение',
      noWorkoutsFound: 'Тренировки не найдены',
      workoutDetails: 'Детали тренировки',
      workoutAnalysis: 'Анализ тренировки',
      nextWorkoutRecommendation: 'Рекомендация следующей тренировки',
      analyzeWorkout: 'Анализировать тренировку',
      analyzing: 'Анализ...',
      workoutAnalyzed: 'Тренировка успешно проанализирована!',
      workoutAnalysisFailed: 'Не удалось проанализировать тренировку. Попробуйте еще раз.',
      
      // Food
      foodLog: 'Запись о питании',
      addFoodLog: 'Добавить запись',
      editFoodLog: 'Редактировать запись',
      protein: 'Белки (г)',
      carbs: 'Углеводы (г)',
      fat: 'Жиры (г)',
      noFoodLogsFound: 'Записи о питании не найдены',
      dailyCalories: 'Дневные калории',
      weeklyCalories: 'Недельные калории',
      calorieGoal: 'Цель по калориям',
      calorieBalance: 'Баланс калорий',
      
      // Weekly
      weeklyCheckin: 'Недельный отчет',
      weeklyWeight: 'Вес',
      waist: 'Талия (см)',
      photo: 'Фото',
      allowPhotoInAI: 'Разрешить фото в анализе ИИ',
      takePhoto: 'Сделать фото',
      retakePhoto: 'Переснять фото',
      weeklySummary: 'Недельная сводка',
      weightTrend: 'Тренд веса',
      weeklyAdvice: 'Недельный совет',
      getWeeklyAdvice: 'Получить недельный совет',
      gettingAdvice: 'Получение совета...',
      weeklyAdviceReceived: 'Недельный совет получен!',
      weeklyAdviceFailed: 'Не удалось получить недельный совет. Попробуйте еще раз.',
      noWeeklyCheckinsFound: 'Недельные отчеты не найдены',
      
      // Home
      dailySummary: 'Дневная сводка',
      quickActions: 'Быстрые действия',
      nextWorkout: 'Следующая тренировка',
      recentWorkouts: 'Недавние тренировки',
      noWorkouts: 'Пока нет тренировок',
      addFirstWorkout: 'Добавьте первую тренировку',
      todayCalories: 'Калории за сегодня',
      thisWeekCalories: 'Калории за неделю',
      startWorkout: 'Начать тренировку',
      logFood: 'Записать питание',
      homeWeeklyCheckin: 'Недельный отчет',
      
      // Onboarding
      onboarding: 'Настройка',
      welcome: 'Добро пожаловать в AI Тренер',
      welcomeSubtitle: 'Давайте настроим ваш фитнес-профиль',
      next: 'Далее',
      previous: 'Назад',
      finish: 'Завершить',
      
      // Onboarding Goals
      whatIsYourGoal: 'Какова ваша основная фитнес-цель?',
      selectYourGoal: 'Выберите вашу основную цель',
      describeYourGoal: 'Опишите вашу цель подробно',
      goalPlaceholder: 'Расскажите больше о ваших фитнес-целях...',
      
      // Onboarding Constraints
      healthConstraints: 'Ограничения по здоровью',
      doYouHaveConstraints: 'Есть ли у вас ограничения по здоровью?',
      constraintsDescription: 'Это поможет нам создать более безопасные планы тренировок',
      addConstraint: 'Добавить ограничение',
      constraintPlaceholder: 'например, травма колена, боль в спине и т.д.',
      
      // Onboarding Equipment
      availableEquipment: 'Доступное оборудование',
      whatEquipment: 'Какое оборудование у вас есть?',
      equipmentDescription: 'Выберите все подходящие варианты',
      noEquipment: 'Нет оборудования',
      dumbbells: 'Гантели',
      resistanceBands: 'Резиновые ленты',
      pullUpBar: 'Турник',
      yogaMat: 'Коврик для йоги',
      treadmill: 'Беговая дорожка',
      otherEquipment: 'Другое',
      
      // Onboarding Metrics
      personalMetrics: 'Личные показатели',
      enterYourMetrics: 'Пожалуйста, введите ваши личные показатели',
      metricsDescription: 'Это поможет нам рассчитать калории и создать персонализированные планы',
      
      // Onboarding Frequency
      workoutFrequency: 'Частота тренировок',
      howOften: 'Как часто вы хотите тренироваться?',
      frequencyDescription: 'Выберите предпочитаемую частоту тренировок',
      timesPerWeek: 'раз в неделю',
      workoutDuration: 'Как долго должна длиться каждая тренировка?',
      durationDescription: 'Выберите предпочитаемую длительность тренировки',
      minutes: 'минут',
      
      // Language
      language: 'Язык',
      english: 'English',
      russian: 'Русский',
      
      // Not Found
      pageNotFound: 'Страница не найдена',
      pageNotFoundDescription: 'Страница, которую вы ищете, не существует.',
      goHome: 'На главную',
      
      // Export/Import
      exportSuccess: 'Данные успешно экспортированы!',
      exportFailed: 'Не удалось экспортировать данные. Попробуйте еще раз.',
      importSuccess: 'Данные успешно импортированы!',
      importFailed: 'Не удалось импортировать данные. Проверьте файл.',
      importConfirmTitle: 'Импорт данных',
      importConfirmMessage: 'Это заменит все ваши текущие данные. Вы уверены?',
      selectFile: 'Выбрать файл',
      
      // Photo
      cameraNotAvailable: 'Камера недоступна',
      photoCaptureFailed: 'Не удалось сделать фото',
      photoCompressionFailed: 'Не удалось сжать фото',
      photoTooLarge: 'Фото слишком большое',
      photoInvalid: 'Неверный формат фото'
    }
  }

  // Computed
  const t = computed(() => translations[currentLanguage.value])

  // Actions
  function setLanguage(lang: Language) {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }

  function loadLanguage() {
    const saved = localStorage.getItem('language') as Language
    if (saved && ['en', 'ru'].includes(saved)) {
      currentLanguage.value = saved
    }
  }

  return {
    currentLanguage,
    t,
    setLanguage,
    loadLanguage
  }
})
