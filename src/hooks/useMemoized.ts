import { useMemo, useRef, useCallback, useState, useEffect } from 'react'

/**
 * Custom hook for memoizing expensive calculations with custom comparison
 * @param factory - Function that returns the value to memoize
 * @param deps - Dependencies array
 * @param compareFn - Custom comparison function (optional)
 * @returns Memoized value
 */
export function useMemoized<T>(
  factory: () => T,
  deps: React.DependencyList,
  compareFn?: (prev: React.DependencyList, next: React.DependencyList) => boolean
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  return useMemo(() => {
    if (!ref.current || !compareDeps(ref.current.deps, deps, compareFn)) {
      ref.current = { deps: [...deps], value: factory() }
    }
    return ref.current.value
  }, deps)
}

/**
 * Compares two dependency arrays
 * @param prev - Previous dependencies
 * @param next - Next dependencies
 * @param compareFn - Custom comparison function
 * @returns True if dependencies are equal
 */
function compareDeps(
  prev: React.DependencyList,
  next: React.DependencyList,
  compareFn?: (prev: React.DependencyList, next: React.DependencyList) => boolean
): boolean {
  if (compareFn) {
    return compareFn(prev, next)
  }

  if (prev.length !== next.length) {
    return false
  }

  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) {
      return false
    }
  }

  return true
}

/**
 * Hook for memoizing expensive calculations with deep comparison
 * @param factory - Function that returns the value to memoize
 * @param deps - Dependencies array
 * @returns Memoized value
 */
export function useDeepMemoized<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemoized(factory, deps, deepCompare)
}

/**
 * Deep comparison function for objects and arrays
 * @param prev - Previous value
 * @param next - Next value
 * @returns True if values are deeply equal
 */
function deepCompare(prev: React.DependencyList, next: React.DependencyList): boolean {
  if (prev.length !== next.length) {
    return false
  }

  for (let i = 0; i < prev.length; i++) {
    if (!deepEqual(prev[i], next[i])) {
      return false
    }
  }

  return true
}

/**
 * Deep equality check for any two values
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  }

  if (a == null || b == null) {
    return false
  }

  if (typeof a !== typeof b) {
    return false
  }

  if (typeof a !== 'object') {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false
  }

  if (Array.isArray(a)) {
    if ((a as any).length !== (b as any).length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual((a as any)[i], (b as any)[i])) {
        return false
      }
    }
    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false
    }
    if (!deepEqual((a as any)[key], (b as any)[key])) {
      return false
    }
  }

  return true
}

/**
 * Hook for memoizing callbacks with stable reference
 * @param callback - Callback function
 * @param deps - Dependencies array
 * @returns Memoized callback
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ callback: T; deps: React.DependencyList }>()

  return useCallback((...args: Parameters<T>) => {
    if (!ref.current || !compareDeps(ref.current.deps, deps)) {
      ref.current = { callback, deps: [...deps] }
    }
    return ref.current.callback(...args)
  }, deps) as T
}

/**
 * Hook for memoizing expensive calculations with timeout
 * @param factory - Function that returns the value to memoize
 * @param deps - Dependencies array
 * @param timeout - Timeout in milliseconds
 * @returns Memoized value
 */
export function useMemoizedWithTimeout<T>(
  factory: () => T,
  deps: React.DependencyList,
  timeout: number = 100
): T {
  const [value, setValue] = useState<T>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setValue(factory())
    }, timeout)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, deps)

  return value as T
}
