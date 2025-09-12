import React from 'react'
import Card from '@atoms/Card'
import { cn } from '@utils/cn'

export interface StatTileProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  onClick?: () => void
}

const StatTile: React.FC<StatTileProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  onClick
}) => {
  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <Card
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className="mt-2 flex items-center">
          <span className={cn('text-sm font-medium', getTrendColor(trend))}>
            {getTrendIcon(trend)} {trendValue}
          </span>
        </div>
      )}
    </Card>
  )
}

export default StatTile
