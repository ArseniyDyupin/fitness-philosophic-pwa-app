# 🏋️ Fitness PWA

> Прогрессивное веб-приложение для управления тренировками с AI-помощником

**Live demo:** [fitness-philosophic-pwa-app.vercel.app](https://fitness-philosophic-pwa-app.vercel.app/)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

## ✨ Особенности

- 🤖 **AI-генерация тренировок** с помощью OpenAI
- 📱 **PWA** - работает офлайн и устанавливается как приложение
- 🌍 **Интернационализация** - поддержка русского и английского языков
- 📊 **Детальная статистика** тренировок и прогресса
- 🎯 **Atomic Design** - модульная архитектура компонентов
- ⚡ **Высокая производительность** - lazy loading и оптимизация
- 🔒 **Безопасность** - валидация данных и rate limiting
- 📈 **Аналитика** - отслеживание метрик и прогресса
- 🧭 **Итоги недели** - recovery check-in, рекомендация и явный preview изменений плана
- ☁️ **Приватный backup** - ручная синхронизация через Google Drive AppData
- 🚦 **Feature flags** - незавершённые поверхности скрыты из роутинга через `src/config/features.ts`

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- OpenAI API ключ (для AI функций)

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/ArseniyDyupin/fitness-philosophic-pwa-app.git
cd fitness-philosophic-pwa-app

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

Полный локальный контур: `npm run verify:all` (включает Chromium e2e и runtime audit).

### Настройка

1. **Откройте приложение** в браузере (обычно `http://localhost:5173`)
2. **Выберите язык** (русский/английский)
3. **Заполните профиль** с вашими данными
4. **Добавьте OpenAI API ключ** в настройках (опционально)

## 🏗️ Архитектура

Приложение построено с использованием современных принципов разработки:

### Atomic Design
```
Atoms → Molecules → Organisms → Templates → Pages
```

### Технологический стек
- **Frontend**: React 18, TypeScript, Vite
- **Стилизация**: Tailwind CSS, Framer Motion
- **Состояние**: Zustand, React Hooks
- **Данные**: IndexedDB (Dexie), OpenAI API
- **Валидация**: Zod
- **PWA**: Vite PWA Plugin

### Структура проекта
```
src/
├── app/                    # Главный компонент
├── config/                 # Feature flags для экспериментальных поверхностей
├── domain/                 # Доменные типы, правила и интерфейсы репозиториев
├── application/            # Use cases для профиля, тренировок, планов и weekly review
├── infrastructure/         # Dexie-реализации репозиториев
├── navigation/             # Логика навигации
├── ui/                     # UI компоненты
│   ├── atoms/             # Базовые элементы
│   ├── molecules/         # Составные компоненты
│   ├── organisms/         # Сложные блоки
│   ├── pages/             # Страницы
│   └── modals/            # Модальные окна
├── hooks/                  # Кастомные хуки
├── stores/                 # Управление состоянием
├── services/               # AI gateway, импорт/экспорт, Drive, расчёты
├── types/                  # Типизация
└── utils/                  # Утилиты
```

## 📖 Документация

- [🏗️ Архитектура](./docs/ARCHITECTURE.md) - подробное описание архитектуры
- [🧩 Компоненты](./docs/COMPONENTS.md) - документация UI компонентов
- [🔄 Хуки](./docs/HOOKS.md) - кастомные React хуки
- [🔌 API](./docs/API.md) - сервисы и API
- [🤖 AI-assisted разработка](./docs/AI_ASSISTED_DEVELOPMENT.md) - OpenSpec, агенты и проверки
- [🎨 Стилизация](./docs/STYLING.md) - работа со стилями
- [🧪 Тестирование](./docs/TESTING.md) - тестирование приложения

## 🎯 Основные функции

### 🏋️ Управление тренировками
- Создание и редактирование тренировок
- Добавление упражнений с весами и повторениями
- Отслеживание RPE (Rate of Perceived Exertion)
- История тренировок

### 🤖 AI-помощник
- Генерация персонализированных тренировок
- Анализ техники выполнения упражнений
- Рекомендации по улучшению
- Оценка прогресса
- Один конфиг/ключ и единый transport для plan, review, estimates и body-photo analysis

### 🧭 Итоги недели
- Оценка энергии, сна, soreness, настроения и выполнения плана
- Безопасная локальная рекомендация при недоступном AI
- Preview изменения частоты/длительности до явного применения

### 📊 Статистика и аналитика
- Детальная статистика по тренировкам
- Графики прогресса
- Анализ калорий и времени
- Сравнение периодов

### 📱 PWA функции
- Работа в офлайн режиме
- Установка как нативное приложение
- Контролируемое обновление через пользовательский prompt
- Быстрая загрузка

## 🛠️ Разработка

### Доступные команды

```bash
# Разработка
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run build:budget # Budget размера dist и JS chunks
npm run preview      # Предварительный просмотр сборки

# Качество кода
npm run lint         # Проверка ESLint
npm run typecheck    # Проверка TypeScript

# Тестирование
npm test -- --run    # Unit/component/integration тесты Vitest
npm run test:e2e     # Desktop + mobile smoke-тесты Playwright
npm run verify       # Полный локальный quality gate
```

### Стандарты кода

- **TypeScript** - строгая типизация
- **ESLint** - линтинг кода
- **Conventional Commits** - стандарт коммитов

### Git workflow

```bash
# Создание feature ветки
git checkout -b feature/new-feature

# Коммит изменений
git commit -m "feat: add new workout generation"

# Push и создание PR
git push origin feature/new-feature
```

## 🚀 Развертывание

### Продакшен сборка

```bash
npm run build
```

### Развертывание на Vercel

```bash
# Установка Vercel CLI
npm i -g vercel

# Развертывание
vercel --prod
```

### Развертывание на Netlify

```bash
# Установка Netlify CLI
npm i -g netlify-cli

# Развертывание
netlify deploy --prod --dir=dist
```

## 📊 Производительность

### Метрики
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Оптимизации
- Lazy loading страниц
- Code splitting
- Мемоизация вычислений
- Оптимизация изображений
- Service Worker кэширование

## 🔒 Безопасность

- Zod-валидация import/AI контрактов
- Rate limiting для AI API
- Локальное хранение данных
- Редактирование секретов, токенов и фото из error logs
- Полное удаление локальных данных из Settings
- `npm audit --omit=dev` без известных production-уязвимостей
- HTTPS в продакшене

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](./CONTRIBUTING.md) для получения подробной информации.

### Как помочь
1. 🐛 **Сообщения об ошибках** - создавайте issues
2. 💡 **Предложения** - предлагайте новые функции
3. 🔧 **Исправления** - отправляйте pull requests
4. 📖 **Документация** - улучшайте документацию

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](./LICENSE) для деталей.

## 🙏 Благодарности

- [React](https://reactjs.org/) - UI библиотека
- [OpenAI](https://openai.com/) - AI API
- [Tailwind CSS](https://tailwindcss.com/) - CSS фреймворк
- [Vite](https://vitejs.dev/) - сборщик
- [Dexie](https://dexie.org/) - IndexedDB wrapper

## 📞 Поддержка

Если у вас есть вопросы или проблемы — откройте [issue на GitHub](https://github.com/ArseniyDyupin/fitness-philosophic-pwa-app/issues).

---

<div align="center">
  <p>Сделано с ❤️ для фитнес-энтузиастов</p>
  <p>⭐ Поставьте звезду, если проект вам понравился!</p>
</div>
