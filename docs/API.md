# API Документация

## 📋 Обзор

Документация описывает все API сервисы, их методы и типы данных.

## 🏗️ Архитектура API

### Структура сервисов
```
src/services/
├── ai/                    # AI сервисы
│   ├── ai.ts             # Основной AI сервис
│   ├── ai.estimate.ts    # Оценка упражнений
│   ├── ai.review.ts      # Анализ тренировок
│   ├── aiBody.service.ts # Анализ тела
│   └── rateLimiter.ts    # Ограничение запросов
├── data/                  # Работа с данными
│   ├── db.ts             # База данных
│   ├── export.ts         # Экспорт данных
│   └── import.ts         # Импорт данных
└── fitness/               # Фитнес расчеты
    ├── kcal.ts           # Расчет калорий
    └── metrics.service.ts # Метрики
```

## 🤖 AI Сервисы

### AIService
Основной сервис для работы с OpenAI API.

```tsx
import { aiService } from '@/services/ai'

// Инициализация с API ключом
await aiService.initializeApiKey('your-api-key')

// Генерация тренировки
const workout = await aiService.generateWorkout({
  goal: 'strength',
  duration: 60,
  equipment: ['dumbbells', 'barbell'],
  experience: 'intermediate',
  language: 'ru'
})
```

**Методы:**
- `initializeApiKey(key: string)` - инициализация API ключа
- `generateWorkout(params: WorkoutParams)` - генерация тренировки
- `reviewWorkout(workout: Workout)` - анализ тренировки
- `estimateExercise(exercise: Exercise)` - оценка упражнения

### AIReviewService
Сервис для анализа и рецензирования тренировок.

```tsx
import { aiReviewService } from '@/services/ai'

const review = await aiReviewService.reviewWorkout(workout, {
  language: 'ru',
  focus: 'form' // 'form' | 'progress' | 'safety'
})
```

**Типы рецензий:**
- `form` - анализ техники выполнения
- `progress` - анализ прогресса
- `safety` - анализ безопасности

### AI Body Service
Сервис для анализа метрик тела.

```tsx
import { aiBodyService } from '@/services/ai'

const analysis = await aiBodyService.analyzeBodyMetrics({
  weight: 70,
  height: 175,
  bodyFat: 15,
  muscleMass: 60
})
```

### Rate Limiter
Система ограничения запросов к AI API.

```tsx
import { aiRateLimiter, useRateLimit } from '@/services/ai'

// Проверка лимита
if (!aiRateLimiter.isAllowed('user-123')) {
  throw new Error('Rate limit exceeded')
}

// Хук для отслеживания лимита
const { isAllowed, timeUntilReset } = useRateLimit('user-123')
```

**Конфигурация:**
- Лимит: 10 запросов в минуту
- Окно: 60 секунд
- Автоочистка старых записей

## 💾 Data Сервисы

### Database (Dexie)
Основной сервис для работы с IndexedDB.

```tsx
import { db, dbHelpers } from '@/services/data'

// Получение тренировок
const workouts = await db.workouts.toArray()

// Добавление тренировки
const id = await db.workouts.add(workout)

// Обновление тренировки
await db.workouts.update(id, updates)

// Удаление тренировки
await db.workouts.delete(id)

// Хелперы
const recentWorkouts = await dbHelpers.getRecentWorkouts(7)
const workoutsByDate = await dbHelpers.getWorkoutsByDateRange(start, end)
```

**Таблицы:**
- `workouts` - тренировки
- `exercises` - упражнения
- `profiles` - профили пользователей
- `bodyMetrics` - метрики тела
- `plans` - планы тренировок

### Export Service
Сервис для экспорта данных.

```tsx
import { exportAll, downloadExport } from '@/services/data'

// Экспорт всех данных
const exportData = await exportAll()

// Скачивание файла
downloadExport(exportData, 'fitness-backup.json')
```

**Формат экспорта:**
```json
{
  "version": "1.0",
  "exportDate": "2024-01-01T00:00:00Z",
  "data": {
    "workouts": [...],
    "exercises": [...],
    "profiles": [...],
    "bodyMetrics": [...]
  }
}
```

### Import Service
Сервис для импорта данных.

```tsx
import { validateFile, importData, getImportPreview } from '@/services/data'

// Валидация файла
const validation = await validateFile(file)
if (!validation.isValid) {
  throw new Error(validation.error)
}

// Предварительный просмотр
const preview = await getImportPreview(file)

// Импорт данных
const result = await importData(file, {
  mergeStrategy: 'replace', // 'replace' | 'merge' | 'skip'
  validateData: true
})
```

## 🏋️ Fitness Сервисы

### Calorie Calculator
Сервис для расчета калорий.

```tsx
import {
  calculateExerciseCalories,
  calculateWorkoutCalories,
  calculateWorkoutDuration,
  sumWorkoutKcal,
  sumWorkoutMinutes,
  getWorkoutTotalCalories,
  getWorkoutTotalDuration
} from '@/services/fitness'

// Расчет калорий для упражнения
const exerciseKcal = calculateExerciseCalories({
  exercise: 'push-ups',
  sets: 3,
  reps: 15,
  weight: 0, // для упражнений с весом тела
  userWeight: 70
})

// Расчет калорий для тренировки (включая override)
const workoutKcal = getWorkoutTotalCalories(workout, userWeight)

// Расчет продолжительности тренировки (включая override)
const duration = getWorkoutTotalDuration(workout)

// Суммирование калорий и времени
const totalKcal = sumWorkoutKcal(workouts)
const totalMinutes = sumWorkoutMinutes(workouts)
```

### Metrics Service
Сервис для работы с метриками.

```tsx
import { metricsService } from '@/services/fitness'

// Получение метрик пользователя
const metrics = await metricsService.getUserMetrics(userId)

// Обновление метрик
await metricsService.updateMetrics(userId, {
  weight: 75,
  bodyFat: 12,
  muscleMass: 65
})

// Расчет прогресса
const progress = metricsService.calculateProgress(oldMetrics, newMetrics)
```

## 📊 Типы данных

### Workout
```tsx
interface Workout {
  id?: number
  name: string
  date: string
  duration: number
  kcal: number
  rpe?: number
  notes?: string
  exercises: Exercise[]
  createdAt?: string
  updatedAt?: string
}
```

### Exercise
```tsx
interface Exercise {
  id?: number
  name: string
  sets: number
  reps: number
  weight: number
  rpe?: number
  notes?: string
  restTime?: number
  duration?: number
}
```

### Profile
```tsx
interface Profile {
  id?: number
  name: string
  age: number
  weight: number
  height: number
  goal: string
  language: 'en' | 'ru'
  aiApiKey?: string
  createdAt?: string
  updatedAt?: string
}
```

### BodyMetrics
```tsx
interface BodyMetrics {
  id?: number
  date: string
  weight: number
  bodyFat?: number
  muscleMass?: number
  waist?: number
  chest?: number
  arms?: number
  legs?: number
  notes?: string
}
```

## 🔄 Асинхронные операции

### Обработка ошибок
```tsx
try {
  const result = await aiService.generateWorkout(params)
  return result
} catch (error) {
  if (error.message.includes('Rate limit')) {
    // Обработка лимита запросов
    throw new Error('Превышен лимит запросов. Попробуйте позже.')
  } else if (error.message.includes('API key')) {
    // Обработка ошибки API ключа
    throw new Error('Неверный API ключ')
  } else {
    // Общая ошибка
    throw new Error('Произошла ошибка при генерации тренировки')
  }
}
```

### Retry логика
```tsx
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

## 🔒 Безопасность

### Валидация данных
```tsx
import { z } from 'zod'

const workoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  duration: z.number().positive(),
  exercises: z.array(exerciseSchema)
})

// Валидация перед сохранением
const validatedWorkout = workoutSchema.parse(workoutData)
```

### Rate Limiting
```tsx
// Ограничение запросов к AI API
const rateLimiter = new RateLimiter({
  limit: 10,
  windowMs: 60 * 1000 // 1 минута
})

if (!rateLimiter.isAllowed(userId)) {
  throw new Error('Rate limit exceeded')
}
```

## 📱 PWA интеграция

### Service Worker
```tsx
// Кэширование API ответов
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request)
      })
    )
  }
})
```

### Offline поддержка
```tsx
// Проверка онлайн статуса
if (navigator.onLine) {
  await syncData()
} else {
  // Работа в офлайн режиме
  await saveToLocalStorage(data)
}
```

## 🧪 Тестирование API

### Unit тесты
```tsx
import { aiService } from '@/services/ai'

describe('AIService', () => {
  test('should generate workout', async () => {
    const workout = await aiService.generateWorkout({
      goal: 'strength',
      duration: 60
    })
    
    expect(workout).toBeDefined()
    expect(workout.exercises).toHaveLength(5)
  })
})
```

### Integration тесты
```tsx
import { db } from '@/services/data'

describe('Database', () => {
  test('should save and retrieve workout', async () => {
    const workout = { name: 'Test Workout', exercises: [] }
    const id = await db.workouts.add(workout)
    
    const retrieved = await db.workouts.get(id)
    expect(retrieved.name).toBe('Test Workout')
  })
})
```

## 📈 Мониторинг

### Логирование
```tsx
// Логирование API вызовов
const logApiCall = (service: string, method: string, duration: number) => {
  console.log(`API Call: ${service}.${method} took ${duration}ms`)
}

// Метрики производительности
const startTime = performance.now()
const result = await apiCall()
const duration = performance.now() - startTime
logApiCall('ai', 'generateWorkout', duration)
```

### Error tracking
```tsx
// Отправка ошибок в систему мониторинга
const trackError = (error: Error, context: any) => {
  // Отправка в Sentry или другую систему
  console.error('API Error:', error, context)
}
```

---

*Документация обновлена: $(date)*
