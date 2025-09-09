import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslations } from '../../stores/i18n.store'
import type { WorkoutExercise } from '../../types/models'

interface ExerciseCardProps {
  exercise: WorkoutExercise
  index: number
  onEdit: (index: number) => void
  isEditing?: boolean
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onEdit,
  isEditing = false
}) => {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)

  const getExerciseTypeName = (type: string) => {
    return t.exerciseTypes?.[type as keyof typeof t.exerciseTypes] || type
  }

  const formatExerciseSummary = (exercise: WorkoutExercise) => {
    switch (exercise.type) {
      case 'run':
        return `${exercise.details.distanceKm || 0} ${t.workoutDetailsPage?.exercise?.km || 'km'} ${t.workoutDetailsPage?.for || 'in'} ${exercise.details.durationMin || 0} ${t.workoutDetailsPage?.exercise?.min || 'min'}`
      case 'pullups':
      case 'pushups':
        if (exercise.details.repsPerSet && exercise.details.repsPerSet.length > 0) {
          const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
          return `${exercise.details.sets || 0} ${t.workoutDetailsPage?.exercise?.sets || 'sets'}: ${exercise.details.repsPerSet.join('-')} (${totalReps} ${t.workoutDetailsPage?.exercise?.reps || 'reps'})`
        }
        return `${exercise.details.sets || 0} ${t.workoutDetailsPage?.exercise?.sets || 'sets'}`
      case 'plank':
        if (exercise.details.seconds && exercise.details.seconds.length > 0) {
          const totalSeconds = exercise.details.seconds.reduce((sum, seconds) => sum + seconds, 0)
          return `${exercise.details.seconds.length} ${t.workoutDetailsPage?.exercise?.holds || 'holds'}: ${exercise.details.seconds.join('-')}${t.workoutDetailsPage?.exercise?.sec || 's'} (${totalSeconds}${t.workoutDetailsPage?.exercise?.sec || 's'})`
        }
        return `${exercise.details.seconds?.length || 0} ${t.workoutDetailsPage?.exercise?.holds || 'holds'}`
      case 'custom':
        if (exercise.details.customExercise) {
          if (exercise.details.durationMin) {
            return `${exercise.details.customExercise} ${t.workoutDetailsPage?.for || 'for'} ${exercise.details.durationMin} ${t.workoutDetailsPage?.exercise?.min || 'min'}`
          } else if (exercise.details.repsPerSet && exercise.details.repsPerSet.length > 0) {
            const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
            return `${exercise.details.customExercise}: ${exercise.details.sets || 0} ${t.workoutDetailsPage?.exercise?.sets || 'sets'}: ${exercise.details.repsPerSet.join('-')} (${totalReps} ${t.workoutDetailsPage?.exercise?.reps || 'reps'})`
          }
        }
        return exercise.details.customExercise || t.workoutDetailsPage?.customExercise || 'Custom exercise'
      default:
        return t.workoutDetailsPage?.exerciseDetails || 'Exercise details'
    }
  }

  const getMicroMetrics = () => {
    const metrics = []
    
    // Calories
    if (exercise.kcalEstimated && exercise.kcalEstimated > 0) {
      metrics.push({
        value: `~${exercise.kcalEstimated}`,
        unit: 'kcal',
        isAI: exercise.estimateMeta?.source === 'ai'
      })
    }
    
    // Duration
    if (exercise.details.durationMin && exercise.details.durationMin > 0) {
      metrics.push({
        value: exercise.details.durationMin,
        unit: t.workoutDetailsPage?.exercise?.min || 'min',
        isAI: false
      })
    }
    
    // Total reps/seconds/km
    switch (exercise.type) {
      case 'run':
        if (exercise.details.distanceKm && exercise.details.distanceKm > 0) {
          metrics.push({
            value: exercise.details.distanceKm,
            unit: t.workoutDetailsPage?.exercise?.km || 'km',
            isAI: false
          })
        }
        break
      case 'pullups':
      case 'pushups':
        if (exercise.details.repsPerSet && exercise.details.repsPerSet.length > 0) {
          const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
          metrics.push({
            value: totalReps,
            unit: t.workoutDetailsPage?.exercise?.reps || 'reps',
            isAI: false
          })
        }
        break
      case 'plank':
        if (exercise.details.seconds && exercise.details.seconds.length > 0) {
          const totalSeconds = exercise.details.seconds.reduce((sum, seconds) => sum + seconds, 0)
          metrics.push({
            value: totalSeconds,
            unit: t.workoutDetailsPage?.exercise?.sec || 's',
            isAI: false
          })
        }
        break
    }
    
    return metrics
  }

  const hasDetails = () => {
    return (
      (exercise.details.repsPerSet && exercise.details.repsPerSet.length > 1) ||
      (exercise.details.seconds && exercise.details.seconds.length > 1) ||
      exercise.details.notes
    )
  }

  const microMetrics = getMicroMetrics()

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${isEditing ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
      {/* Main row */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900 capitalize truncate">
              {exercise.type === 'custom' && exercise.details.customExercise
                ? exercise.details.customExercise
                : getExerciseTypeName(exercise.type)
              }
            </h4>
            {hasDetails() && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate" title={formatExerciseSummary(exercise)}>
            {formatExerciseSummary(exercise)}
          </p>
        </div>
        
        {/* Micro metrics */}
        <div className="flex items-center space-x-3 ml-4">
          {microMetrics.map((metric, idx) => (
            <div key={idx} className="text-right">
              <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                <span>{metric.value}</span>
                <span className="text-xs text-gray-500">{metric.unit}</span>
                {metric.isAI && (
                  <span 
                    className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                    title={t.workoutDetailsPage?.ai?.badgeAI || 'AI Estimated'}
                  >
                    AI
                  </span>
                )}
              </div>
            </div>
          ))}
          
        </div>
      </div>
      
      {/* Expanded details */}
      {isExpanded && hasDetails() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Sets/Reps table */}
          {(exercise.details.repsPerSet && exercise.details.repsPerSet.length > 1) && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {t.workoutDetailsPage?.exercise?.sets || 'Sets'} & {t.workoutDetailsPage?.exercise?.reps || 'Reps'}
              </h5>
              <div className="grid grid-cols-5 gap-2 text-sm">
                {exercise.details.repsPerSet.map((reps, idx) => (
                  <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">{idx + 1}</div>
                    <div className="text-gray-600">{reps}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Seconds table */}
          {(exercise.details.seconds && exercise.details.seconds.length > 1) && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {t.workoutDetailsPage?.exercise?.holds || 'Holds'} ({t.workoutDetailsPage?.exercise?.sec || 'seconds'})
              </h5>
              <div className="grid grid-cols-5 gap-2 text-sm">
                {exercise.details.seconds.map((seconds, idx) => (
                  <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">{idx + 1}</div>
                    <div className="text-gray-600">{seconds}s</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {exercise.details.notes && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Notes</h5>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                {exercise.details.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExerciseCard
