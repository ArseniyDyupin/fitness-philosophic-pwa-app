# Custom Hooks

## 📋 Обзор

Модуль hooks содержит все кастомные React хуки для переиспользуемой логики приложения.

## 🏗️ Структура

```
hooks/
├── useStats.ts            # Статистика тренировок
├── useForm.ts             # Управление формами
├── useValidatedForm.ts    # Формы с Zod валидацией
├── useMemoized.ts         # Мемоизация
├── useWorkoutCrud.ts      # CRUD операции с тренировками
├── useGenerateWorkout.ts  # Генерация тренировок
├── useProfile.ts          # Работа с профилем
├── useExportImport.ts     # Экспорт/импорт данных
├── useOffline.ts          # Отслеживание сети
├── useDexieQuery.ts       # Работа с IndexedDB
└── index.ts              # Barrel exports
```

## 🔄 Основные хуки

### useStats
Универсальный хук для работы со статистикой тренировок с кэшированием.

```tsx
import { useStats, useTodayStats, useWeekStats } from '@/hooks'

// Основной хук с кэшированием
const { todayStats, weekStats, monthStats, yearStats } = useStats({
  includeIncomplete: false,
  userWeight: 70
})

// Удобные функции для конкретных периодов
const todayStats = useTodayStats()
const weekStats = useWeekStats(weekStart)
```

**Особенности:**
- ✅ Кэширование результатов (5 минут)
- ✅ Поддержка разных периодов
- ✅ Автоматическое обновление при изменении данных
- ✅ Оптимизированные вычисления

### useForm
Хук для управления формами с валидацией.

```tsx
import { useForm } from '@/hooks'

const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  setValues,
  setErrors,
  resetForm
} = useForm({
  initialValues: { name: '', email: '' },
  validationSchema: {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  },
  onSubmit: async (values) => {
    await saveUser(values)
  }
})
```

**Особенности:**
- ✅ Валидация в реальном времени
- ✅ Обработка ошибок
- ✅ Состояние отправки
- ✅ Сброс формы

### useValidatedForm
Улучшенный хук для форм с Zod валидацией.

```tsx
import { useValidatedForm } from '@/hooks'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email')
})

const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  validateForm,
  validateField
} = useValidatedForm({
  initialValues: { name: '', email: '' },
  validationSchema: schema,
  onSubmit: async (values) => {
    await saveUser(values)
  }
})
```

**Особенности:**
- ✅ Zod схемы для валидации
- ✅ Типизированные значения
- ✅ Валидация отдельных полей
- ✅ Интеграция с формами

## 🏋️ Фитнес хуки

### useWorkoutCrud
Хук для CRUD операций с тренировками.

```tsx
import { useWorkoutCrud } from '@/hooks'

const {
  workouts,
  loading,
  error,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutById
} = useWorkoutCrud()
```

**Методы:**
- `createWorkout(workout)` - создание тренировки
- `updateWorkout(id, updates)` - обновление тренировки
- `deleteWorkout(id)` - удаление тренировки
- `getWorkoutById(id)` - получение тренировки по ID

### useGenerateWorkout
Хук для генерации тренировок с помощью AI.

```tsx
import { useGenerateWorkout } from '@/hooks'

const {
  generateWorkout,
  loading,
  error,
  lastGenerated
} = useGenerateWorkout()

// Генерация тренировки
const workout = await generateWorkout({
  goal: 'strength',
  duration: 60,
  equipment: ['dumbbells', 'barbell'],
  experience: 'intermediate'
})
```

**Параметры генерации:**
- `goal`: string - цель тренировки
- `duration`: number - продолжительность в минутах
- `equipment`: string[] - доступное оборудование
- `experience`: string - уровень опыта

### useProfile
Хук для работы с профилем пользователя.

```tsx
import { useProfile } from '@/hooks'

const {
  profile,
  loading,
  error,
  updateProfile,
  saveProfile,
  loadProfile
} = useProfile()
```

## 🔧 Утилитарные хуки

### useMemoized
Хук для мемоизации вычислений.

```tsx
import { useMemoized, useDeepMemoized, useStableCallback } from '@/hooks'

// Обычная мемоизация
const expensiveValue = useMemoized(
  () => calculateExpensiveValue(data),
  [data]
)

// Глубокая мемоизация
const deepValue = useDeepMemoized(
  () => calculateDeepValue(complexData),
  [complexData]
)

// Стабильный колбэк
const stableCallback = useStableCallback(
  (value) => handleValue(value),
  [dependency]
)
```

**Типы мемоизации:**
- `useMemoized` - обычная мемоизация
- `useDeepMemoized` - глубокая мемоизация
- `useStableCallback` - стабильный колбэк
- `useMemoizedWithTimeout` - мемоизация с таймаутом

### useExportImport
Хук для экспорта и импорта данных.

```tsx
import { useExportImport } from '@/hooks'

const {
  exportData,
  importData,
  loading,
  error
} = useExportImport()

// Экспорт данных
const handleExport = async () => {
  const data = await exportData()
  downloadFile(data, 'fitness-data.json')
}

// Импорт данных
const handleImport = async (file) => {
  const result = await importData(file)
  if (result.success) {
    console.log('Данные импортированы:', result.data)
  }
}
```

### useOffline
Хук для отслеживания состояния сети.

```tsx
import { useOffline } from '@/hooks'

const { isOffline, isOnline } = useOffline()

if (isOffline) {
  return <OfflineMessage />
}
```

### useDexieQuery
Хук для работы с IndexedDB через Dexie.

```tsx
import { useDexieQuery } from '@/hooks'

const { data, loading, error, refetch } = useDexieQuery(
  () => db.workouts.where('date').between(startDate, endDate).toArray(),
  [startDate, endDate]
)
```

## 🎯 Паттерны использования

### Комбинирование хуков
```tsx
function WorkoutPage() {
  const { workouts, createWorkout } = useWorkoutCrud()
  const { generateWorkout } = useGenerateWorkout()
  const { todayStats } = useTodayStats()
  
  const handleGenerate = async () => {
    const workout = await generateWorkout({
      goal: 'strength',
      duration: 45
    })
    await createWorkout(workout)
  }
  
  return (
    <div>
      <StatsDisplay stats={todayStats} />
      <WorkoutList workouts={workouts} />
      <Button onClick={handleGenerate}>
        Сгенерировать тренировку
      </Button>
    </div>
  )
}
```

### Обработка ошибок
```tsx
function ProfileForm() {
  const { updateProfile } = useProfile()
  const { execute, loading, error } = useAsync(
    updateProfile,
    {
      onError: (error) => {
        toast.error(`Ошибка сохранения: ${error.message}`)
      }
    }
  )
  
  const handleSubmit = async (values) => {
    await execute(values)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage error={error} />}
      <Button type="submit" loading={loading}>
        Сохранить
      </Button>
    </form>
  )
}
```

### Оптимизация производительности
```tsx
function ExpensiveComponent({ data }) {
  // Мемоизация тяжелых вычислений
  const processedData = useMemoized(
    () => processLargeDataset(data),
    [data]
  )
  
  // Стабильный колбэк для предотвращения лишних рендеров
  const handleClick = useStableCallback(
    (item) => handleItemClick(item),
    [processedData]
  )
  
  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} onClick={handleClick} />
      ))}
    </div>
  )
}
```

## 🧪 Тестирование хуков

### Тестирование с React Testing Library
```tsx
import { renderHook, act } from '@testing-library/react'
import { useStats } from '@/hooks'

test('useStats returns correct data', async () => {
  const { result } = renderHook(() => useStats())
  
  expect(result.current.todayStats).toBeDefined()
  expect(result.current.weekStats).toBeDefined()
})
```

### Мокирование зависимостей
```tsx
import { useWorkoutCrud } from '@/hooks'

// Мок для тестов
jest.mock('@/services/data', () => ({
  db: {
    workouts: {
      toArray: jest.fn().mockResolvedValue([]),
      add: jest.fn().mockResolvedValue(1)
    }
  }
}))
```

## 📝 Создание нового хука

### Структура хука
```tsx
// src/hooks/useNewHook.ts
import { useState, useEffect, useCallback } from 'react'

interface UseNewHookOptions {
  initialValue?: string
  onSuccess?: (data: any) => void
}

interface UseNewHookReturn {
  data: any
  loading: boolean
  error: Error | null
  execute: () => Promise<void>
  reset: () => void
}

export function useNewHook(options: UseNewHookOptions = {}): UseNewHookReturn {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await someAsyncOperation()
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [options])
  
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])
  
  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}
```

### Добавление в barrel export
```tsx
// src/hooks/index.ts
export { useNewHook } from './useNewHook'
export type { UseNewHookOptions, UseNewHookReturn } from './useNewHook'
```

## 🔄 Лучшие практики

### 1. Именование
- Используйте префикс `use` для всех хуков
- Имена должны быть описательными
- Группируйте связанные хуки

### 2. Типизация
- Всегда типизируйте параметры и возвращаемые значения
- Используйте интерфейсы для сложных типов
- Экспортируйте типы для переиспользования

### 3. Производительность
- Используйте `useCallback` для стабильных функций
- Применяйте мемоизацию для тяжелых вычислений
- Избегайте лишних ре-рендеров

### 4. Обработка ошибок
- Всегда обрабатывайте ошибки
- Предоставляйте понятные сообщения об ошибках
- Логируйте ошибки для отладки

### 5. Тестирование
- Покрывайте хуки unit тестами
- Тестируйте различные сценарии
- Мокайте внешние зависимости

## 📚 Дополнительная документация

- [Архитектура](../../docs/ARCHITECTURE.md)
- [Хуки](../../docs/HOOKS.md)
- [API](../../docs/API.md)

---

*Документация обновлена: $(date)*
