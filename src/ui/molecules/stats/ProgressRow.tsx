import React from 'react'
import Progress from '@atoms/Progress'
import { cn } from '@utils/cn'

export interface ProgressRowProps {
  label: string
  current: number
  target: number
  unit?: string
  showPercentage?: boolean
  className?: string
}

const ProgressRow: React.FC<ProgressRowProps> = ({
  label,
  current,
  target,
  unit = '',
  showPercentage = true,
  className
}) => {
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0
  const isOverTarget = current > target

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {current}{unit} / {target}{unit}
          {showPercentage && (
            <span className={cn(
              'ml-2 font-medium',
              isOverTarget ? 'text-green-600' : 'text-gray-500'
            )}>
              ({percentage}%)
            </span>
          )}
        </span>
      </div>
      <Progress
        value={Math.min(current, target)}
        max={target}
        variant={isOverTarget ? 'success' : 'default'}
        size="sm"
      />
    </div>
  )
}

export default ProgressRow
