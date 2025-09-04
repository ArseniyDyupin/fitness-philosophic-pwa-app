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
    home: 'Home',
    
    // Navigation
    workouts: 'Workouts',
    food: 'Food',
    weekly: 'Weekly',
    settings: 'Settings',
    
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
        selectGoals: 'Select your primary fitness goals',
        additionalDetails: 'Additional Details (Optional)',
        descriptionPlaceholder: 'Tell us more about your specific goals...',
        namePlaceholder: 'Enter your name',
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
        successMessage: 'We\'ll use this information to create more personalized workout recommendations and track your progress toward these specific goals.'
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
    importProfile: 'Import Profile'
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
    home: 'Главная',
    
    // Navigation
    workouts: 'Тренировки',
    food: 'Питание',
    weekly: 'Неделя',
    settings: 'Настройки',
    
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
        selectGoals: 'Выберите ваши основные фитнес-цели',
        additionalDetails: 'Дополнительные детали (Необязательно)',
        descriptionPlaceholder: 'Расскажите нам больше о ваших конкретных целях...',
        namePlaceholder: 'Введите ваше имя',
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
    importProfile: 'Импорт профиля'
  }
}

// Hook to get translations
export const useTranslations = () => {
  const { currentLanguage } = useI18nStore()
  return translations[currentLanguage]
}
