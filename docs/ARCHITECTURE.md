# Архитектура Fitness PWA

## Границы системы

Приложение — local-first PWA. Профиль, тренировки, планы, метрики, фотографии и weekly reviews хранятся в IndexedDB через Dexie. Сеть используется только по явному действию пользователя для OpenAI и ручного Google Drive backup.

```text
React pages/components
        ↓
Zustand stores / hooks (реактивные UI mirrors)
        ↓
application use cases
        ↓
domain repository contracts
        ↓
infrastructure Dexie repositories
        ↓
IndexedDB
```

UI не должен напрямую определять persistence-семантику. Новые write-flow добавляются через `src/application`, а Dexie-запросы инкапсулируются в `src/infrastructure/repositories`.

## Каталоги

```text
src/
├── app/                    # App shell и точка входа
├── navigation/             # Router и выбор onboarding/main-app
├── domain/                 # LocalDate, доменные правила, модели и repository contracts
├── application/            # Workout/profile/plan/weekly-review use cases
├── infrastructure/         # Dexie implementations
├── stores/                 # Zustand UI mirrors и selectors
├── services/
│   ├── ai/                 # Единый OpenAI gateway и feature adapters
│   ├── data/               # Dexie schema, export/import, integrity
│   ├── error/              # Error handling с redaction
│   └── fitness/            # Детерминированные расчёты
└── ui/                     # Atomic UI, pages и dialogs
```

## Даты

Календарные сущности используют `LocalDate` (`YYYY-MM-DD`) и не конвертируются через UTC:

- `Workout.date`
- `FoodLog.date`
- `WeeklyCheckin.weekStart`
- `PlanSuggestion.forDate`
- даты метрик/фото/weekly review

`createdAt`, `updatedAt` и `exportedAt` остаются UTC timestamps. Legacy ISO calendar strings нормализуются при чтении/import через `src/domain/date/localDate.ts`.

## Основные data flows

### Запись тренировки

`WorkoutForm → workout.store → WorkoutService → WorkoutRepository → Dexie`. Создание выполняется один раз; AI estimates обновляют ту же запись с сохранением `id` и `createdAt`.

### Генерация плана

`AIService.generateNextWorkout` только валидирует и возвращает предложение. После выбора даты `PlanService.saveGeneratedPlan` одной транзакцией сохраняет `PlanSuggestion` и связанный planned workout. AI не пишет в БД до подтверждённого UI-flow.

### Weekly review

Форма сохраняет один review на локальную неделю. Application service строит безопасную локальную рекомендацию и, при доступном ключе, пытается заменить её валидированным AI-ответом. Изменения профиля применяются только после отображения diff и `confirm`.

### Backup

`exportAll → SHA-256/size/schema preview → Google Drive appDataFolder`. Download проверяет размер, checksum и Zod schema, затем merge обновляет только более новые записи и перезагружает Zustand mirrors. OAuth token хранится только в памяти.

## AI

Все AI-функции используют `OpenAIGateway`:

- один источник API key;
- единая модель и transport;
- единый rate limit и стабильные error codes;
- text и `image_url` content;
- feature-specific Zod validation;
- детерминированные fallback там, где это возможно.

API key хранится в browser localStorage, поэтому пользователь должен считать устройство доверенным. Ключ, bearer tokens и photo data редактируются из error logs.

## PWA

Vite генерирует единственный manifest и Service Worker. Обновление применяется после пользовательского prompt. Precache ограничен runtime shell и нужными иконками; `npm run build:budget` контролирует общий `dist` и максимальный JS chunk.

## Проверки

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run test:e2e
npm run build
npm run build:budget
npm run check-agents
npx openspec validate --all
```

`npm run verify` объединяет локальные проверки, кроме Playwright; e2e запускается отдельно, поскольку ему нужен Chromium.
