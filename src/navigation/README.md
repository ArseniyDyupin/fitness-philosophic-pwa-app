# Navigation Module

## 📋 Обзор

Модуль navigation содержит всю логику навигации приложения, вынесенную из основного компонента `App.tsx` для лучшей организации кода.

## 🏗️ Структура

```
navigation/
├── AppRouter.tsx          # Роутеры для разных состояний приложения
├── Navigation.tsx         # Главный компонент навигации
├── useNavigationState.ts  # Хук для определения состояния навигации
├── index.ts              # Barrel exports
└── README.md             # Эта документация
```

## 🧩 Компоненты

### Navigation
Главный компонент навигации, который определяет, какой роутер отображать на основе текущего состояния приложения.

```tsx
import { Navigation } from '@/navigation'

function App() {
  return (
    <>
      <Header />
      <Navigation />
      <Toaster />
    </>
  )
}
```

**Функциональность:**
- Определение состояния навигации
- Отображение соответствующего роутера
- Обработка состояний загрузки

### AppRouter
Роутер для основного приложения (когда пользователь полностью настроен).

```tsx
import { AppRouter } from '@/navigation'

<AppRouter />
```

**Маршруты:**
- `/` - главная страница
- `/workouts` - список тренировок
- `/workouts/:id` - детали тренировки
- `/plan/:planId` - выполнение плана
- `/food` - питание
- `/stats` - статистика
- `/settings` - настройки
- `*` - 404 страница

**Особенности:**
- ✅ Lazy loading страниц
- ✅ Error boundaries
- ✅ Page transitions
- ✅ Suspense fallbacks

### OnboardingRouter
Роутер для процесса онбординга (когда профиль пользователя неполный).

```tsx
import { OnboardingRouter } from '@/navigation'

<OnboardingRouter />
```

**Маршруты:**
- `/` - шаг входа
- `/entry` - шаг входа
- `/onboarding/goals` - выбор целей
- `/onboarding/constraints` - ограничения
- `/onboarding/detailed-goals` - детальные цели
- `/onboarding/equipment` - оборудование
- `/onboarding/metrics` - метрики
- `/onboarding/frequency` - частота тренировок
- `*` - шаг входа (fallback)

### LanguageSelectionRouter
Роутер для выбора языка (для новых пользователей).

```tsx
import { LanguageSelectionRouter } from '@/navigation'

<LanguageSelectionRouter />
```

**Маршруты:**
- `/` - выбор языка
- `*` - выбор языка (fallback)

## 🔄 Хуки

### useNavigationState
Хук, который определяет текущее состояние навигации на основе:
- Первого запуска приложения
- Наличия профиля пользователя
- Полноты профиля
- Настроенного языка

```tsx
import { useNavigationState } from '@/navigation'

const {
  state,
  isFirstLaunch,
  isProfileComplete,
  isLanguageSet
} = useNavigationState()
```

**Возвращает:**
- `state`: Текущее состояние навигации
- `isFirstLaunch`: Флаг первого запуска
- `isProfileComplete`: Флаг полноты профиля
- `isLanguageSet`: Флаг настроенного языка

**Состояния навигации:**
- `'loading'` - загрузка данных приложения
- `'language-selection'` - выбор языка (новые пользователи)
- `'onboarding'` - процесс настройки профиля
- `'main-app'` - основное приложение

## 🎯 Логика состояний

### Определение состояния
```tsx
const getNavigationState = (): NavigationState => {
  if (isLoading) {
    return 'loading'
  }

  // Первый запуск - всегда показывать выбор языка
  if (isFirstLaunch) {
    return 'language-selection'
  }

  // Нет профиля - показать выбор языка
  if (!profile) {
    return 'language-selection'
  }

  // Профиль есть, но нет языка - показать выбор языка
  if (!profile.language) {
    return 'language-selection'
  }

  // Профиль неполный - показать онбординг
  if (!profile.name || !profile.age || !profile.height || !profile.weight || !profile.goal) {
    return 'onboarding'
  }

  // Профиль полный - показать основное приложение
  return 'main-app'
}
```

### Инициализация приложения
```tsx
useEffect(() => {
  const initializeApp = async () => {
    try {
      await Promise.all([
        initializeLanguage(),
        loadProfile()
      ])
      
      // Проверка первого запуска
      const hasLaunchedBefore = localStorage.getItem('ai-trainer:has-launched')
      if (hasLaunchedBefore) {
        setIsFirstLaunch(false)
      } else {
        localStorage.setItem('ai-trainer:has-launched', 'true')
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      setIsLoading(false)
    }
  }

  initializeApp()
}, [initializeLanguage, loadProfile])
```

## 🔄 Поток навигации

### Схема переходов
```
App Start
    ↓
Loading State
    ↓
First Launch? → Yes → Language Selection
    ↓ No
Profile Exists? → No → Language Selection
    ↓ Yes
Language Set? → No → Language Selection
    ↓ Yes
Profile Complete? → No → Onboarding
    ↓ Yes
Main App
```

### Условия переходов
1. **Loading** → **Language Selection**: Первый запуск или нет профиля
2. **Language Selection** → **Onboarding**: Язык выбран, но профиль неполный
3. **Onboarding** → **Main App**: Профиль полностью заполнен
4. **Main App** → **Onboarding**: Профиль стал неполным (редко)

## 🎨 UI интеграция

### Условное отображение Header
```tsx
function App() {
  const { state } = useNavigationState()

  return (
    <>
      {/* Показывать header только для основного приложения */}
      {state === 'main-app' && <Header />}
      
      <Navigation />
      <Toaster />
    </>
  )
}
```

### Loading состояния
```tsx
function Navigation() {
  const { state } = useNavigationState()

  if (state === 'loading') {
    return <SkeletonCard className="m-4" />
  }

  // ... остальная логика
}
```

## 🔧 Кастомизация

### Добавление нового состояния
```tsx
// 1. Добавить тип состояния
export type NavigationState = 
  | 'loading' 
  | 'language-selection' 
  | 'onboarding' 
  | 'main-app'
  | 'new-state' // Новое состояние

// 2. Добавить логику в useNavigationState
const getNavigationState = (): NavigationState => {
  // ... существующая логика
  
  if (someCondition) {
    return 'new-state'
  }
  
  return 'main-app'
}

// 3. Создать новый роутер
export function NewStateRouter() {
  return (
    <Routes>
      <Route path="/" element={<NewStatePage />} />
      <Route path="*" element={<NewStatePage />} />
    </Routes>
  )
}

// 4. Добавить в Navigation компонент
if (state === 'new-state') {
  return <NewStateRouter />
}
```

### Добавление нового маршрута
```tsx
// В AppRouter.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/workouts" element={<WorkoutsPage />} />
  <Route path="/new-page" element={<NewPage />} /> {/* Новый маршрут */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

## 🧪 Тестирование

### Тестирование состояний навигации
```tsx
import { renderHook } from '@testing-library/react'
import { useNavigationState } from '@/navigation'

test('should return loading state initially', () => {
  const { result } = renderHook(() => useNavigationState())
  
  expect(result.current.state).toBe('loading')
})
```

### Тестирование роутеров
```tsx
import { render, screen } from '@testing-library/react'
import { AppRouter } from '@/navigation'
import { MemoryRouter } from 'react-router-dom'

test('should render home page for root route', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppRouter />
    </MemoryRouter>
  )
  
  expect(screen.getByText('Home Page')).toBeInTheDocument()
})
```

### Мокирование зависимостей
```tsx
// Мок для профиля
jest.mock('@/stores/profile.store', () => ({
  useProfileStore: () => ({
    profile: {
      name: 'Test User',
      age: 25,
      height: 175,
      weight: 70,
      goal: 'strength',
      language: 'ru'
    },
    loadProfile: jest.fn()
  })
}))
```

## 📱 Мобильная оптимизация

### Touch-friendly навигация
```tsx
// Поддержка свайпов для навигации
import { useSwipeable } from 'react-swipeable'

const swipeHandlers = useSwipeable({
  onSwipedLeft: () => navigate('/next-page'),
  onSwipedRight: () => navigate('/prev-page'),
})

<div {...swipeHandlers}>
  <PageContent />
</div>
```

### Адаптивные переходы
```tsx
// Разные анимации для мобильных и десктопных устройств
const isMobile = window.innerWidth < 768

const pageVariants = {
  initial: {
    opacity: 0,
    y: isMobile ? 20 : 0,
    scale: isMobile ? 0.98 : 1
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  }
}
```

## ♿ Доступность

### ARIA навигация
```tsx
<nav aria-label="Main navigation">
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/workouts" element={<WorkoutsPage />} />
  </Routes>
</nav>
```

### Клавиатурная навигация
```tsx
// Поддержка клавиш для навигации
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          navigate('/')
          break
        case '2':
          navigate('/workouts')
          break
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [navigate])
```

## 🔄 Лучшие практики

### 1. Разделение ответственности
- Навигация отделена от бизнес-логики
- Каждый роутер отвечает за свою область
- Хуки содержат только логику состояния

### 2. Производительность
- Lazy loading страниц
- Мемоизация состояний
- Оптимизированные переходы

### 3. Пользовательский опыт
- Плавные переходы между состояниями
- Понятные состояния загрузки
- Обработка ошибок навигации

### 4. Поддерживаемость
- Четкая структура файлов
- Типизированные состояния
- Документированные переходы

## 📚 Дополнительная документация

- [Архитектура](../../docs/ARCHITECTURE.md)
- [Компоненты](../../docs/COMPONENTS.md)
- [Хуки](../../docs/HOOKS.md)

---

*Документация обновлена: $(date)*
