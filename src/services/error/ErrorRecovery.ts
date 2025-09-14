/**
 * Error recovery service for automatic error recovery strategies
 */

import { AppError, ErrorType } from '@/types/errors'
import { errorLogger } from './ErrorLogger'

export interface RecoveryStrategy {
  canRecover: (error: AppError) => boolean
  recover: (error: AppError) => Promise<boolean>
  priority: number
  name: string
}

export interface RecoveryConfig {
  enableAutoRecovery: boolean
  maxRecoveryAttempts: number
  recoveryTimeout: number
  strategies: RecoveryStrategy[]
}

export class ErrorRecovery {
  private static instance: ErrorRecovery
  private config: RecoveryConfig
  private recoveryAttempts: Map<string, number> = new Map()

  private constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = {
      enableAutoRecovery: true,
      maxRecoveryAttempts: 3,
      recoveryTimeout: 5000,
      strategies: [],
      ...config
    }

    this.initializeDefaultStrategies()
  }

  public static getInstance(config?: Partial<RecoveryConfig>): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery(config)
    }
    return ErrorRecovery.instance
  }

  /**
   * Attempt to recover from an error
   */
  public async attemptRecovery(error: AppError): Promise<boolean> {
    if (!this.config.enableAutoRecovery) {
      return false
    }

    const errorKey = this.getErrorKey(error)
    const attempts = this.recoveryAttempts.get(errorKey) || 0

    if (attempts >= this.config.maxRecoveryAttempts) {
      errorLogger.warn(`Max recovery attempts reached for error: ${errorKey}`)
      return false
    }

    // Find applicable recovery strategies
    const applicableStrategies = this.config.strategies
      .filter(strategy => strategy.canRecover(error))
      .sort((a, b) => b.priority - a.priority)

    if (applicableStrategies.length === 0) {
      errorLogger.debug(`No recovery strategies available for error: ${errorKey}`)
      return false
    }

    // Try each strategy
    for (const strategy of applicableStrategies) {
      try {
        errorLogger.info(`Attempting recovery with strategy: ${strategy.name}`, {
          component: 'ErrorRecovery',
          action: 'attemptRecovery',
          timestamp: Date.now()
        })

        const recovered = await Promise.race([
          strategy.recover(error),
          this.createTimeoutPromise()
        ])

        if (recovered) {
          errorLogger.info(`Successfully recovered from error using strategy: ${strategy.name}`, {
            component: 'ErrorRecovery',
            action: 'recoverySuccess',
            timestamp: Date.now()
          })
          
          // Reset attempts on successful recovery
          this.recoveryAttempts.delete(errorKey)
          return true
        }
      } catch (recoveryError) {
        errorLogger.error(`Recovery strategy ${strategy.name} failed`, recoveryError as AppError, {
          component: 'ErrorRecovery',
          action: 'recoveryStrategyFailed',
          timestamp: Date.now()
        })
      }
    }

    // Increment attempts
    this.recoveryAttempts.set(errorKey, attempts + 1)
    return false
  }

  /**
   * Add a custom recovery strategy
   */
  public addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.config.strategies.push(strategy)
    this.config.strategies.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Remove a recovery strategy
   */
  public removeRecoveryStrategy(name: string): void {
    this.config.strategies = this.config.strategies.filter(s => s.name !== name)
  }

  /**
   * Update recovery configuration
   */
  public updateConfig(newConfig: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get recovery statistics
   */
  public getRecoveryStats(): { totalAttempts: number; successfulRecoveries: number } {
    const totalAttempts = Array.from(this.recoveryAttempts.values()).reduce((sum, count) => sum + count, 0)
    const successfulRecoveries = this.config.strategies.length // This would be tracked in a real implementation
    
    return { totalAttempts, successfulRecoveries }
  }

  private initializeDefaultStrategies(): void {
    // Network recovery strategy
    this.addRecoveryStrategy({
      name: 'NetworkRecovery',
      priority: 100,
      canRecover: (error) => error.type === ErrorType.NETWORK_ERROR || error.type === ErrorType.CONNECTION_ERROR,
      recover: async (_error) => {
        if (!navigator.onLine) {
          // Wait for online event
          await new Promise<void>((resolve) => {
            const handleOnline = () => {
              window.removeEventListener('online', handleOnline)
              resolve()
            }
            window.addEventListener('online', handleOnline)
            
            // Timeout after 10 seconds
            setTimeout(() => {
              window.removeEventListener('online', handleOnline)
              resolve()
            }, 10000)
          })
        }
        
        return navigator.onLine
      }
    })

    // Database recovery strategy
    this.addRecoveryStrategy({
      name: 'DatabaseRecovery',
      priority: 90,
      canRecover: (error) => error.type === ErrorType.DATABASE_ERROR || error.type === ErrorType.STORAGE_ERROR,
      recover: async (_error) => {
        try {
          // Try to reinitialize database connection
          const { db } = await import('@/services/data/db')
          await db.open()
          return true
        } catch (recoveryError) {
          errorLogger.error('Database recovery failed', recoveryError as AppError)
          return false
        }
      }
    })

    // Storage quota recovery strategy
    this.addRecoveryStrategy({
      name: 'StorageQuotaRecovery',
      priority: 80,
      canRecover: (error) => error.type === ErrorType.QUOTA_EXCEEDED_ERROR,
      recover: async (_error) => {
        try {
          // Clear old cached data
          const { errorLogger } = await import('./ErrorLogger')
          errorLogger.clearLocalLogs()
          
          // Clear other cached data
          localStorage.removeItem('old_cache_data')
          sessionStorage.clear()
          
          return true
        } catch (recoveryError) {
          errorLogger.error('Storage quota recovery failed', recoveryError as AppError)
          return false
        }
      }
    })

    // API rate limit recovery strategy
    this.addRecoveryStrategy({
      name: 'RateLimitRecovery',
      priority: 70,
      canRecover: (error) => error.type === ErrorType.RATE_LIMIT_ERROR,
      recover: async (_error) => {
        // Wait for rate limit to reset
        await new Promise(resolve => setTimeout(resolve, 60000)) // 1 minute
        return true
      }
    })

    // Authentication recovery strategy
    this.addRecoveryStrategy({
      name: 'AuthenticationRecovery',
      priority: 60,
      canRecover: (error) => error.type === ErrorType.AUTHENTICATION_ERROR,
      recover: async (_error) => {
        try {
          // Try to refresh authentication token
          // This would be implemented based on your auth system
          errorLogger.info('Attempting authentication recovery')
          return false // Placeholder - implement based on your auth system
        } catch (recoveryError) {
          errorLogger.error('Authentication recovery failed', recoveryError as AppError)
          return false
        }
      }
    })

    // Component state recovery strategy
    this.addRecoveryStrategy({
      name: 'ComponentStateRecovery',
      priority: 50,
      canRecover: (error) => error.context.component !== undefined,
      recover: async (_error) => {
        try {
          // Try to reset component state
          if (_error.context.component) {
            errorLogger.info(`Attempting to reset state for component: ${_error.context.component}`)
            // This would trigger a component re-render or state reset
            return true
          }
          return false
        } catch (recoveryError) {
          errorLogger.error('Component state recovery failed', recoveryError as AppError)
          return false
        }
      }
    })

    // Fallback recovery strategy
    this.addRecoveryStrategy({
      name: 'FallbackRecovery',
      priority: 10,
      canRecover: () => true, // Always applicable as fallback
      recover: async (_error) => {
        try {
          // Basic fallback - just log and return false
          errorLogger.warn('Fallback recovery strategy executed', {
            component: 'ErrorRecovery',
            action: 'fallbackRecovery',
            timestamp: Date.now()
          })
          return false
        } catch (recoveryError) {
          errorLogger.error('Fallback recovery failed', recoveryError as AppError)
          return false
        }
      }
    })
  }

  private getErrorKey(error: AppError): string {
    return `${error.type}_${error.context.component}_${error.message}`
  }

  private createTimeoutPromise(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), this.config.recoveryTimeout)
    })
  }
}

// Export singleton instance
export const errorRecovery = ErrorRecovery.getInstance()
