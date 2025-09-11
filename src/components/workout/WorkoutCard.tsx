import React from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '../../services/kcal'
import type { Workout } from '../../types/models'
import { Clock, Flame, TrendingUp, MoreVertical, Bot, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface WorkoutCardProps {
  workout: Workout
  userWeight?: number
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onUpdateAnalysis?: () => void
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  userWeight = 70,
  onClick,
  onEdit,
  onDelete,
  onUpdateAnalysis
}) => {
  const t = useTranslations()
  
  const totalCalories = calculateWorkoutCalories(workout.exercises, userWeight, workout.rpe)
  const totalDuration = workout.durationMin || calculateWorkoutDuration(workout.exercises)
  
  const formatDate = (date: string) => {
    const today = new Date()
    const workoutDate = new Date(date)
    
    if (workoutDate.toDateString() === today.toDateString()) {
      return t.workoutCard?.today || 'Today'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (workoutDate.toDateString() === yesterday.toDateString()) {
      return t.workoutCard?.yesterday || 'Yesterday'
    }
    
    return format(workoutDate, 'MMM d, yyyy')
  }

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-600 bg-green-100'
    if (rpe <= 7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRpeLabel = (rpe: number) => {
    if (rpe <= 3) return t.workoutForm?.easy || 'Easy'
    if (rpe <= 7) return t.workoutForm?.moderate || 'Moderate'
    return t.workoutForm?.hard || 'Hard'
  }

  const getExerciseTypeName = (type: string) => {
    return t.exerciseTypes?.[type as keyof typeof t.exerciseTypes] || type
  }

  const formatExerciseSummary = (workout: Workout) => {
    const exerciseTypes = workout.exercises.map(ex => {
      if (ex.type === 'custom' && ex.details.customExercise) {
        return ex.details.customExercise
      }
      return getExerciseTypeName(ex.type)
    })
    
    const uniqueTypes = [...new Set(exerciseTypes)]
    return uniqueTypes.slice(0, 3).join(', ') + (uniqueTypes.length > 3 ? '...' : '')
  }

  const hasAIAnalysis = workout.exercises.some(ex => ex.estimateMeta?.source === 'ai')

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {formatDate(workout.date)}
            </h3>
            {hasAIAnalysis && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Bot size={10} className="mr-1" />
                AI
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 truncate">
            {formatExerciseSummary(workout)}
          </p>
        </div>
        
        {/* Menu Button */}
        <div className="flex items-center space-x-1">
          {onUpdateAnalysis && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpdateAnalysis()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              title="Update AI Analysis"
            >
              <Bot size={14} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              title="Edit workout"
            >
              <MoreVertical size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors touch-manipulation"
              title="Delete workout"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-blue-600">
            <Flame size={12} />
            <span className="text-sm font-medium">{Math.round(totalCalories)}</span>
          </div>
          <div className="text-xs text-gray-500">kcal</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-green-600">
            <Clock size={12} />
            <span className="text-sm font-medium">{Math.round(totalDuration)}</span>
          </div>
          <div className="text-xs text-gray-500">min</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-purple-600">
            <TrendingUp size={12} />
            <span className="text-sm font-medium">{workout.exercises.length}</span>
          </div>
          <div className="text-xs text-gray-500">ex</div>
        </div>
      </div>

      {/* RPE Badge */}
      {workout.rpe && (
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRpeColor(workout.rpe)}`}>
            RPE {workout.rpe} - {getRpeLabel(workout.rpe)}
          </span>
          <span className="text-xs text-gray-500">
            {workout.rpeSource === 'ai' ? 'AI' : 'Manual'}
          </span>
        </div>
      )}
    </div>
  )
}

export default WorkoutCard
