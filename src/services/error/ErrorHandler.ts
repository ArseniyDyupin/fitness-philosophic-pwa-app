/**
 * Centralized error handling service
 */

import { 
  ErrorType, 
  ErrorSeverity, 
  ErrorContext, 
  AppError, 
  ErrorReport, 
  RetryConfig, 
  ErrorHandlerConfig,
  ErrorMetrics 
} from '@/types/errors'

export class ErrorHandler {
  private static instance: ErrorHandler
  private config: ErrorHandlerConfig
  private errorReports: Map<string, ErrorReport> = new Map()
  private metrics: ErrorMetrics
  private retryConfigs: Map<ErrorType, RetryConfig> = new Map()

  private constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: true,
      enableRecovery: true,
      logLevel: 'error',
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    }

    this.metrics = {
      totalErrors: 0,
      errorsByType: {} as Record<ErrorType, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorsByComponent: {},
      averageResolutionTime: 0,
      retrySuccessRate: 0
    }

    this.initializeRetryConfigs()
    this.setupGlobalErrorHandlers()
  }

  public static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config)
    }
    return ErrorHandler.instance
  }

  /**
   * Create a standardized error from any error
   */
  public createError(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {}
  ): AppError {
    const baseError = typeof error === 'string' ? new Error(error) : error
    
    const appError: AppError = {
      ...baseError,
      type,
      severity,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        stack: baseError.stack,
        ...context
      },
      isRetryable: this.isRetryable(type),
      retryCount: 0,
      maxRetries: this.getRetryConfig(type)?.maxRetries || this.config.maxRetries
    }

    return appError
  }

  /**
   * Handle an error with full processing
   */
  public async handleError(
    error: Error | AppError,
    context: Partial<ErrorContext> = {}
  ): Promise<void> {
    const appError = this.isAppError(error) ? error : this.createError(error, ErrorType.UNKNOWN_ERROR, ErrorSeverity.MEDIUM, context)
    
    // Update metrics
    this.updateMetrics(appError)
    
    // Log error
    if (this.config.enableLogging) {
      this.logError(appError)
    }
    
    // Report error
    if (this.config.enableReporting) {
      await this.reportError(appError)
    }
    
    // Attempt recovery
    if (this.config.enableRecovery) {
      await this.attemptRecovery(appError)
    }
  }

  /**
   * Execute a function with error handling and retry logic
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: Partial<ErrorContext> = {},
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    let lastError: AppError | null = null
    const retryConfig = this.getRetryConfig(ErrorType.UNKNOWN_ERROR, customRetryConfig)
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const result = await fn()
        
        // Reset retry count on success
        if (lastError) {
          lastError.retryCount = 0
        }
        
        return result
      } catch (error) {
        const appError = this.createError(
          error as Error,
          this.determineErrorType(error as Error),
          ErrorSeverity.MEDIUM,
          { ...context, metadata: { ...context.metadata, retryCount: attempt } }
        )
        
        lastError = appError
        
        // Check if we should retry
        if (attempt < retryConfig.maxRetries && this.shouldRetry(appError, retryConfig)) {
          const delay = this.calculateRetryDelay(attempt, retryConfig)
          await this.sleep(delay)
          continue
        }
        
        // Final attempt failed or not retryable
        await this.handleError(appError, context)
        throw appError
      }
    }
    
    throw lastError!
  }

  /**
   * Get error metrics
   */
  public getMetrics(): ErrorMetrics {
    return { ...this.metrics }
  }

  /**
   * Get error reports
   */
  public getErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values())
  }

  /**
   * Clear error reports
   */
  public clearErrorReports(): void {
    this.errorReports.clear()
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  private initializeRetryConfigs(): void {
    // Network errors - more retries
    this.retryConfigs.set(ErrorType.NETWORK_ERROR, {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    })

    // API errors - moderate retries
    this.retryConfigs.set(ErrorType.API_ERROR, {
      maxRetries: 3,
      baseDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 1.5
    })

    // Rate limit - longer delays
    this.retryConfigs.set(ErrorType.RATE_LIMIT_ERROR, {
      maxRetries: 2,
      baseDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 3
    })

    // Database errors - fewer retries
    this.retryConfigs.set(ErrorType.DATABASE_ERROR, {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2
    })

    // Default config
    this.retryConfigs.set(ErrorType.UNKNOWN_ERROR, {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2
    })
  }

  private setupGlobalErrorHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        component: 'Global',
        action: 'unhandledrejection'
      })
    })

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'Global',
        action: 'globalError'
      })
    })
  }

  private isAppError(error: unknown): error is AppError {
    return !!(error && typeof error === 'object' && 'type' in error && 'severity' in error)
  }

  private isRetryable(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.CONNECTION_ERROR,
      ErrorType.API_ERROR,
      ErrorType.RATE_LIMIT_ERROR,
      ErrorType.SERVER_ERROR,
      ErrorType.DATABASE_ERROR
    ]
    return retryableTypes.includes(type)
  }

  private getRetryConfig(type: ErrorType, customConfig?: Partial<RetryConfig>): RetryConfig {
    const baseConfig = this.retryConfigs.get(type) || this.retryConfigs.get(ErrorType.UNKNOWN_ERROR)!
    return { ...baseConfig, ...customConfig }
  }

  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR
    }
    if (message.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR
    }
    if (message.includes('rate limit')) {
      return ErrorType.RATE_LIMIT_ERROR
    }
    if (message.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION_ERROR
    }
    if (message.includes('forbidden')) {
      return ErrorType.AUTHORIZATION_ERROR
    }
    if (message.includes('not found')) {
      return ErrorType.NOT_FOUND_ERROR
    }
    if (message.includes('validation')) {
      return ErrorType.VALIDATION_ERROR
    }
    if (message.includes('database') || message.includes('indexeddb')) {
      return ErrorType.DATABASE_ERROR
    }
    
    return ErrorType.UNKNOWN_ERROR
  }

  private shouldRetry(error: AppError, config: RetryConfig): boolean {
    if (!error.isRetryable) return false
    if (error.retryCount! >= config.maxRetries) return false
    if (config.retryCondition && !config.retryCondition(error)) return false
    
    return true
  }

  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt)
    return Math.min(delay, config.maxDelay)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private updateMetrics(error: AppError): void {
    this.metrics.totalErrors++
    
    // Update by type
    this.metrics.errorsByType[error.type] = (this.metrics.errorsByType[error.type] || 0) + 1
    
    // Update by severity
    this.metrics.errorsBySeverity[error.severity] = (this.metrics.errorsBySeverity[error.severity] || 0) + 1
    
    // Update by component
    if (error.context.component) {
      this.metrics.errorsByComponent[error.context.component] = (this.metrics.errorsByComponent[error.context.component] || 0) + 1
    }
  }

  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity)
    const message = `[${error.type}] ${error.message}`
    const context = {
      severity: error.severity,
      component: error.context.component,
      action: error.context.action,
      retryCount: error.retryCount,
      timestamp: new Date(error.context.timestamp).toISOString()
    }

    switch (logLevel) {
      case 'debug':
        console.debug(message, context, error)
        break
      case 'info':
        console.info(message, context, error)
        break
      case 'warn':
        console.warn(message, context, error)
        break
      case 'error':
        console.error(message, context, error)
        break
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'debug' | 'info' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'debug'
      case ErrorSeverity.MEDIUM:
        return 'info'
      case ErrorSeverity.HIGH:
        return 'warn'
      case ErrorSeverity.CRITICAL:
        return 'error'
      default:
        return 'error'
    }
  }

  private async reportError(error: AppError): Promise<void> {
    const reportId = this.generateReportId()
    const report: ErrorReport = {
      id: reportId,
      error,
      timestamp: Date.now(),
      resolved: false
    }

    this.errorReports.set(reportId, report)

    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or your own backend
    if (process.env.NODE_ENV === 'production') {
      await this.sendToErrorReportingService(report)
    }
  }

  private async attemptRecovery(error: AppError): Promise<void> {
    // Implement recovery strategies based on error type
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        await this.attemptNetworkRecovery(error)
        break
      case ErrorType.DATABASE_ERROR:
        await this.attemptDatabaseRecovery(error)
        break
      case ErrorType.STORAGE_ERROR:
        await this.attemptStorageRecovery(error)
        break
      default:
        // No specific recovery strategy
        break
    }
  }

  private async attemptNetworkRecovery(_error: AppError): Promise<void> {
    // Check if we're online
    if (!navigator.onLine) {
      // Wait for online event
      await new Promise<void>((resolve) => {
        const handleOnline = () => {
          window.removeEventListener('online', handleOnline)
          resolve()
        }
        window.addEventListener('online', handleOnline)
      })
    }
  }

  private async attemptDatabaseRecovery(_error: AppError): Promise<void> {
    // Try to reinitialize database connection
    try {
      // This would be implemented based on your database setup
      console.info('Attempting database recovery...')
    } catch (recoveryError) {
      console.error('Database recovery failed:', recoveryError)
    }
  }

  private async attemptStorageRecovery(_error: AppError): Promise<void> {
    // Try to clear storage quota or migrate data
    try {
      console.info('Attempting storage recovery...')
    } catch (recoveryError) {
      console.error('Storage recovery failed:', recoveryError)
    }
  }

  private generateReportId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendToErrorReportingService(report: ErrorReport): Promise<void> {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just log it
    console.info('Sending error report to monitoring service:', report.id)
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()
