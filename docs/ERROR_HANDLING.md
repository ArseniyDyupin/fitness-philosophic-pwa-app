# 🚨 Система обработки ошибок

## 📋 Обзор

Комплексная система обработки ошибок для Fitness PWA, включающая централизованное управление ошибками, автоматические retry механизмы, восстановление после ошибок и детальное логирование.

## 🏗️ Архитектура

### Компоненты системы

```
ErrorHandler (Центральный обработчик)
├── ErrorLogger (Логирование)
├── RetryService (Retry механизмы)
├── ErrorRecovery (Восстановление)
└── ErrorBoundary (React компонент)
```

### Типы ошибок

- **NETWORK_ERROR** - Сетевые ошибки
- **API_ERROR** - Ошибки API
- **DATABASE_ERROR** - Ошибки базы данных
- **VALIDATION_ERROR** - Ошибки валидации
- **BUSINESS_ERROR** - Бизнес-логика ошибки
- **SYSTEM_ERROR** - Системные ошибки

### Уровни серьезности

- **LOW** - Низкий приоритет
- **MEDIUM** - Средний приоритет
- **HIGH** - Высокий приоритет
- **CRITICAL** - Критический приоритет

## 🚀 Использование

### Базовое использование

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler'

function MyComponent() {
  const { handleError, executeWithRetry } = useErrorHandler()

  const handleApiCall = async () => {
    try {
      const result = await executeWithRetry(
        () => fetch('/api/data'),
        { component: 'MyComponent', action: 'fetchData' }
      )
      return result
    } catch (error) {
      await handleError(error, {
        component: 'MyComponent',
        action: 'handleApiCall'
      })
    }
  }
}
```

### Специализированные хуки

```typescript
import { useApiErrorHandler, useDatabaseErrorHandler } from '@/hooks/useErrorHandler'

function ApiComponent() {
  const { handleApiError, executeApiCall } = useApiErrorHandler()
  
  const fetchData = async () => {
    try {
      return await executeApiCall(
        () => api.getData(),
        { component: 'ApiComponent' }
      )
    } catch (error) {
      await handleApiError(error)
    }
  }
}
```

### ErrorBoundary

```typescript
import ErrorBoundary from '@/ui/atoms/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary component="App" level="page">
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## 🔧 Конфигурация

### ErrorHandler

```typescript
import { errorHandler } from '@/services/error'

// Обновление конфигурации
errorHandler.updateConfig({
  enableLogging: true,
  enableReporting: true,
  enableRecovery: true,
  logLevel: 'error',
  maxRetries: 3
})
```

### RetryService

```typescript
import { retryService } from '@/services/error'

// Выполнение с retry
const result = await retryService.executeWithRetry(
  () => apiCall(),
  {
    maxRetries: 5,
    baseDelay: 1000,
    backoffMultiplier: 2
  }
)
```

### ErrorLogger

```typescript
import { errorLogger } from '@/services/error'

// Логирование
errorLogger.error('Something went wrong', error, {
  component: 'MyComponent',
  action: 'processData'
})

// Экспорт логов
const logs = errorLogger.exportLogs()
```

## 📊 Мониторинг

### Компонент мониторинга

```typescript
import ErrorMonitoring from '@/ui/organisms/settings/ErrorMonitoring'

function SettingsPage() {
  return (
    <div>
      <ErrorMonitoring />
    </div>
  )
}
```

### Метрики

```typescript
import { errorHandler } from '@/services/error'

const metrics = errorHandler.getMetrics()
console.log('Total errors:', metrics.totalErrors)
console.log('Errors by type:', metrics.errorsByType)
console.log('Retry success rate:', metrics.retrySuccessRate)
```

## 🔄 Retry стратегии

### Экспоненциальный backoff

```typescript
import { retryService } from '@/services/error'

const result = await retryService.executeWithExponentialBackoff(
  () => apiCall(),
  {
    maxRetries: 3,
    baseDelay: 1000,
    backoffMultiplier: 2
  }
)
```

### Circuit Breaker

```typescript
import { retryService } from '@/services/error'

const protectedApiCall = retryService.createCircuitBreaker(
  apiCall,
  {
    failureThreshold: 5,
    recoveryTimeout: 60000
  }
)
```

### Параллельные retry

```typescript
import { retryService } from '@/services/error'

const results = await retryService.executeParallelWithRetry([
  () => apiCall1(),
  () => apiCall2(),
  () => apiCall3()
])
```

## 🛠️ Восстановление после ошибок

### Автоматическое восстановление

```typescript
import { errorRecovery } from '@/services/error'

// Добавление кастомной стратегии восстановления
errorRecovery.addRecoveryStrategy({
  name: 'CustomRecovery',
  priority: 100,
  canRecover: (error) => error.type === ErrorType.CUSTOM_ERROR,
  recover: async (error) => {
    // Логика восстановления
    return true
  }
})
```

### Стратегии восстановления

1. **NetworkRecovery** - Восстановление сетевого соединения
2. **DatabaseRecovery** - Переинициализация БД
3. **StorageQuotaRecovery** - Очистка кэша
4. **RateLimitRecovery** - Ожидание сброса лимитов
5. **AuthenticationRecovery** - Обновление токенов

## 📝 Логирование

### Уровни логирования

- **debug** - Отладочная информация
- **info** - Информационные сообщения
- **warn** - Предупреждения
- **error** - Ошибки

### Конфигурация логирования

```typescript
import { errorLogger } from '@/services/error'

errorLogger.updateConfig({
  enableConsole: true,
  enableLocalStorage: true,
  enableRemoteLogging: false,
  maxLocalLogs: 1000,
  logLevel: 'info'
})
```

### Экспорт логов

```typescript
// Получение логов
const logs = errorLogger.getLocalLogs(100)

// Экспорт в JSON
const exportedLogs = errorLogger.exportLogs()

// Очистка логов
errorLogger.clearLocalLogs()
```

## 🎯 Лучшие практики

### 1. Используйте контекст

```typescript
await handleError(error, {
  component: 'WorkoutList',
  action: 'loadWorkouts',
  userId: user.id,
  metadata: { workoutCount: workouts.length }
})
```

### 2. Специфичные типы ошибок

```typescript
import { createApiError, createDatabaseError } from '@/services/error'

// Вместо generic Error
throw createApiError('API request failed', {
  component: 'ApiService',
  action: 'fetchData'
})
```

### 3. Retry для сетевых операций

```typescript
const result = await executeWithRetry(
  () => fetch('/api/data'),
  { component: 'DataFetcher' },
  {
    maxRetries: 3,
    baseDelay: 1000
  }
)
```

### 4. ErrorBoundary для компонентов

```typescript
<ErrorBoundary component="WorkoutCard" level="component">
  <WorkoutCard workout={workout} />
</ErrorBoundary>
```

### 5. Мониторинг в продакшене

```typescript
// Включить удаленное логирование
errorLogger.updateConfig({
  enableRemoteLogging: true,
  remoteEndpoint: 'https://your-logging-service.com/logs'
})
```

## 🔍 Отладка

### Просмотр метрик

```typescript
import { errorHandler } from '@/services/error'

// В консоли браузера
console.log('Error metrics:', errorHandler.getMetrics())
console.log('Error reports:', errorHandler.getErrorReports())
```

### Локальные логи

```typescript
import { errorLogger } from '@/services/error'

// Просмотр последних логов
const logs = errorLogger.getLocalLogs(50)
console.table(logs)
```

### Статистика восстановления

```typescript
import { errorRecovery } from '@/services/error'

const stats = errorRecovery.getRecoveryStats()
console.log('Recovery stats:', stats)
```

## 🚀 Интеграция с внешними сервисами

### Sentry

```typescript
// В ErrorHandler.ts
private async sendToErrorReportingService(report: ErrorReport): Promise<void> {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(report.error, {
      tags: {
        type: report.error.type,
        severity: report.error.severity
      },
      extra: report.error.context
    })
  }
}
```

### LogRocket

```typescript
// В ErrorLogger.ts
private async sendToRemoteService(logs: LogEntry[]): Promise<void> {
  if (typeof LogRocket !== 'undefined') {
    LogRocket.captureException(new Error('Batch error log'), {
      extra: { logs }
    })
  }
}
```

## 📈 Производительность

### Оптимизации

- Логирование в фоновом режиме
- Батчевая отправка логов
- Кэширование метрик
- Lazy loading компонентов мониторинга

### Метрики производительности

- Время обработки ошибок
- Успешность retry операций
- Время восстановления
- Размер логов

## 🔒 Безопасность

### Конфиденциальность

- Фильтрация чувствительных данных
- Анонимизация пользовательских данных
- Шифрование логов при передаче

### Ограничения

- Rate limiting для логирования
- Максимальный размер логов
- Автоматическая очистка старых логов

---

*Документация обновлена: $(date)*
