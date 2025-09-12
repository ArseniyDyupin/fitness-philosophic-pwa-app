import { z } from 'zod'

// Common validation schemas
export const nameSchema = z.string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя не должно превышать 50 символов')
  .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя может содержать только буквы и пробелы')

export const ageSchema = z.number()
  .int('Возраст должен быть целым числом')
  .min(13, 'Минимальный возраст: 13 лет')
  .max(120, 'Максимальный возраст: 120 лет')

export const heightSchema = z.number()
  .min(100, 'Минимальный рост: 100 см')
  .max(250, 'Максимальный рост: 250 см')

export const weightSchema = z.number()
  .min(30, 'Минимальный вес: 30 кг')
  .max(300, 'Максимальный вес: 300 кг')

export const goalSchema = z.string()
  .min(10, 'Цель должна содержать минимум 10 символов')
  .max(500, 'Цель не должна превышать 500 символов')

// Profile validation schema
export const profileSchema = z.object({
  name: nameSchema,
  age: ageSchema,
  height: heightSchema,
  weight: weightSchema,
  goal: goalSchema,
  language: z.enum(['en', 'ru']),
  gender: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  equipment: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  preferences: z.object({
    workoutDuration: z.number().min(15).max(180).optional(),
    workoutFrequency: z.number().min(1).max(7).optional(),
    preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  }).optional(),
})

// Workout validation schemas
export const exerciseSchema = z.object({
  name: z.string().min(1, 'Название упражнения обязательно'),
  sets: z.number().int().min(1, 'Минимум 1 подход').max(20, 'Максимум 20 подходов'),
  reps: z.number().int().min(1, 'Минимум 1 повторение').max(100, 'Максимум 100 повторений'),
  weight: z.number().min(0, 'Вес не может быть отрицательным').max(1000, 'Максимальный вес: 1000 кг'),
  duration: z.number().min(1, 'Минимальная длительность: 1 секунда').max(3600, 'Максимальная длительность: 1 час').optional(),
  rpe: z.number().min(1, 'RPE должен быть от 1 до 10').max(10, 'RPE должен быть от 1 до 10').optional(),
  notes: z.string().max(500, 'Заметки не должны превышать 500 символов').optional(),
})

export const workoutSchema = z.object({
  name: z.string().min(1, 'Название тренировки обязательно'),
  date: z.date(),
  exercises: z.array(exerciseSchema).min(1, 'Тренировка должна содержать минимум 1 упражнение'),
  notes: z.string().max(1000, 'Заметки не должны превышать 1000 символов').optional(),
  duration: z.number().min(1, 'Минимальная длительность: 1 минута').max(300, 'Максимальная длительность: 5 часов').optional(),
  rpe: z.number().min(1, 'RPE должен быть от 1 до 10').max(10, 'RPE должен быть от 1 до 10').optional(),
  isCompleted: z.boolean().optional(),
})

// Body metrics validation schema
export const bodyMetricsSchema = z.object({
  date: z.date(),
  weight: weightSchema,
  bodyFat: z.number().min(0, 'Процент жира не может быть отрицательным').max(50, 'Максимальный процент жира: 50%').optional(),
  muscleMass: z.number().min(0, 'Мышечная масса не может быть отрицательной').max(200, 'Максимальная мышечная масса: 200 кг').optional(),
  waist: z.number().min(30, 'Минимальная окружность талии: 30 см').max(200, 'Максимальная окружность талии: 200 см').optional(),
  chest: z.number().min(30, 'Минимальная окружность груди: 30 см').max(200, 'Максимальная окружность груди: 200 см').optional(),
  arms: z.number().min(10, 'Минимальная окружность рук: 10 см').max(100, 'Максимальная окружность рук: 100 см').optional(),
  thighs: z.number().min(20, 'Минимальная окружность бедер: 20 см').max(150, 'Максимальная окружность бедер: 150 см').optional(),
  notes: z.string().max(500, 'Заметки не должны превышать 500 символов').optional(),
})

// AI request validation schemas
export const aiWorkoutRequestSchema = z.object({
  goal: z.string().min(10, 'Цель должна содержать минимум 10 символов').max(1000, 'Цель не должна превышать 1000 символов'),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  duration: z.number().min(15, 'Минимальная длительность: 15 минут').max(180, 'Максимальная длительность: 3 часа'),
  frequency: z.number().min(1, 'Минимальная частота: 1 раз в неделю').max(7, 'Максимальная частота: 7 раз в неделю'),
  preferences: z.string().max(500, 'Предпочтения не должны превышать 500 символов').optional(),
})

export const aiReviewRequestSchema = z.object({
  workout: workoutSchema,
  userFeedback: z.string().max(1000, 'Отзыв не должен превышать 1000 символов').optional(),
})

// Settings validation schemas
export const settingsSchema = z.object({
  language: z.enum(['en', 'ru']),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    enabled: z.boolean(),
    workoutReminders: z.boolean().optional(),
    progressUpdates: z.boolean().optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-5]$/, 'Неверный формат времени').optional(),
  }).optional(),
  privacy: z.object({
    dataSharing: z.boolean().optional(),
    analytics: z.boolean().optional(),
  }).optional(),
  ai: z.object({
    enabled: z.boolean(),
    model: z.string().optional(),
    apiKey: z.string().min(1, 'API ключ обязателен').optional(),
  }).optional(),
})

// Export/Import validation schemas
export const exportDataSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  data: z.object({
    profile: profileSchema.optional(),
    workouts: z.array(workoutSchema).optional(),
    bodyMetrics: z.array(bodyMetricsSchema).optional(),
    settings: settingsSchema.optional(),
  }),
})

// Form validation helpers
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown): { success: boolean; error?: string } => {
  try {
    schema.parse(value)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message }
    }
    return { success: false, error: 'Неизвестная ошибка валидации' }
  }
}

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Неизвестная ошибка валидации' } }
  }
}

// Type exports
export type ProfileFormData = z.infer<typeof profileSchema>
export type WorkoutFormData = z.infer<typeof workoutSchema>
export type ExerciseFormData = z.infer<typeof exerciseSchema>
export type BodyMetricsFormData = z.infer<typeof bodyMetricsSchema>
export type AIWorkoutRequestData = z.infer<typeof aiWorkoutRequestSchema>
export type AIReviewRequestData = z.infer<typeof aiReviewRequestSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type ExportData = z.infer<typeof exportDataSchema>
