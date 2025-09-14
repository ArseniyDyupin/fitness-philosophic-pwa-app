# Документация компонентов

## 📋 Обзор

Документация описывает все UI компоненты приложения, организованные по принципам Atomic Design.

## 🧩 Atoms (Атомы)

Базовые UI элементы, которые нельзя разделить на более мелкие части.

### Button
```tsx
import { Button } from '@/ui/atoms'

<Button 
  variant="primary" 
  size="md" 
  onClick={handleClick}
  disabled={false}
>
  Нажми меня
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `onClick`: () => void

### Input
```tsx
import { Input } from '@/ui/atoms'

<Input
  type="text"
  placeholder="Введите текст"
  value={value}
  onChange={handleChange}
  error={error}
/>
```

**Props:**
- `type`: HTML input types
- `placeholder`: string
- `value`: string
- `onChange`: (e: ChangeEvent) => void
- `error`: string | undefined

### Card
```tsx
import { Card } from '@/ui/atoms'

<Card className="p-4">
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>
```

### Modal
```tsx
import { Modal } from '@/ui/atoms'

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Заголовок модального окна"
>
  <p>Содержимое модального окна</p>
</Modal>
```

### Skeleton
```tsx
import { Skeleton, SkeletonCard, SkeletonText } from '@/ui/atoms'

// Базовый скелетон
<Skeleton className="h-4 w-32" />

// Карточка-скелетон
<SkeletonCard />

// Текст-скелетон
<SkeletonText lines={3} />
```

### ErrorBoundary
```tsx
import { ErrorBoundary } from '@/ui/atoms'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### PageTransition
```tsx
import { PageTransition, FadeIn, SlideIn } from '@/ui/atoms'

<PageTransition>
  <FadeIn delay={0.1}>
    <SlideIn direction="up">
      <YourContent />
    </SlideIn>
  </FadeIn>
</PageTransition>
```

## 🔗 Molecules (Молекулы)

Составные компоненты, объединяющие несколько атомов.

### WeekNavigator
```tsx
import { WeekNavigator } from '@/ui/molecules/workouts'

<WeekNavigator
  currentWeek={currentWeek}
  onWeekChange={handleWeekChange}
  showTodayButton={true}
/>
```

### StatTile
```tsx
import { StatTile } from '@/ui/molecules'

<StatTile
  title="Тренировки"
  value={12}
  change={+2}
  trend="up"
  icon={<Dumbbell />}
/>
```

### ProgressRow
```tsx
import { ProgressRow } from '@/ui/molecules'

<ProgressRow
  label="Прогресс"
  current={75}
  target={100}
  unit="кг"
  showPercentage={true}
/>
```

### RPEBadge
```tsx
import { RPEBadge } from '@/ui/molecules'

<RPEBadge value={8} size="sm" />
```

## 🏢 Organisms (Организмы)

Сложные блоки, объединяющие молекулы и атомы.

### Header
```tsx
import Header from '@/ui/organisms/shared/Header'

<Header />
```

**Функциональность:**
- Навигация между страницами
- Переключение языка
- Экспорт данных
- Настройки

### WorkoutForm
```tsx
import { WorkoutForm } from '@/ui/organisms/workouts'

<WorkoutForm
  workout={workout}
  onSave={handleSave}
  onCancel={handleCancel}
  isEditing={false}
/>
```

**Функциональность:**
- Создание/редактирование тренировки
- Добавление упражнений
- AI генерация тренировок
- Валидация данных

### HomeKPI
```tsx
import { HomeKPI } from '@/ui/organisms/home'

<HomeKPI />
```

**Функциональность:**
- Отображение ключевых метрик
- Статистика за день/неделю
- Быстрый доступ к функциям

### StatsHeader
```tsx
import { StatsHeader } from '@/ui/organisms/stats'

<StatsHeader
  period={period}
  onPeriodChange={handlePeriodChange}
  showExport={true}
/>
```

## 📄 Pages (Страницы)

Полные страницы приложения.

### HomePage
```tsx
import HomePage from '@/ui/pages/HomePage'

// Автоматически импортируется через роутинг
```

**Содержит:**
- HomeKPI - ключевые метрики
- NextWorkoutCard - следующая тренировка
- HomeBanners - баннеры и уведомления
- RecentWorkouts - последние тренировки

### WorkoutsPage
```tsx
import WorkoutsPage from '@/ui/pages/WorkoutsPage'
```

**Содержит:**
- WeekNavigator - навигация по неделям
- WeekSection - секции тренировок
- WorkoutForm - форма создания тренировки

### StatsPage
```tsx
import StatsPage from '@/ui/pages/StatsPage'
```

**Содержит:**
- StatsHeader - заголовок с фильтрами
- DisciplineBreakdown - разбивка по дисциплинам
- Records - рекорды
- BodyMetricsBlock - метрики тела

### SettingsPage
```tsx
import SettingsPage from '@/ui/pages/SettingsPage'
```

**Содержит:**
- ProfileDetailsModal - редактирование профиля
- AISettings - настройки AI
- DataImport - импорт данных
- SettingsBodyMetrics - настройки метрик

## 🪟 Modals (Модальные окна)

Модальные окна для различных функций.

### BodyMetricsModal
```tsx
import { BodyMetricsModal } from '@/ui/modals/home'

<BodyMetricsModal
  isOpen={isOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
```

### EditWorkoutMetaModal
```tsx
import { EditWorkoutMetaModal } from '@/ui/modals/workouts'

<EditWorkoutMetaModal
  isOpen={isOpen}
  workout={workout}
  onClose={handleClose}
  onSave={handleSave}
/>
```

### AISettings
```tsx
import { AISettings } from '@/ui/modals/settings'

<AISettings
  isOpen={isOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
```

## 🎨 Стилизация

### Tailwind CSS
Все компоненты используют Tailwind CSS для стилизации:

```tsx
<Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Кнопка
</Button>
```

### Темная тема
Поддержка темной темы через Tailwind:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Контент
</div>
```

### Адаптивность
Все компоненты адаптивны:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

## 🔧 Кастомизация

### Создание нового компонента

1. **Определите уровень** (Atom/Molecule/Organism)
2. **Создайте файл** в соответствующей папке
3. **Добавьте типы** в отдельный файл
4. **Экспортируйте** через index.ts

```tsx
// src/ui/atoms/NewComponent.tsx
import React from 'react'

interface NewComponentProps {
  title: string
  onClick: () => void
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {title}
    </button>
  )
}

export default NewComponent
```

### Добавление в barrel export

```tsx
// src/ui/atoms/index.ts
export { default as NewComponent } from './NewComponent'
export type { NewComponentProps } from './NewComponent'
```

## 📱 Мобильная оптимизация

### Touch-friendly
Все интерактивные элементы имеют минимальный размер 44px:

```tsx
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon />
</button>
```

### Swipe gestures
Поддержка свайпов для навигации:

```tsx
import { useSwipeable } from 'react-swipeable'

const swipeHandlers = useSwipeable({
  onSwipedLeft: () => nextWeek(),
  onSwipedRight: () => prevWeek(),
})
```

## ♿ Доступность

### ARIA атрибуты
```tsx
<button
  aria-label="Закрыть модальное окно"
  aria-expanded={isOpen}
  onClick={onClose}
>
  <CloseIcon />
</button>
```

### Клавиатурная навигация
```tsx
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Интерактивный элемент
</div>
```

## 🧪 Тестирование компонентов

### Unit тесты
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/ui/atoms'

test('Button calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByText('Click me'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Visual regression тесты
```tsx
import { render } from '@testing-library/react'
import { Button } from '@/ui/atoms'

test('Button renders correctly', () => {
  const { container } = render(<Button>Test</Button>)
  expect(container.firstChild).toMatchSnapshot()
})
```

---

*Документация обновлена: $(date)*
