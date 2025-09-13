/**
 * Error monitoring and metrics component for settings page
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, Activity, Bug, Database, Network, RefreshCw, Download, Trash2 } from 'lucide-react'
import { errorHandler, errorLogger, errorRecovery } from '@/services/error'
import { ErrorType, ErrorSeverity } from '@/types/errors'
import Button from '@/ui/atoms/Button'
import Card from '@/ui/atoms/Card'
import Modal from '@/ui/atoms/Modal'

interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<ErrorType, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  errorsByComponent: Record<string, number>
  averageResolutionTime: number
  retrySuccessRate: number
}

interface LogEntry {
  id: string
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: {
    component?: string
    action?: string
  }
}

export default function ErrorMonitoring() {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadMetrics()
    loadLogs()
  }, [])

  const loadMetrics = () => {
    const errorMetrics = errorHandler.getMetrics()
    setMetrics(errorMetrics)
  }

  const loadLogs = () => {
    const localLogs = errorLogger.getLocalLogs(50) // Last 50 logs
    setLogs(localLogs)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      loadMetrics()
      loadLogs()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearLogs = () => {
    errorLogger.clearLocalLogs()
    setLogs([])
  }

  const handleExportLogs = () => {
    const logsData = errorLogger.exportLogs()
    const blob = new Blob([logsData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getErrorTypeIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.CONNECTION_ERROR:
        return <Network className="w-4 h-4" />
      case ErrorType.DATABASE_ERROR:
      case ErrorType.STORAGE_ERROR:
        return <Database className="w-4 h-4" />
      case ErrorType.API_ERROR:
        return <Bug className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'text-green-600 bg-green-100'
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-600 bg-yellow-100'
      case ErrorSeverity.HIGH:
        return 'text-orange-600 bg-orange-100'
      case ErrorSeverity.CRITICAL:
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'text-gray-600 bg-gray-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      case 'warn':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Activity className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2">Загрузка метрик ошибок...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Мониторинг ошибок
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Статистика ошибок и производительности приложения
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего ошибок</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {metrics.totalErrors}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Успешных восстановлений</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {errorRecovery.getRecoveryStats().successfulRecoveries}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <RefreshCw className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Успешность retry</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(metrics.retrySuccessRate * 100)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <Bug className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Время разрешения</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(metrics.averageResolutionTime)}ms
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ошибки по типам
        </h3>
        <div className="space-y-3">
          {Object.entries(metrics.errorsByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getErrorTypeIcon(type as ErrorType)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {type}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Error Severity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ошибки по серьезности
        </h3>
        <div className="space-y-3">
          {Object.entries(metrics.errorsBySeverity).map(([severity, count]) => (
            <div key={severity} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity as ErrorSeverity)}`}>
                  {severity}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Component Errors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ошибки по компонентам
        </h3>
        <div className="space-y-3">
          {Object.entries(metrics.errorsByComponent).map(([component, count]) => (
            <div key={component} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {component}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Logs Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Логи ошибок
          </h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowLogsModal(true)}
              variant="secondary"
              size="sm"
            >
              Показать логи
            </Button>
            <Button
              onClick={handleExportLogs}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт</span>
            </Button>
            <Button
              onClick={handleClearLogs}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Очистить</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Последние {logs.length} записей в логах
        </p>
      </Card>

      {/* Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Логи ошибок"
        size="xl"
      >
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {log.message}
                </p>
                {log.context && (
                  <div className="text-xs text-gray-500">
                    {log.context.component && (
                      <span>Component: {log.context.component}</span>
                    )}
                    {log.context.action && (
                      <span className="ml-2">Action: {log.context.action}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
