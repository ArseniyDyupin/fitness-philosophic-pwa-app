/**
 * Error logging service for centralized logging and monitoring
 */

import { AppError, ErrorSeverity, ErrorContext } from '@/types/errors'

const SENSITIVE_KEY = /api.?key|token|authorization|photo|data.?url|email|user.?id|session.?id/i

function redactString(value: string): string {
  return value
    .replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi, '[REDACTED_IMAGE]')
    .replace(/\bsk-[a-z0-9_-]+\b/gi, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED_TOKEN]')
}

export function redactSensitive(value: unknown, key = ''): unknown {
  if (SENSITIVE_KEY.test(key)) return '[REDACTED]'
  if (typeof value === 'string') return redactString(value)
  if (Array.isArray(value)) return value.map(item => redactSensitive(item))
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactSensitive(entryValue, entryKey)
      ])
    )
  }
  return value
}

export interface LogEntry {
  id: string
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  error?: AppError
  context?: ErrorContext
  metadata?: Record<string, unknown>
}

export interface LogConfig {
  enableConsole: boolean
  enableLocalStorage: boolean
  enableRemoteLogging: boolean
  maxLocalLogs: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  remoteEndpoint?: string
  batchSize: number
  flushInterval: number
}

export class ErrorLogger {
  private static instance: ErrorLogger
  private config: LogConfig
  private logQueue: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout
  private isOnline = navigator.onLine

  private constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      enableConsole: true,
      enableLocalStorage: true,
      enableRemoteLogging: false,
      maxLocalLogs: 1000,
      logLevel: 'info',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config
    }

    this.setupEventListeners()
    this.startFlushTimer()
  }

  public static getInstance(config?: Partial<LogConfig>): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger(config)
    }
    return ErrorLogger.instance
  }

  /**
   * Log a debug message
   */
  public debug(message: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.log('debug', message, undefined, context, metadata)
  }

  /**
   * Log an info message
   */
  public info(message: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.log('info', message, undefined, context, metadata)
  }

  /**
   * Log a warning message
   */
  public warn(message: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.log('warn', message, undefined, context, metadata)
  }

  /**
   * Log an error
   */
  public error(message: string, error?: AppError, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.log('error', message, error, context, metadata)
  }

  /**
   * Log an error with automatic severity detection
   */
  public logError(error: AppError, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    const level = this.getLogLevel(error.severity)
    const message = `[${error.type}] ${error.message}`
    this.log(level, message, error, context, metadata)
  }

  /**
   * Log performance metrics
   */
  public logPerformance(operation: string, duration: number, context?: ErrorContext): void {
    this.info(`Performance: ${operation} took ${duration}ms`, context, {
      operation,
      duration,
      type: 'performance'
    })
  }

  /**
   * Log user actions
   */
  public logUserAction(action: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, context, {
      action,
      type: 'user_action',
      ...metadata
    })
  }

  /**
   * Log API calls
   */
  public logApiCall(
    method: string, 
    url: string, 
    status: number, 
    duration: number, 
    context?: ErrorContext
  ): void {
    const level = status >= 400 ? 'error' : 'info'
    this.log(level, `API ${method} ${url} - ${status} (${duration}ms)`, undefined, context, {
      method,
      url,
      status,
      duration,
      type: 'api_call'
    })
  }

  /**
   * Get logs from local storage
   */
  public getLocalLogs(limit?: number): LogEntry[] {
    try {
      const logsJson = localStorage.getItem('error_logs')
      if (!logsJson) return []
      
      const logs: LogEntry[] = JSON.parse(logsJson)
      return limit ? logs.slice(-limit) : logs
    } catch (error) {
      console.error('Failed to get local logs:', error)
      return []
    }
  }

  /**
   * Clear local logs
   */
  public clearLocalLogs(): void {
    try {
      localStorage.removeItem('error_logs')
    } catch (error) {
      console.error('Failed to clear local logs:', error)
    }
  }

  /**
   * Export logs
   */
  public exportLogs(): string {
    const logs = this.getLocalLogs()
    return JSON.stringify(logs, null, 2)
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.flushInterval) {
      this.restartFlushTimer()
    }
  }

  /**
   * Force flush logs
   */
  public async flush(): Promise<void> {
    if (this.logQueue.length === 0) return

    const logsToFlush = [...this.logQueue]
    this.logQueue = []

    // Send to remote logging service
    if (this.config.enableRemoteLogging && this.isOnline) {
      await this.sendToRemoteService(logsToFlush)
    }
  }

  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    error?: AppError,
    context?: ErrorContext,
    metadata?: Record<string, unknown>
  ): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) return

    const safeContext = context
      ? redactSensitive({ ...context, stack: undefined }) as ErrorContext
      : undefined
    const safeError = error
      ? {
          ...error,
          message: redactString(error.message),
          stack: undefined,
          originalError: undefined,
          context: redactSensitive({ ...error.context, stack: undefined }) as ErrorContext
        } as AppError
      : undefined
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      message: redactString(message),
      error: safeError,
      context: safeContext,
      metadata: redactSensitive(metadata) as Record<string, unknown> | undefined
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry)
    }

    // Local storage logging
    if (this.config.enableLocalStorage) {
      this.logToLocalStorage(logEntry)
    }

    // Queue for remote logging
    if (this.config.enableRemoteLogging) {
      this.logQueue.push(logEntry)
      
      // Flush if batch size reached
      if (this.logQueue.length >= this.config.batchSize) {
        this.flush()
      }
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const configLevelIndex = levels.indexOf(this.config.logLevel)
    const logLevelIndex = levels.indexOf(level)
    
    return logLevelIndex >= configLevelIndex
  }

  private logToConsole(logEntry: LogEntry): void {
    const { level, message, error, context, metadata } = logEntry
    const timestamp = new Date(logEntry.timestamp).toISOString()
    
    const logData = {
      timestamp,
      level,
      message,
      context: context?.component,
      action: context?.action,
      metadata
    }

    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] ${message}`, logData, error)
        break
      case 'info':
        console.info(`[${timestamp}] ${message}`, logData, error)
        break
      case 'warn':
        console.warn(`[${timestamp}] ${message}`, logData, error)
        break
      case 'error':
        console.error(`[${timestamp}] ${message}`, logData, error)
        break
    }
  }

  private logToLocalStorage(logEntry: LogEntry): void {
    try {
      const existingLogs = this.getLocalLogs()
      const updatedLogs = [...existingLogs, logEntry]
      
      // Keep only the most recent logs
      if (updatedLogs.length > this.config.maxLocalLogs) {
        updatedLogs.splice(0, updatedLogs.length - this.config.maxLocalLogs)
      }
      
      localStorage.setItem('error_logs', JSON.stringify(updatedLogs))
    } catch (error) {
      console.error('Failed to log to local storage:', error)
    }
  }

  private async sendToRemoteService(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send logs to remote service:', error)
      // Re-queue logs for later retry
      this.logQueue.unshift(...logs)
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

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupEventListeners(): void {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.info('Network connection restored')
      // Flush queued logs when back online
      this.flush()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.warn('Network connection lost')
    })

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Flush logs when page becomes hidden
        this.flush()
      }
    })

    // Before unload
    window.addEventListener('beforeunload', () => {
      // Send logs synchronously before page unload
      if (this.logQueue.length > 0) {
        navigator.sendBeacon?.(
          this.config.remoteEndpoint || '',
          JSON.stringify({ logs: this.logQueue })
        )
      }
    })
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private restartFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.startFlushTimer()
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance()
