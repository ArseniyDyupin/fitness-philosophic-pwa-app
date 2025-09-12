import { useState, useCallback, useMemo, useEffect } from 'react'
import { z } from 'zod'
import { validateForm } from '@/validation/schemas'

export interface UseValidatedFormOptions<T> {
  initialValues: T
  validationSchema: z.ZodSchema<T>
  onSubmit: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export interface UseValidatedFormReturn<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  setValue: (name: keyof T, value: T[keyof T]) => void
  setValues: (values: Partial<T>) => void
  setError: (name: keyof T, error: string) => void
  setTouched: (name: keyof T, touched: boolean) => void
  handleChange: (name: keyof T, value: T[keyof T]) => void
  handleBlur: (name: keyof T) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
  validate: () => boolean
  validateField: (name: keyof T) => boolean
}

/**
 * Enhanced form hook with Zod validation
 * @param options - Form configuration options
 * @returns Form state and handlers
 */
export function useValidatedForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouchedState] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field
  const validateFieldValue = useCallback((name: keyof T, value: T[keyof T]): string | null => {
    try {
      // Create a partial object with just this field
      const partialData = { [name]: value }
      const result = validateForm(validationSchema, partialData)
      return result.success ? null : result.errors?.[name as string] || null
    } catch {
      return null
    }
  }, [validationSchema])

  // Validate entire form
  const validateFormData = useCallback((): boolean => {
    const result = validateForm(validationSchema, values)
    
    if (result.success) {
      setErrors({})
      return true
    } else {
      setErrors(result.errors || {})
      return false
    }
  }, [validationSchema, values])

  // Set a single value
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange) {
      const error = validateFieldValue(name, value)
      setErrors(prev => {
        if (error) {
          return { ...prev, [name as string]: error }
        } else {
          const { [name as string]: _, ...rest } = prev
          return rest
        }
      })
    }
  }, [validateOnChange, validateFieldValue])

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
    
    if (validateOnChange) {
      // Validate all changed fields
      Object.entries(newValues).forEach(([name, value]) => {
        const error = validateFieldValue(name as keyof T, value)
        setErrors(prev => {
          if (error) {
            return { ...prev, [name]: error }
          } else {
            const { [name]: _, ...rest } = prev
            return rest
          }
        })
      })
    }
  }, [validateOnChange, validateFieldValue])

  // Set error for a field
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }))
  }, [])

  // Set touched state for a field
  const setTouched = useCallback((name: keyof T, touchedValue: boolean) => {
    setTouchedState(prev => ({ ...prev, [name as string]: touchedValue }))
  }, [])

  // Handle field change
  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setValue(name, value)
  }, [setValue])

  // Handle field blur
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(name, true)
    
    if (validateOnBlur) {
      const error = validateFieldValue(name, values[name])
      setErrors(prev => {
        if (error) {
          return { ...prev, [name as string]: error }
        } else {
          const { [name as string]: _, ...rest } = prev
          return rest
        }
      })
    }
  }, [validateOnBlur, validateFieldValue, setTouched, values])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouchedState(allTouched)

    // Validate form
    if (!validateFormData()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle submission errors
      if (error instanceof Error) {
        setError('general' as keyof T, error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateFormData, onSubmit, setError])

  // Reset form
  const reset = useCallback(() => {
    setValuesState(initialValues)
    setErrors({})
    setTouchedState({})
    setIsSubmitting(false)
  }, [initialValues])

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && validateFormData()
  }, [errors, validateFormData])

  // Validate single field
  const validateField = useCallback((name: keyof T): boolean => {
    const error = validateFieldValue(name, values[name])
    setErrors(prev => {
      if (error) {
        return { ...prev, [name as string]: error }
      } else {
        const { [name as string]: _, ...rest } = prev
        return rest
      }
    })
    return !error
  }, [validateFieldValue, values])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setValues,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate: validateFormData,
    validateField
  }
}

/**
 * Hook for async operations with loading states
 * @param asyncFunction - Async function to execute
 * @param options - Configuration options
 * @returns Async state and handlers
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
): {
  data: T | null
  loading: boolean
  error: Error | null
  execute: () => Promise<void>
  reset: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFunction()
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [asyncFunction, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}
