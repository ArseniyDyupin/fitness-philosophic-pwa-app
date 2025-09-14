import { useState, useEffect, useCallback } from 'react'
import { db } from '@services/data'

export interface UseDexieQueryOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
}

export function useDexieQuery<T>(
  _tableName: keyof typeof db,
  queryFn: () => Promise<T>,
  deps: unknown[] = [],
  options: UseDexieQueryOptions = {}
): {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isStale: boolean
} {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 0
  } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      setData(result)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, queryFn, ...deps])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      const now = Date.now()
      if (now - lastFetch > staleTime) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, lastFetch, staleTime, fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch,
    isStale: Date.now() - lastFetch > staleTime
  }
}
