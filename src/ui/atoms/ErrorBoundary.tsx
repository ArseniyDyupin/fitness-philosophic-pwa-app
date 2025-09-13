import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Activity } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import Button from './Button'
import { errorHandler } from '@/services/error/ErrorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  component?: string
  level?: 'page' | 'component' | 'feature'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
  isRetrying: boolean
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryDelay = 1000

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { component = 'Unknown', level = 'component' } = this.props
    
    // Report error to centralized handler
    errorHandler.handleError(error, {
      component: `${component} (${level})`,
      action: 'componentDidCatch',
      metadata: {
        level,
        retryCount: this.state.retryCount,
        errorBoundary: true
      }
    })

    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return
    }

    this.setState({ isRetrying: true })

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.retryDelay))

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }))
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          isRetrying={this.state.isRetrying}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          canRetry={this.state.retryCount < this.maxRetries}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
  isRetrying: boolean
  onRetry: () => void
  onReload: () => void
  onGoHome: () => void
  canRetry: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  retryCount, 
  isRetrying, 
  onRetry, 
  onReload, 
  onGoHome, 
  canRetry 
}) => {
  const t = useTranslations()

  const getErrorSeverity = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (!error) return 'medium'
    
    const message = error.message.toLowerCase()
    if (message.includes('network') || message.includes('timeout')) return 'medium'
    if (message.includes('critical') || message.includes('fatal')) return 'critical'
    if (message.includes('warning') || message.includes('minor')) return 'low'
    return 'high'
  }

  const severity = getErrorSeverity()
  const severityColors = {
    low: 'text-yellow-500',
    medium: 'text-orange-500', 
    high: 'text-red-500',
    critical: 'text-red-600'
  }

  const severityIcons = {
    low: Activity,
    medium: AlertTriangle,
    high: Bug,
    critical: AlertTriangle
  }

  const SeverityIcon = severityIcons[severity]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <SeverityIcon className={`w-16 h-16 ${severityColors[severity]}`} />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {(t as any).errorBoundary?.title || 'Что-то пошло не так'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {(t as any).errorBoundary?.description || 'Произошла неожиданная ошибка. Попробуйте обновить страницу.'}
          </p>

          {retryCount > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Попытка восстановления: {retryCount}/{3}
              </p>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Детали ошибки (только в разработке)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                <div className="mb-2">
                  <strong>Сообщение:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Стек:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
                {errorInfo && (
                  <div className="mt-2">
                    <strong>Информация о компоненте:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col space-y-3">
            {canRetry && (
              <Button
                onClick={onRetry}
                variant="primary"
                disabled={isRetrying}
                className="flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>
                  {isRetrying 
                    ? 'Попытка восстановления...' 
                    : 'Попробовать снова'
                  }
                </span>
              </Button>
            )}
            
            <div className="flex space-x-3">
              <Button
                onClick={onReload}
                variant="secondary"
                className="flex items-center space-x-2 flex-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{(t as any).errorBoundary?.reload || 'Обновить'}</span>
              </Button>
              
              <Button
                onClick={onGoHome}
                variant="secondary"
                className="flex items-center space-x-2 flex-1"
              >
                <Home className="w-4 h-4" />
                <span>{(t as any).errorBoundary?.goHome || 'На главную'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary