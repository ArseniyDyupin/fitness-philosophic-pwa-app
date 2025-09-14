/**
 * Hook for using the centralized error handling system
 */

import { useCallback, useContext, createContext, ReactNode } from 'react'
import { 
  errorHandler, 
  errorLogger,
  errorRecovery,
  createError,
  handleError,
  executeWithRetry,
  ErrorType,
  ErrorSeverity,
  type AppError,
  type ErrorContext
} from '@/services/error'

interface ErrorHandlerContextType {
  handleError: (error: Error | AppError, context?: Partial<ErrorContext>) => Promise<void>
  executeWithRetry: (
    fn: any,
    context?: Partial<ErrorContext>,
    customRetryConfig?: { maxRetries?: number; baseDelay?: number; backoffMultiplier?: number }
  ) => Promise<any>
  createError: (
    message: string,
    type?: ErrorType,
    severity?: ErrorSeverity,
    context?: Partial<ErrorContext>
  ) => AppError
  logError: (message: string, error?: AppError, context?: ErrorContext, metadata?: Record<string, unknown>) => void
  logInfo: (message: string, context?: ErrorContext, metadata?: Record<string, unknown>) => void
  logWarning: (message: string, context?: ErrorContext, metadata?: Record<string, unknown>) => void
  attemptRecovery: (error: AppError) => Promise<boolean>
  getMetrics: () => { totalErrors: number; errorsByType: Record<string, number>; errorsBySeverity: Record<string, number> }
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | null>(null)

interface ErrorHandlerProviderProps {
  children: ReactNode
  component?: string
}

export function ErrorHandlerProvider({ children, component }: ErrorHandlerProviderProps) {
  const contextValue: ErrorHandlerContextType = {
    handleError: useCallback(async (error: Error | AppError, context?: Partial<ErrorContext>) => {
      return handleError(error, { ...context, component })
    }, [component]),

    executeWithRetry: useCallback((fn: any, context?: Partial<ErrorContext>, customRetryConfig?: { maxRetries?: number; baseDelay?: number; backoffMultiplier?: number }) => {
      return executeWithRetry(fn, { ...context, component }, customRetryConfig)
    }, [component]),

    createError: useCallback((
      message: string,
      type: ErrorType = ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity = ErrorSeverity.MEDIUM,
      context?: Partial<ErrorContext>
    ) => {
      return createError(message, type, severity, { ...context, component })
    }, [component]),

    logError: useCallback((message: string, error?: AppError, context?: ErrorContext, metadata?: Record<string, unknown>) => {
      errorLogger.error(message, error, { ...context, component, timestamp: Date.now() }, metadata)
    }, [component]),

    logInfo: useCallback((message: string, context?: ErrorContext, metadata?: Record<string, unknown>) => {
      errorLogger.info(message, { ...context, component, timestamp: Date.now() }, metadata)
    }, [component]),

    logWarning: useCallback((message: string, context?: ErrorContext, metadata?: Record<string, unknown>) => {
      errorLogger.warn(message, { ...context, component, timestamp: Date.now() }, metadata)
    }, [component]),

    attemptRecovery: useCallback(async (error: AppError) => {
      return errorRecovery.attemptRecovery(error)
    }, []),

    getMetrics: useCallback(() => {
      return errorHandler.getMetrics()
    }, [])
  }

  return (
    <ErrorHandlerContext.Provider value={contextValue}>
      {children}
    </ErrorHandlerContext.Provider>
  )
}

export function useErrorHandler(): ErrorHandlerContextType {
  const context = useContext(ErrorHandlerContext)
  
  if (!context) {
    // Fallback to direct service calls if not in provider
    return {
      handleError: async (error: Error | AppError, context?: Partial<ErrorContext>) => {
        return handleError(error, context)
      },
      executeWithRetry: (fn: any, context?: Partial<ErrorContext>, customRetryConfig?: { maxRetries?: number; baseDelay?: number; backoffMultiplier?: number }) => {
        return executeWithRetry(fn, context, customRetryConfig)
      },
      createError: (
        message: string,
        type: ErrorType = ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context?: Partial<ErrorContext>
      ) => {
        return createError(message, type, severity, context)
      },
      logError: (message: string, error?: AppError, context?: ErrorContext, metadata?: Record<string, unknown>) => {
        errorLogger.error(message, error, context, metadata)
      },
      logInfo: (message: string, context?: ErrorContext, metadata?: Record<string, unknown>) => {
        errorLogger.info(message, context, metadata)
      },
      logWarning: (message: string, context?: ErrorContext, metadata?: Record<string, unknown>) => {
        errorLogger.warn(message, context, metadata)
      },
      attemptRecovery: async (error: AppError) => {
        return errorRecovery.attemptRecovery(error)
      },
      getMetrics: () => {
        return errorHandler.getMetrics()
      }
    }
  }
  
  return context
}

// Convenience hooks for specific error types
export function useApiErrorHandler() {
  const { handleError, createError, executeWithRetry } = useErrorHandler()
  
  return {
    handleApiError: useCallback(async (error: Error, context?: Partial<ErrorContext>) => {
      const apiError = createError(error.message, ErrorType.API_ERROR, ErrorSeverity.MEDIUM, context)
      return handleError(apiError, context)
    }, [handleError, createError]),
    
    executeApiCall: useCallback((apiCall: any, context?: Partial<ErrorContext>) => {
      return executeWithRetry(apiCall, context, {
        maxRetries: 3,
        baseDelay: 1000,
        backoffMultiplier: 2
      })
    }, [executeWithRetry])
  }
}

export function useDatabaseErrorHandler() {
  const { handleError, createError } = useErrorHandler()
  
  return {
    handleDatabaseError: useCallback(async (error: Error, context?: Partial<ErrorContext>) => {
      const dbError = createError(error.message, ErrorType.DATABASE_ERROR, ErrorSeverity.HIGH, context)
      return handleError(dbError, context)
    }, [handleError, createError])
  }
}

export function useValidationErrorHandler() {
  const { handleError, createError } = useErrorHandler()
  
  return {
    handleValidationError: useCallback(async (error: Error, context?: Partial<ErrorContext>) => {
      const validationError = createError(error.message, ErrorType.VALIDATION_ERROR, ErrorSeverity.MEDIUM, context)
      return handleError(validationError, context)
    }, [handleError, createError])
  }
}
