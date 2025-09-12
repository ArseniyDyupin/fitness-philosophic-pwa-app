import React, { useState } from 'react'
import { useTranslations } from '@stores/i18n.store'
import type { WorkoutExercise, WorkoutType } from '../../types/models'
import { Copy, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

interface ExerciseCardProps {
  exercise: WorkoutExercise
  index: number
  onUpdate: (updates: Partial<WorkoutExercise>) => void
  onRemove: () => void
  onClone: () => void
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onUpdate,
  onRemove,
  onClone
}) => {
  const t = useTranslations()
  const [showNotes, setShowNotes] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const exerciseTypes: Array<{ value: WorkoutType; label: string }> = [
    { value: 'run', label: t.run },
    { value: 'pullups', label: t.pullups },
    { value: 'pushups', label: t.pushups },
    { value: 'plank', label: t.plank },
    { value: 'custom', label: t.custom }
  ]

  const handleTypeChange = (newType: WorkoutType) => {
    // Reset details when changing type
    const newDetails: WorkoutExercise['details'] = {}
    
    // Set default values based on type
    switch (newType) {
      case 'run':
        newDetails.distanceKm = 0
        newDetails.durationMin = 0
        break
      case 'pullups':
      case 'pushups':
        newDetails.sets = 1
        newDetails.repsPerSet = [0]
        break
      case 'plank':
        newDetails.seconds = [0]
        break
      case 'custom':
        newDetails.customExercise = ''
        break
    }

    onUpdate({
      type: newType,
      details: newDetails
    })
  }

  const renderExerciseFields = () => {
    switch (exercise.type) {
      case 'run':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.durationMinutes}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={exercise.details.durationMin || ''}
                onChange={(e) => onUpdate({
                  details: { ...exercise.details, durationMin: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.distanceKm}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={exercise.details.distanceKm || ''}
                onChange={(e) => onUpdate({
                  details: { ...exercise.details, distanceKm: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="5.0"
              />
            </div>
          </div>
        )

      case 'pullups':
      case 'pushups':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.sets}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={exercise.details.sets || 1}
                onChange={(e) => {
                  const sets = parseInt(e.target.value) || 1
                  const currentReps = exercise.details.repsPerSet || [0]
                  const newReps = Array(sets).fill(0).map((_, i) => currentReps[i] || 0)
                  
                  onUpdate({
                    details: { ...exercise.details, sets, repsPerSet: newReps }
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.reps} per set
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: exercise.details.sets || 1 }, (_, i) => (
                  <input
                    key={i}
                    type="number"
                    min="0"
                    value={exercise.details.repsPerSet?.[i] || ''}
                    onChange={(e) => {
                      const newReps = [...(exercise.details.repsPerSet || [])]
                      newReps[i] = parseInt(e.target.value) || 0
                      onUpdate({
                        details: { ...exercise.details, repsPerSet: newReps }
                      })
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-center"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case 'plank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of holds
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={exercise.details.seconds?.length || 1}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 1
                  const currentSeconds = exercise.details.seconds || [0]
                  const newSeconds = Array(count).fill(0).map((_, i) => currentSeconds[i] || 0)
                  
                  onUpdate({
                    details: { ...exercise.details, seconds: newSeconds }
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seconds per hold
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: exercise.details.seconds?.length || 1 }, (_, i) => (
                  <input
                    key={i}
                    type="number"
                    min="0"
                    value={exercise.details.seconds?.[i] || ''}
                    onChange={(e) => {
                      const newSeconds = [...(exercise.details.seconds || [])]
                      newSeconds[i] = parseInt(e.target.value) || 0
                      onUpdate({
                        details: { ...exercise.details, seconds: newSeconds }
                      })
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-center"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise name
              </label>
              <input
                type="text"
                value={exercise.details.customExercise || ''}
                onChange={(e) => onUpdate({
                  details: { ...exercise.details, customExercise: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Burpees, Mountain Climbers"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode
                </label>
                <select
                  value={exercise.details.durationMin ? 'time' : 'reps'}
                  onChange={(e) => {
                    if (e.target.value === 'time') {
                      onUpdate({
                        details: { 
                          ...exercise.details, 
                          durationMin: 0,
                          sets: undefined,
                          repsPerSet: undefined
                        }
                      })
                    } else {
                      onUpdate({
                        details: { 
                          ...exercise.details, 
                          durationMin: undefined,
                          sets: 1,
                          repsPerSet: [0]
                        }
                      })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="time">Time/Distance</option>
                  <option value="reps">Sets/Reps</option>
                </select>
              </div>
              
              {exercise.details.durationMin !== undefined ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.durationMinutes}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={exercise.details.durationMin || ''}
                    onChange={(e) => onUpdate({
                      details: { ...exercise.details, durationMin: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="30"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sets}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={exercise.details.sets || 1}
                    onChange={(e) => {
                      const sets = parseInt(e.target.value) || 1
                      const currentReps = exercise.details.repsPerSet || [0]
                      const newReps = Array(sets).fill(0).map((_, i) => currentReps[i] || 0)
                      
                      onUpdate({
                        details: { ...exercise.details, sets, repsPerSet: newReps }
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}
            </div>
            
            {exercise.details.repsPerSet && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.reps} per set
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: exercise.details.sets || 1 }, (_, i) => (
                    <input
                      key={i}
                      type="number"
                      min="0"
                      value={exercise.details.repsPerSet?.[i] || ''}
                      onChange={(e) => {
                        const newReps = [...(exercise.details.repsPerSet || [])]
                        newReps[i] = parseInt(e.target.value) || 0
                        onUpdate({
                          details: { ...exercise.details, repsPerSet: newReps }
                        })
                      }}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-center"
                      placeholder="0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <h4 className="font-medium text-gray-900">
            Exercise {index + 1} — {exerciseTypes.find(t => t.value === exercise.type)?.label}
          </h4>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onClone}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clone exercise"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 transition-colors ${
              showNotes ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Toggle notes"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
            title="Remove exercise"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Exercise Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Type
            </label>
            <select
              value={exercise.type}
              onChange={(e) => handleTypeChange(e.target.value as WorkoutType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              {exerciseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Exercise-specific fields */}
          {renderExerciseFields()}

          {/* Notes */}
          {showNotes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                value={exercise.details.notes || ''}
                onChange={(e) => onUpdate({
                  details: { ...exercise.details, notes: e.target.value }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any notes about this exercise..."
              />
            </div>
          )}

          {/* Estimated Calories */}
          {exercise.kcalEstimated && exercise.kcalEstimated > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-600">
                Estimated calories: <span className="font-medium">{exercise.kcalEstimated} kcal</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExerciseCard
