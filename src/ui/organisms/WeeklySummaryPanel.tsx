import React from 'react'
import Card from '@atoms/Card'
import Button from '@atoms/Button'
import StatTile from '@molecules/StatTile'
import ProgressRow from '@molecules/ProgressRow'
import { cn } from '@utils/cn'

export interface WeeklyStats {
  calories: number
  minutes: number
  workouts: number
  rpeAvg?: number
  daysWithWorkouts: number
}

export interface WeeklySummaryPanelProps {
  stats: WeeklyStats
  goal?: {
    calories?: number
    minutes?: number
    workouts?: number
  }
  onShowAll?: () => void
  className?: string
}

const WeeklySummaryPanel: React.FC<WeeklySummaryPanelProps> = ({
  stats,
  goal,
  onShowAll,
  className
}) => {
  const progressData = [
    {
      label: 'Workouts',
      current: stats.workouts,
      target: goal?.workouts || 3,
      unit: '',
      showPercentage: true
    },
    {
      label: 'Minutes',
      current: stats.minutes,
      target: goal?.minutes || 150,
      unit: ' min',
      showPercentage: true
    },
    {
      label: 'Calories',
      current: stats.calories,
      target: goal?.calories || 1000,
      unit: ' kcal',
      showPercentage: true
    }
  ]

  return (
    <Card className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
        {onShowAll && (
          <Button variant="ghost" size="sm" onClick={onShowAll}>
            View Details
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatTile
          title="Workouts"
          value={stats.workouts}
          subtitle={`${stats.daysWithWorkouts} days active`}
        />
        <StatTile
          title="Minutes"
          value={stats.minutes}
          subtitle="Total time"
        />
        <StatTile
          title="Calories"
          value={stats.calories}
          subtitle="Burned"
        />
        {stats.rpeAvg && (
          <StatTile
            title="Avg RPE"
            value={stats.rpeAvg}
            subtitle="Intensity"
          />
        )}
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Progress to Goals</h3>
        {progressData.map((item) => (
          <ProgressRow
            key={item.label}
            label={item.label}
            current={item.current}
            target={item.target}
            unit={item.unit}
            showPercentage={item.showPercentage}
          />
        ))}
      </div>

      {/* Weekly Activity Indicator */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Weekly Activity</span>
          <div className="flex space-x-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full',
                  i < stats.daysWithWorkouts 
                    ? 'bg-primary-500' 
                    : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default WeeklySummaryPanel
