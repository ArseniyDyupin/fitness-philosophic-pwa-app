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
    onboarding: 'Onboarding',
    welcome: 'Welcome to AI Trainer',
    welcomeSubtitle: 'Let\'s set up your fitness profile',
    aiTrainer: 'AI Trainer',
    next: 'Next',
    previous: 'Previous',
    
    // Workouts
    workout: 'Workout',
    addWorkout: 'Add Workout',
    editWorkout: 'Edit Workout',
    noWorkoutsFound: 'No workouts found',
    addFirstWorkout: 'Add your first workout',
    
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
    
    // Units
    minutes: 'minutes',
    km: 'km',
    calories: 'calories',
    
    // AI
    analyzeWithAI: 'Analyze with AI',
    analyzing: 'Analyzing...',
    
    // Common actions
    viewDetails: 'View Details',
    
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
    onboarding: 'Настройка',
    welcome: 'Добро пожаловать в AI Тренер',
    welcomeSubtitle: 'Давайте настроим ваш фитнес-профиль',
    aiTrainer: 'AI Тренер',
    next: 'Далее',
    previous: 'Назад',
    
    // Workouts
    workout: 'Тренировка',
    addWorkout: 'Добавить тренировку',
    editWorkout: 'Редактировать тренировку',
    noWorkoutsFound: 'Тренировки не найдены',
    addFirstWorkout: 'Добавить первую тренировку',
    
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
    
    // Units
    minutes: 'минут',
    km: 'км',
    calories: 'калории',
    
    // AI
    analyzeWithAI: 'Анализировать с AI',
    analyzing: 'Анализирую...',
    
    // Common actions
    viewDetails: 'Подробнее',
    
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
