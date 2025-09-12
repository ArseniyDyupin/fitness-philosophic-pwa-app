import React from 'react'
import { format } from 'date-fns'
import { cn } from '@utils/cn'

export interface DateTimeRowProps {
  date: Date | string
  time?: Date | string
  format?: 'short' | 'medium' | 'long'
  showTime?: boolean
  className?: string
}

const DateTimeRow: React.FC<DateTimeRowProps> = ({
  date,
  time,
  format: formatType = 'medium',
  showTime = false,
  className
}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const timeObj = time ? (typeof time === 'string' ? new Date(time) : time) : null

  const getDateFormat = (type: 'short' | 'medium' | 'long') => {
    switch (type) {
      case 'short': return 'MMM d'
      case 'medium': return 'MMM d, yyyy'
      case 'long': return 'EEEE, MMMM d, yyyy'
      default: return 'MMM d, yyyy'
    }
  }

  const getTimeFormat = () => {
    return 'HH:mm'
  }

  const formattedDate = format(dateObj, getDateFormat(formatType))
  const formattedTime = timeObj ? format(timeObj, getTimeFormat()) : null

  return (
    <div className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
      <span>{formattedDate}</span>
      {showTime && formattedTime && (
        <>
          <span>•</span>
          <span>{formattedTime}</span>
        </>
      )}
    </div>
  )
}

export default DateTimeRow
