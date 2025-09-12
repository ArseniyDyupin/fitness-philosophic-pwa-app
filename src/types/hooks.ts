import type { AsyncState } from './api'

// Hook Options
export interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  retry?: boolean | number
  retryDelay?: number
}

export interface UseQueryOptions<T = any> extends UseAsyncOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnMount?: boolean
  select?: (data: T) => any
}

export interface UseMutationOptions<T = any> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: (data?: T, error?: Error) => void
}

// Hook Return Types
export interface UseAsyncReturn<T = any> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T>
  reset: () => void
  retry: () => Promise<T>
}

export interface UseQueryReturn<T = any> extends AsyncState<T> {
  refetch: () => Promise<T>
  invalidate: () => void
  isStale: boolean
  isFetching: boolean
}

export interface UseMutationReturn<T = any, V = any> {
  mutate: (variables: V) => Promise<T>
  mutateAsync: (variables: V) => Promise<T>
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  reset: () => void
}

// Stats Hook Types
export interface StatsPeriod {
  start: Date
  end: Date
  type: 'day' | 'week' | 'month' | 'year' | 'custom'
}

export interface StatsData {
  calories: number
  minutes: number
  exercises: number
  workouts: number
  period: StatsPeriod
}

export interface UseStatsOptions {
  period?: StatsPeriod
  includeIncomplete?: boolean
  groupBy?: 'day' | 'week' | 'month'
}

// Form Hook Types
export interface UseFormOptions<T = Record<string, any>> {
  initialValues: T
  validationSchema?: any // Zod schema
  onSubmit: (values: T) => void | Promise<void>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export interface UseFormReturn<T = Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  setValue: (name: keyof T, value: T[keyof T]) => void
  setError: (name: keyof T, error: string) => void
  setTouched: (name: keyof T, touched: boolean) => void
  handleChange: (name: keyof T) => (value: T[keyof T]) => void
  handleBlur: (name: keyof T) => () => void
  handleSubmit: (e?: React.FormEvent) => void
  reset: () => void
  validate: () => boolean
}
