/**
 * Error handling services exports
 */

import { ErrorHandler, errorHandler } from './ErrorHandler'
import { RetryService, retryService } from './RetryService'
import { ErrorLogger, errorLogger } from './ErrorLogger'
import { ErrorRecovery, errorRecovery } from './ErrorRecovery'
import {
  ErrorType,
  ErrorSeverity,
  type ErrorContext,
  type AppError,
  type RetryConfig
} from '@/types/errors'

// Re-export services
export { ErrorHandler, errorHandler, RetryService, retryService, ErrorLogger, errorLogger, ErrorRecovery, errorRecovery }

// Re-export types and enums
export {
  ErrorType,
  ErrorSeverity,
  type ErrorContext,
  type AppError,
  type RetryConfig
} from '@/types/errors'

// Utility functions for common error handling patterns
export const createError = (
  message: string,
  type: ErrorType = ErrorType.UNKNOWN_ERROR,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context: Partial<ErrorContext> = {}
): AppError => {
  return errorHandler.createError(message, type, severity, context)
}

export const handleError = async (
  error: Error | AppError,
  context: Partial<ErrorContext> = {}
): Promise<void> => {
  return errorHandler.handleError(error, context)
}

export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  context: Partial<ErrorContext> = {},
  customRetryConfig?: Partial<RetryConfig>
): Promise<T> => {
  return errorHandler.executeWithRetry(fn, context, customRetryConfig)
}

// Convenience functions for common error types
export const createNetworkError = (message: string, context?: Partial<ErrorContext>): AppError => {
  return createError(message, ErrorType.NETWORK_ERROR, ErrorSeverity.HIGH, context)
}

export const createValidationError = (message: string, context?: Partial<ErrorContext>): AppError => {
  return createError(message, ErrorType.VALIDATION_ERROR, ErrorSeverity.MEDIUM, context)
}

export const createDatabaseError = (message: string, context?: Partial<ErrorContext>): AppError => {
  return createError(message, ErrorType.DATABASE_ERROR, ErrorSeverity.HIGH, context)
}

export const createApiError = (message: string, context?: Partial<ErrorContext>): AppError => {
  return createError(message, ErrorType.API_ERROR, ErrorSeverity.MEDIUM, context)
}

export const createBusinessError = (message: string, context?: Partial<ErrorContext>): AppError => {
  return createError(message, ErrorType.BUSINESS_ERROR, ErrorSeverity.MEDIUM, context)
}
