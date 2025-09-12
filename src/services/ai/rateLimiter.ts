import { AI_CONFIG } from '@/constants'

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = AI_CONFIG.RATE_LIMIT_REQUESTS, windowMs: number = AI_CONFIG.RATE_LIMIT_WINDOW) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if a request is allowed for the given key
   * @param key - Unique identifier for the rate limit (e.g., user ID, IP)
   * @returns True if request is allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry) {
      // First request
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (now > entry.resetTime) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return false
    }

    // Increment count
    entry.count++
    return true
  }

  /**
   * Get remaining requests for a key
   * @param key - Unique identifier
   * @returns Number of remaining requests
   */
  getRemainingRequests(key: string): number {
    const entry = this.requests.get(key)
    if (!entry) {
      return this.maxRequests
    }

    if (Date.now() > entry.resetTime) {
      return this.maxRequests
    }

    return Math.max(0, this.maxRequests - entry.count)
  }

  /**
   * Get time until rate limit resets
   * @param key - Unique identifier
   * @returns Milliseconds until reset
   */
  getTimeUntilReset(key: string): number {
    const entry = this.requests.get(key)
    if (!entry) {
      return 0
    }

    return Math.max(0, entry.resetTime - Date.now())
  }

  /**
   * Reset rate limit for a key
   * @param key - Unique identifier
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Get all active rate limit entries (for debugging)
   */
  getEntries(): Map<string, RateLimitEntry> {
    return new Map(this.requests)
  }
}

// Global rate limiter instance
export const aiRateLimiter = new RateLimiter()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  aiRateLimiter.cleanup()
}, 5 * 60 * 1000)

/**
 * Decorator function to add rate limiting to AI service methods
 * @param keyGenerator - Function to generate rate limit key
 * @returns Decorator function
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string
) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: Parameters<T>) {
      const key = keyGenerator(...args)
      
      if (!aiRateLimiter.isAllowed(key)) {
        const remainingTime = aiRateLimiter.getTimeUntilReset(key)
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`)
      }

      return method.apply(this, args)
    }

    return descriptor
  }
}

/**
 * Hook for checking rate limit status
 * @param key - Rate limit key
 * @returns Rate limit status
 */
export function useRateLimit(key: string) {
  const remaining = aiRateLimiter.getRemainingRequests(key)
  const timeUntilReset = aiRateLimiter.getTimeUntilReset(key)
  const isAllowed = aiRateLimiter.isAllowed(key)

  return {
    remaining,
    timeUntilReset,
    isAllowed,
    reset: () => aiRateLimiter.reset(key)
  }
}

export default RateLimiter
