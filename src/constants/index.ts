// App Configuration
export const APP_CONFIG = {
  NAME: 'AI Trainer',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered fitness trainer with workout tracking and analytics',
  THEME_COLOR: '#3B82F6',
  DEFAULT_LANGUAGE: 'en' as const,
  SUPPORTED_LANGUAGES: ['en', 'ru'] as const,
} as const

// API Configuration
export const API_CONFIG = {
  OPENAI_BASE_URL: 'https://api.openai.com/v1/chat/completions',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Cache Configuration
export const CACHE_CONFIG = {
  STATS_TTL: 5 * 60 * 1000, // 5 minutes
  PROFILE_TTL: 10 * 60 * 1000, // 10 minutes
  WORKOUTS_TTL: 2 * 60 * 1000, // 2 minutes
  MAX_CACHE_SIZE: 100,
} as const

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3500, // 3.5 seconds
  ANIMATION_DURATION: 300, // 0.3 seconds
  SKELETON_ANIMATION_DURATION: 1000, // 1 second
  PAGE_TRANSITION_DURATION: 300, // 0.3 seconds
  DEBOUNCE_DELAY: 300, // 0.3 seconds
} as const

// Validation Configuration
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_AGE: 13,
  MAX_AGE: 120,
  MIN_HEIGHT: 100, // cm
  MAX_HEIGHT: 250, // cm
  MIN_WEIGHT: 30, // kg
  MAX_WEIGHT: 300, // kg
  MAX_WORKOUT_NOTES_LENGTH: 1000,
  MAX_EXERCISE_NOTES_LENGTH: 500,
} as const

// Workout Configuration
export const WORKOUT_CONFIG = {
  DEFAULT_RPE: 5,
  MIN_RPE: 1,
  MAX_RPE: 10,
  DEFAULT_SETS: 3,
  MIN_SETS: 1,
  MAX_SETS: 20,
  DEFAULT_REPS: 10,
  MIN_REPS: 1,
  MAX_REPS: 100,
  DEFAULT_WEIGHT: 0,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 1000, // kg
  DEFAULT_DURATION: 60, // seconds
  MIN_DURATION: 1,
  MAX_DURATION: 3600, // 1 hour
} as const

// AI Configuration
export const AI_CONFIG = {
  DEFAULT_MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  MAX_PROMPT_LENGTH: 8000,
  RATE_LIMIT_REQUESTS: 10, // requests per minute
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
} as const

// Database Configuration
export const DB_CONFIG = {
  VERSION: 1,
  MAX_RECORDS_PER_TABLE: 10000,
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const

// Export/Import Configuration
export const EXPORT_CONFIG = {
  SCHEMA_VERSION: 1,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['json'] as const,
  BACKUP_RETENTION_DAYS: 30,
} as const

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  LAZY_LOAD_THRESHOLD: 100, // pixels
  VIRTUAL_SCROLL_THRESHOLD: 100, // items
  DEBOUNCE_SEARCH_DELAY: 300, // ms
  THROTTLE_SCROLL_DELAY: 16, // ms (60fps)
  MAX_CONCURRENT_REQUESTS: 5,
} as const

// Security Configuration
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  ENCRYPTION_KEY_LENGTH: 32,
} as const

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  SAMPLE_RATE: 0.1, // 10% of users
  BATCH_SIZE: 50,
  FLUSH_INTERVAL: 30 * 1000, // 30 seconds
  MAX_EVENTS_PER_SESSION: 1000,
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  AI_WORKOUT_GENERATION: true,
  AI_BODY_ANALYSIS: true,
  AI_FEEDBACK: true,
  EXPORT_IMPORT: true,
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: false,
  SOCIAL_FEATURES: false,
  PREMIUM_FEATURES: false,
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  WORKOUTS: '/workouts',
  WORKOUT_DETAILS: '/workouts/:id',
  PLAN_REALIZATION: '/plan/:planId',
  FOOD: '/food',
  STATS: '/stats',
  SETTINGS: '/settings',
  LANGUAGE_SELECTION: '/language',
  ENTRY_STEP: '/entry',
  ONBOARDING_GOALS: '/onboarding/goals',
  ONBOARDING_CONSTRAINTS: '/onboarding/constraints',
  ONBOARDING_DETAILED_GOALS: '/onboarding/detailed-goals',
  ONBOARDING_EQUIPMENT: '/onboarding/equipment',
  ONBOARDING_METRICS: '/onboarding/metrics',
  ONBOARDING_FREQUENCY: '/onboarding/frequency',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME: 'theme',
  USER_PREFERENCES: 'userPreferences',
  CACHE_PREFIX: 'ai-trainer-cache-',
  OFFLINE_DATA: 'offlineData',
  LAST_SYNC: 'lastSync',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Data saved successfully',
  DELETED: 'Item deleted successfully',
  UPDATED: 'Data updated successfully',
  CREATED: 'Item created successfully',
  EXPORTED: 'Data exported successfully',
  IMPORTED: 'Data imported successfully',
  SYNCED: 'Data synchronized successfully',
} as const
