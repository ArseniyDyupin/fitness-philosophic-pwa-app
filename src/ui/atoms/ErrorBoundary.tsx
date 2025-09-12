import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import Button from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const t = useTranslations()

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {(t as any).errorBoundary?.title || 'Что-то пошло не так'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {(t as any).errorBoundary?.description || 'Произошла неожиданная ошибка. Попробуйте обновить страницу.'}
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Детали ошибки (только в разработке)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex space-x-3 justify-center">
            <Button
              onClick={handleReload}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{(t as any).errorBoundary?.reload || 'Обновить'}</span>
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>{(t as any).errorBoundary?.goHome || 'На главную'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
