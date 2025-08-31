export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public isUserFriendly: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', true)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', true)
    this.name = 'NetworkError'
  }
}

export class AIError extends AppError {
  constructor(message: string) {
    super(message, 'AI_ERROR', true)
    this.name = 'AIError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', false)
    this.name = 'DatabaseError'
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return 'An unexpected error occurred. Please try again.'
  }
  
  console.error('Unknown error:', error)
  return 'An unknown error occurred. Please try again.'
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) return true
  if (error instanceof Error) {
    return error.message.includes('network') || 
           error.message.includes('fetch') ||
           error.message.includes('connection')
  }
  return false
}

export function isAIError(error: unknown): boolean {
  if (error instanceof AIError) return true
  if (error instanceof Error) {
    return error.message.includes('API key') ||
           error.message.includes('rate limit') ||
           error.message.includes('AI')
  }
  return false
}

export function createUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError && error.isUserFriendly) {
    return error.message
  }
  
  if (isNetworkError(error)) {
    return 'No internet connection. Please check your connection and try again.'
  }
  
  if (isAIError(error)) {
    return 'AI service is temporarily unavailable. Please try again later.'
  }
  
  return 'Something went wrong. Please try again.'
}
