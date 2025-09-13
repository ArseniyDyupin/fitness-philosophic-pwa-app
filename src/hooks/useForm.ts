import { useState, useCallback, useMemo } from 'react'
import type { UseFormOptions, UseFormReturn } from '@/types/hooks'

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field
  const validateField = useCallback((name: keyof T, value: T[keyof T]): string | null => {
    if (!validationSchema) return null

    try {
      const fieldSchema = validationSchema.shape?.[name]
      if (!fieldSchema) return null

      fieldSchema.parse(value)
      return null
    } catch (error: unknown) {
      return (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message || 'Invalid value'
    }
  }, [validationSchema])

  // Validate all fields
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true

    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    try {
      validationSchema.parse(values)
    } catch (error: unknown) {
      (error as { errors?: Array<{ path?: string[]; message: string }> })?.errors?.forEach((err) => {
        const fieldName = err.path?.[0] as keyof T
        if (fieldName) {
          newErrors[fieldName] = err.message
          isValid = false
        }
      })
    }

    setErrors(newErrors)
    return isValid
  }, [values, validationSchema])

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && validate()
  }, [errors, validate])

  // Set field value
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error || undefined }))
    }
  }, [validateOnChange, validateField])

  // Set field error
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  // Set field touched
  const setTouchedField = useCallback((name: keyof T, touched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: touched }))
  }, [])

  // Handle field change
  const handleChange = useCallback((name: keyof T) => (value: T[keyof T]) => {
    setValue(name, value)
  }, [setValue])

  // Handle field blur
  const handleBlur = useCallback((name: keyof T) => () => {
    setTouchedField(name, true)
    
    if (validateOnBlur) {
      const error = validateField(name, values[name])
      setErrors(prev => ({ ...prev, [name]: error || undefined }))
    }
  }, [validateOnBlur, validateField, values, setTouchedField])

  // Handle form submit
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Partial<Record<keyof T, boolean>>)
    setTouched(allTouched)

    // Validate form
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched: setTouchedField,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate
  }
}

// Hook for async operations
export function useAsync<T = any, V = any>(
  asyncFunction: (variables: V) => Promise<T>,
  options: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (variables: V): Promise<T> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFunction(variables)
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [asyncFunction, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}
