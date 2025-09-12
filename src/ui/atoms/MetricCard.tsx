import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@utils/cn'

interface MetricCardProps {
  icon?: LucideIcon
  value: string | number
  label: string
  hint?: string
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  className?: string
}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600'
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  value,
  label,
  hint,
  color = 'blue',
  className = ''
}) => {
  return (
    <div className={cn('text-center', className)}>
      <div className={cn('text-2xl sm:text-3xl font-bold mb-1 sm:mb-2', colorClasses[color])}>
        {Icon && <Icon size={20} className="inline-block mr-1 sm:mr-2 sm:w-6 sm:h-6" />}
        {value}
      </div>
      <div 
        className="text-xs sm:text-sm text-gray-600 leading-tight"
        title={hint}
      >
        {label}
      </div>
    </div>
  )
}

export default MetricCard
