/**
 * Error types and interfaces for centralized error handling
 */

export enum ErrorType {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  QUOTA_EXCEEDED_ERROR = 'QUOTA_EXCEEDED_ERROR',
  
  // Business logic errors
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  WORKFLOW_ERROR = 'WORKFLOW_ERROR',
  
  // System errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  component?: string
  action?: string
  timestamp: number
  userAgent?: string
  url?: string
  stack?: string
  metadata?: Record<string, unknown>
}

export interface AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  context: ErrorContext
  isRetryable: boolean
  retryCount?: number
  maxRetries?: number
  originalError?: Error
}

export interface ErrorReport {
  id: string
  error: AppError
  timestamp: number
  resolved: boolean
  resolution?: string
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition?: (error: AppError) => boolean
}

export interface ErrorHandlerConfig {
  enableLogging: boolean
  enableReporting: boolean
  enableRecovery: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  maxRetries: number
  retryDelay: number
}

export interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<ErrorType, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  errorsByComponent: Record<string, number>
  averageResolutionTime: number
  retrySuccessRate: number
}
