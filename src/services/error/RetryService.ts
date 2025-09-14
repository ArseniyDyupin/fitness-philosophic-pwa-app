/**
 * Retry service for API calls and other operations
 */

import { errorHandler } from './ErrorHandler'
import { RetryConfig } from '@/types/errors'

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryCondition?: (error: Error) => boolean
  onRetry?: (attempt: number, error: Error) => void
  onMaxRetriesReached?: (error: Error) => void
}

export class RetryService {
  private static instance: RetryService

  private constructor() {}

  public static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService()
    }
    return RetryService.instance
  }

  /**
   * Execute a function with retry logic
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context: string = 'Unknown'
  ): Promise<T> {
    const config = this.getRetryConfig(options)
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn()
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 0) {
          console.info(`Retry successful for ${context} after ${attempt} attempts`)
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        // Check if we should retry
        if (attempt < config.maxRetries && this.shouldRetry(error as Error, config)) {
          const delay = this.calculateDelay(attempt, config)
          
          // Call onRetry callback
          options.onRetry?.(attempt + 1, error as Error)
          
          // Log retry attempt
          console.warn(`Retry attempt ${attempt + 1}/${config.maxRetries} for ${context} after ${delay}ms delay`)
          
          // Wait before retry
          await this.sleep(delay)
          continue
        }
        
        // Max retries reached or not retryable
        break
      }
    }

    // All retries failed
    const finalError = lastError!
    options.onMaxRetriesReached?.(finalError)
    
    // Report to error handler
    await errorHandler.handleError(finalError, {
      component: context,
      action: 'retryFailed',
      metadata: {
        maxRetries: config.maxRetries,
        finalAttempt: true
      }
    })
    
    throw finalError
  }

  /**
   * Execute multiple functions in parallel with retry logic
   */
  public async executeParallelWithRetry<T>(
    functions: Array<() => Promise<T>>,
    options: RetryOptions = {},
    context: string = 'Parallel'
  ): Promise<T[]> {
    const promises = functions.map((fn, index) => 
      this.executeWithRetry(fn, options, `${context}[${index}]`)
    )
    
    return Promise.all(promises)
  }

  /**
   * Execute functions sequentially with retry logic
   */
  public async executeSequentialWithRetry<T>(
    functions: Array<() => Promise<T>>,
    options: RetryOptions = {},
    context: string = 'Sequential'
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < functions.length; i++) {
      const result = await this.executeWithRetry(
        functions[i], 
        options, 
        `${context}[${i}]`
      )
      results.push(result)
    }
    
    return results
  }

  /**
   * Create a retry wrapper for a function
   */
  public createRetryWrapper<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    options: RetryOptions = {},
    context: string = 'Wrapped'
  ): T {
    return (async (...args: Parameters<T>) => {
      return this.executeWithRetry(
        () => fn(...args),
        options,
        context
      )
    }) as T
  }

  /**
   * Retry with exponential backoff and jitter
   */
  public async executeWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context: string = 'ExponentialBackoff'
  ): Promise<T> {
    const config = this.getRetryConfig(options)
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt < config.maxRetries && this.shouldRetry(error as Error, config)) {
          // Exponential backoff with jitter
          const baseDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt)
          const jitter = Math.random() * 0.1 * baseDelay // 10% jitter
          const delay = Math.min(baseDelay + jitter, config.maxDelay)
          
          options.onRetry?.(attempt + 1, error as Error)
          console.warn(`Exponential backoff retry ${attempt + 1}/${config.maxRetries} for ${context} after ${Math.round(delay)}ms`)
          
          await this.sleep(delay)
          continue
        }
        
        break
      }
    }

    const finalError = lastError!
    options.onMaxRetriesReached?.(finalError)
    
    await errorHandler.handleError(finalError, {
      component: context,
      action: 'exponentialBackoffFailed',
      metadata: {
        maxRetries: config.maxRetries,
        strategy: 'exponentialBackoff'
      }
    })
    
    throw finalError
  }

  /**
   * Retry with circuit breaker pattern
   */
  public createCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    options: {
      failureThreshold?: number
      recoveryTimeout?: number
      monitoringPeriod?: number
    } = {},
    context: string = 'CircuitBreaker'
  ): T {
    const {
      failureThreshold = 5,
      recoveryTimeout = 60000, // 1 minute
      monitoringPeriod: _monitoringPeriod = 10000 // 10 seconds
    } = options

    let failures = 0
    let lastFailureTime = 0
    let state: 'closed' | 'open' | 'half-open' = 'closed'

    return (async (...args: Parameters<T>) => {
      const now = Date.now()

      // Check circuit breaker state
      if (state === 'open') {
        if (now - lastFailureTime > recoveryTimeout) {
          state = 'half-open'
          console.info(`Circuit breaker for ${context} transitioning to half-open`)
        } else {
          throw new Error(`Circuit breaker is open for ${context}`)
        }
      }

      try {
        const result = await fn(...args)
        
        // Success - reset circuit breaker
        if (state === 'half-open') {
          state = 'closed'
          failures = 0
          console.info(`Circuit breaker for ${context} closed after successful recovery`)
        }
        
        return result
      } catch (error) {
        failures++
        lastFailureTime = now
        
        if (failures >= failureThreshold) {
          state = 'open'
          console.error(`Circuit breaker for ${context} opened after ${failures} failures`)
        }
        
        throw error
      }
    }) as T
  }

  private getRetryConfig(options: RetryOptions): Required<RetryConfig> {
    return {
      maxRetries: options.maxRetries ?? 3,
      baseDelay: options.baseDelay ?? 1000,
      maxDelay: options.maxDelay ?? 10000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      retryCondition: options.retryCondition ?? this.defaultRetryCondition
    }
  }

  private shouldRetry(error: Error, config: Required<RetryConfig>): boolean {
    return config.retryCondition ? config.retryCondition(error as any) : this.defaultRetryCondition(error)
  }

  private defaultRetryCondition(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // Retry on network errors
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('connection') ||
        message.includes('fetch')) {
      return true
    }
    
    // Retry on server errors (5xx)
    if (message.includes('500') || 
        message.includes('502') || 
        message.includes('503') || 
        message.includes('504')) {
      return true
    }
    
    // Retry on rate limiting
    if (message.includes('rate limit') || message.includes('429')) {
      return true
    }
    
    // Don't retry on client errors (4xx except 429)
    if (message.includes('400') || 
        message.includes('401') || 
        message.includes('403') || 
        message.includes('404')) {
      return false
    }
    
    // Default to retry for unknown errors
    return true
  }

  private calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt)
    return Math.min(delay, config.maxDelay)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const retryService = RetryService.getInstance()
