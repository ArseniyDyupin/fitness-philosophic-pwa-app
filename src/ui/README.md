# UI Components

## 📋 Обзор

Модуль UI содержит все пользовательские интерфейсы, организованные по принципам Atomic Design.

## 🏗️ Структура

```
ui/
├── atoms/                 # Базовые UI элементы
├── molecules/             # Составные компоненты
├── organisms/             # Сложные блоки
├── pages/                 # Страницы приложения
├── modals/                # Модальные окна
└── README.md             # Эта документация
```

## 🧩 Atoms (Атомы)

Базовые UI элементы, которые нельзя разделить на более мелкие части.

### Доступные компоненты
- `Button` - кнопки различных типов
- `Input` - поля ввода
- `Select` - выпадающие списки
- `Badge` - бейджи и метки
- `Card` - карточки
- `Modal` - модальные окна
- `Progress` - прогресс-бары
- `MetricCard` - карточки метрик
- `Skeleton` - скелетоны загрузки
- `ErrorBoundary` - обработка ошибок
- `PageTransition` - анимации переходов

### Использование
```tsx
import { Button, Input, Card } from '@/ui/atoms'

<Card className="p-4">
  <Input placeholder="Введите текст" />
  <Button variant="primary">Сохранить</Button>
</Card>
```

## 🔗 Molecules (Молекулы)

Составные компоненты, объединяющие несколько атомов.

### Организация по функциональности
```
molecules/
├── workouts/              # Компоненты для тренировок
│   ├── WeekNavigator.tsx
│   └── RPEBadge.tsx
├── stats/                 # Компоненты статистики
│   ├── StatTile.tsx
│   └── ProgressRow.tsx
└── shared/                # Общие компоненты
    ├── DateTimeRow.tsx
    └── KpiGrid.tsx
```

### Использование
```tsx
import { WeekNavigator, StatTile } from '@/ui/molecules'

<WeekNavigator 
  currentWeek={currentWeek}
  onWeekChange={handleWeekChange}
/>
<StatTile 
  title="Тренировки"
  value={12}
  change={+2}
/>
```

## 🏢 Organisms (Организмы)

Сложные блоки, объединяющие молекулы и атомы.

### Организация по страницам
```
organisms/
├── home/                  # Главная страница
│   ├── HomeKPI.tsx
│   ├── NextWorkoutCard.tsx
│   └── HomeBanners.tsx
├── workouts/              # Тренировки
│   ├── WorkoutForm.tsx
│   ├── WorkoutHeader.tsx
│   └── WeekSection.tsx
├── stats/                 # Статистика
│   ├── StatsHeader.tsx
│   ├── DisciplineBreakdown.tsx
│   └── Records.tsx
├── settings/              # Настройки
│   └── SettingsBodyMetrics.tsx
├── plan/                  # Планы тренировок
│   ├── PlanSummary.tsx
│   └── PlanExerciseCard.tsx
├── onboarding/            # Онбординг
│   ├── OnboardingGoals.tsx
│   ├── OnboardingConstraints.tsx
│   └── OnboardingMetrics.tsx
└── shared/                # Общие компоненты
    ├── Header.tsx
    ├── WorkoutCard.tsx
    └── WeekSummary.tsx
```

### Использование
```tsx
import { WorkoutForm } from '@/ui/organisms/workouts'
import { HomeKPI } from '@/ui/organisms/home'

<WorkoutForm 
  workout={workout}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

## 📄 Pages (Страницы)

Полные страницы приложения.

### Доступные страницы
- `HomePage` - главная страница
- `WorkoutsPage` - список тренировок
- `WorkoutDetailsPage` - детали тренировки
- `StatsPage` - статистика
- `SettingsPage` - настройки
- `FoodPage` - питание
- `PlanRealizationPage` - выполнение плана
- `LanguageSelectionPage` - выбор языка
- `EntryStep` - шаг входа
- `NotFound` - 404 страница

### Использование
```tsx
import HomePage from '@/ui/pages/HomePage'

// Страницы автоматически импортируются через роутинг
```

## 🪟 Modals (Модальные окна)

Модальные окна для различных функций.

### Организация по функциональности
```
modals/
├── home/                  # Модальные окна главной страницы
│   └── BodyMetricsModal.tsx
├── workouts/              # Модальные окна тренировок
│   ├── EditWorkoutMetaModal.tsx
│   └── ExerciseEditModal.tsx
├── settings/              # Модальные окна настроек
│   ├── AISettings.tsx
│   ├── DataImport.tsx
│   └── ProfileDetailsModal.tsx
└── stats/                 # Модальные окна статистики
    └── RecordChartModal.tsx
```

### Использование
```tsx
import { BodyMetricsModal } from '@/ui/modals/home'

<BodyMetricsModal
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

## 🔧 Создание нового компонента

### 1. Определите уровень
- **Atom** - базовый UI элемент (кнопка, инпут)
- **Molecule** - составной компонент (форма, навигация)
- **Organism** - сложный блок (заголовок, список)

### 2. Создайте файл
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

### 3. Добавьте типы
```tsx
// src/ui/atoms/NewComponent.tsx
export type { NewComponentProps } from './NewComponent'
```

### 4. Экспортируйте через index.ts
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

## 🧪 Тестирование

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

## 📚 Дополнительная документация

- [Архитектура](../../docs/ARCHITECTURE.md)
- [Компоненты](../../docs/COMPONENTS.md)
- [Стилизация](../../docs/STYLING.md)

---

*Документация обновлена: $(date)*
