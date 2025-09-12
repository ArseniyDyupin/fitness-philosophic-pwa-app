# 🏋️ Fitness PWA

> Прогрессивное веб-приложение для управления тренировками с AI-помощником

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

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- OpenAI API ключ (для AI функций)

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/your-username/fitness-pwa.git
cd fitness-pwa

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

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
├── navigation/             # Логика навигации
├── ui/                     # UI компоненты
│   ├── atoms/             # Базовые элементы
│   ├── molecules/         # Составные компоненты
│   ├── organisms/         # Сложные блоки
│   ├── pages/             # Страницы
│   └── modals/            # Модальные окна
├── hooks/                  # Кастомные хуки
├── stores/                 # Управление состоянием
├── services/               # Бизнес-логика
├── types/                  # Типизация
└── utils/                  # Утилиты
```

## 📖 Документация

- [🏗️ Архитектура](./docs/ARCHITECTURE.md) - подробное описание архитектуры
- [🧩 Компоненты](./docs/COMPONENTS.md) - документация UI компонентов
- [🔄 Хуки](./docs/HOOKS.md) - кастомные React хуки
- [🔌 API](./docs/API.md) - сервисы и API
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

### 📊 Статистика и аналитика
- Детальная статистика по тренировкам
- Графики прогресса
- Анализ калорий и времени
- Сравнение периодов

### 📱 PWA функции
- Работа в офлайн режиме
- Установка как нативное приложение
- Push уведомления
- Быстрая загрузка

## 🛠️ Разработка

### Доступные команды

```bash
# Разработка
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр сборки

# Качество кода
npm run lint         # Проверка ESLint
npm run lint:fix     # Автоисправление ESLint
npm run type-check   # Проверка TypeScript

# Тестирование
npm run test         # Запуск тестов
npm run test:watch   # Тесты в watch режиме
npm run test:coverage # Покрытие тестами
```

### Стандарты кода

- **TypeScript** - строгая типизация
- **ESLint** - линтинг кода
- **Prettier** - форматирование
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

- Валидация всех входных данных с Zod
- Rate limiting для AI API
- Локальное хранение данных
- HTTPS в продакшене
- Content Security Policy

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

Если у вас есть вопросы или проблемы:

- 📧 Email: support@fitness-pwa.com
- 💬 Discord: [Наш сервер](https://discord.gg/fitness-pwa)
- 📱 Telegram: [@fitness_pwa](https://t.me/fitness_pwa)

---

<div align="center">
  <p>Сделано с ❤️ для фитнес-энтузиастов</p>
  <p>⭐ Поставьте звезду, если проект вам понравился!</p>
</div>