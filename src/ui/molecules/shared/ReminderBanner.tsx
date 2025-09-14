import React from 'react'
import Button from '@atoms/Button'
import { Calendar, X, Clock } from 'lucide-react'
import { cn } from '@utils/cn'

export interface ReminderBannerProps {
  title: string
  message: string
  onAction?: () => void
  onDismiss?: () => void
  actionText?: string
  variant?: 'info' | 'warning' | 'success'
  showIcon?: boolean
  className?: string
}

const ReminderBanner: React.FC<ReminderBannerProps> = ({
  title,
  message,
  onAction,
  onDismiss,
  actionText = 'Open',
  variant = 'info',
  showIcon = true,
  className
}) => {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  const getIcon = () => {
    switch (variant) {
      case 'warning': return <Clock size={16} />
      case 'success': return <Calendar size={16} />
      default: return <Calendar size={16} />
    }
  }

  return (
    <div className={cn(
      'border rounded-lg p-4 mb-4',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {onAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
            >
              {actionText}
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReminderBanner
