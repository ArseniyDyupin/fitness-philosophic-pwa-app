import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '../services/kcal'
import type { Workout } from '../types/models'
import { Clock, Flame, TrendingUp, Eye } from 'lucide-react'
import { format } from 'date-fns'

interface WorkoutCardProps {
  workout: Workout
  userWeight: number
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, userWeight }) => {
  const t = useTranslations()
  
  const totalCalories = calculateWorkoutCalories(workout.exercises, userWeight, workout.rpe)
  const totalDuration = calculateWorkoutDuration(workout.exercises)
  
  const formatDate = (date: string) => {
    const today = new Date()
    const workoutDate = new Date(date)
    
    if (workoutDate.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (workoutDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return format(workoutDate, 'MMM d, yyyy')
  }

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-600 bg-green-100'
    if (rpe <= 7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRpeLabel = (rpe: number) => {
    if (rpe <= 3) return 'Easy'
    if (rpe <= 7) return 'Moderate'
    return 'Hard'
  }

  const renderExerciseSummary = () => {
    const exerciseCounts: Record<string, number> = {}
    
    workout.exercises.forEach(exercise => {
      exerciseCounts[exercise.type] = (exerciseCounts[exercise.type] || 0) + 1
    })
    
    return Object.entries(exerciseCounts)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {formatDate(workout.date)}
            </h3>
            <p className="text-sm text-gray-600">
              {renderExerciseSummary()}
            </p>
          </div>
          
          {workout.rpe && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRpeColor(workout.rpe)}`}>
              RPE {workout.rpe} - {getRpeLabel(workout.rpe)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="text-orange-500" size={16} />
            <div>
              <div className="text-sm text-gray-600">Calories</div>
              <div className="font-medium text-gray-900">{totalCalories} kcal</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="text-blue-500" size={16} />
            <div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-medium text-gray-900">{Math.round(totalDuration)} min</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-500" size={16} />
            <div>
              <div className="text-sm text-gray-600">Exercises</div>
              <div className="font-medium text-gray-900">{workout.exercises.length}</div>
            </div>
          </div>
        </div>

        {/* Exercise Details */}
        <div className="space-y-2 mb-4">
          {workout.exercises.slice(0, 3).map((exercise, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 capitalize">
                {exercise.type === 'custom' && exercise.details.customExercise
                  ? exercise.details.customExercise
                  : exercise.type
                }
              </span>
              <span className="text-gray-500">
                {exercise.type === 'run' && exercise.details.distanceKm && (
                  `${exercise.details.distanceKm} km`
                )}
                {exercise.type === 'pullups' && exercise.details.repsPerSet && (
                  `${exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)} reps`
                )}
                {exercise.type === 'pushups' && exercise.details.repsPerSet && (
                  `${exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)} reps`
                )}
                {exercise.type === 'plank' && exercise.details.seconds && (
                  `${exercise.details.seconds.reduce((sum, seconds) => sum + seconds, 0)}s`
                )}
                {exercise.type === 'custom' && exercise.details.durationMin && (
                  `${exercise.details.durationMin} min`
                )}
              </span>
            </div>
          ))}
          
          {workout.exercises.length > 3 && (
            <div className="text-sm text-gray-500">
              +{workout.exercises.length - 3} more exercises
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Link
            to={`/workouts/${workout.id}`}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>{t.viewDetails}</span>
          </Link>
          
          {workout.aiReviewId && (
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <TrendingUp size={16} />
              <span>AI Reviewed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkoutCard

