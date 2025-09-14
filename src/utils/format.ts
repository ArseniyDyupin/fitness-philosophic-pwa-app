/**
 * Utility functions for formatting numbers, time, and other data
 */

/**
 * Format minutes into a human-readable string
 * @param total - Total minutes
 * @returns Formatted string (e.g., "45m", "1h", "1h 30m")
 */
export function formatMinutes(total: number): string {
  const m = Math.round(total || 0)
  const h = Math.floor(m / 60)
  const mm = m % 60
  
  if (h <= 0) return `${mm}m`
  if (mm === 0) return `${h}h`
  return `${h}h ${mm}m`
}

/**
 * Format integer numbers with locale-specific separators
 * @param n - Number to format
 * @returns Formatted number string
 */
export const formatInt = (n?: number): string => {
  return Intl.NumberFormat().format(Math.round(n || 0))
}

/**
 * Format decimal numbers with specified precision
 * @param n - Number to format
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export const formatDecimal = (n?: number, precision: number = 1): string => {
  return Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(n || 0)
}

/**
 * Format calories with appropriate units
 * @param calories - Number of calories
 * @returns Formatted calories string
 */
export const formatCalories = (calories?: number): string => {
  const cal = Math.round(calories || 0)
  return `${formatInt(cal)} kcal`
}

/**
 * Format weight with appropriate units
 * @param weight - Weight in kg
 * @param unit - Unit to display ('kg' | 'lbs')
 * @returns Formatted weight string
 */
export const formatWeight = (weight?: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  const w = weight || 0
  if (unit === 'lbs') {
    const lbs = w * 2.20462
    return `${formatDecimal(lbs)} lbs`
  }
  return `${formatDecimal(w)} kg`
}

/**
 * Format distance with appropriate units
 * @param distance - Distance in km
 * @param unit - Unit to display ('km' | 'mi')
 * @returns Formatted distance string
 */
export const formatDistance = (distance?: number, unit: 'km' | 'mi' = 'km'): string => {
  const d = distance || 0
  if (unit === 'mi') {
    const miles = d * 0.621371
    return `${formatDecimal(miles)} mi`
  }
  return `${formatDecimal(d)} km`
}

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param precision - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value?: number, precision: number = 0): string => {
  const v = value || 0
  return `${formatDecimal(v, precision)}%`
}

/**
 * Format date in a user-friendly format
 * @param date - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, locale: string = 'en-US'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time in a user-friendly format
 * @param date - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date, locale: string = 'en-US'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday")
 * @param date - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: string | Date, locale: string = 'en-US'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(d, locale)
}
