import React from 'react'
import { Card, Badge } from '@atoms'
import { RPEBadge, DateTimeRow } from '@molecules'
import { cn } from '@utils/cn'
import { format } from 'date-fns'
import type { Workout } from '@types/models'

export interface WorkoutCardProps {
  workout: Workout
  onEdit?: (workout: Workout) => void
  onDelete?: (workout: Workout) => void
  onView?: (workout: Workout) => void
  showActions?: boolean
  className?: string
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  className
}) => {
  const handleCardClick = () => {
    if (onView) {
      onView(workout)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(workout)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(workout)
    }
  }

  const exerciseCount = workout.exercises?.length || 0
  const totalSets = workout.exercises?.reduce((sum, exercise) => 
    sum + (exercise.sets?.length || 0), 0
  ) || 0

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        onView && 'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {workout.name}
            </h3>
            {workout.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {workout.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {workout.isPlan && (
              <Badge variant="primary" size="sm">
                Plan
              </Badge>
            )}
            {workout.rpe && workout.rpe > 0 && (
              <RPEBadge rpe={workout.rpe} />
            )}
          </div>
        </div>

        {/* Date and Time */}
        <DateTimeRow 
          date={workout.date}
          format="medium"
        />

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{exerciseCount} exercises</span>
          <span>{totalSets} sets</span>
          {workout.notes && (
            <span className="text-gray-500 italic">
              "{workout.notes.slice(0, 50)}{workout.notes.length > 50 ? '...' : ''}"
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default WorkoutCard
