import React from 'react'
import Button from '@atoms/Button'
import WorkoutCard from '@organisms/shared/WorkoutCard'
import { cn } from '@utils/cn'
import { useTranslations } from '@stores/i18n.store'
import type { Workout } from '@/types/models'

export interface RecentWorkoutsProps {
  workouts: Workout[]
  onViewWorkout?: (workout: Workout) => void
  onEditWorkout?: (workout: Workout) => void
  onDeleteWorkout?: (workout: Workout) => void
  onViewAll?: () => void
  maxItems?: number
  className?: string
}

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({
  workouts,
  onViewWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onViewAll,
  maxItems = 5,
  className
}) => {
  const t = useTranslations()
  const recentWorkouts = workouts.slice(0, maxItems)
  const hasMore = workouts.length > maxItems

  if (recentWorkouts.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t.homeDashboard?.recent?.empty}</h3>
        <p className="text-gray-600 mb-4">
          {t.workoutsPage?.startFitnessJourney || 'Start your fitness journey by adding your first workout'}
        </p>
        {onViewAll && (
          <Button onClick={onViewAll} variant="primary">
            {t.homeDashboard?.recent?.add}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t.homeDashboard?.recent?.title}</h2>
        {hasMore && onViewAll && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAll}
          >
            {t.homeDashboard?.recent?.viewAll} ({workouts.length})
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {recentWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onClick={() => onViewWorkout && onViewWorkout(workout)}
            onEdit={() => onEditWorkout && onEditWorkout(workout)}
            onDelete={() => onDeleteWorkout && onDeleteWorkout(workout)}
          />
        ))}
      </div>

      {hasMore && !onViewAll && (
        <div className="text-center text-sm text-gray-500">
          +{workouts.length - maxItems} {t.homeDashboard?.recent?.moreWorkouts}
        </div>
      )}
    </div>
  )
}

export default RecentWorkouts
