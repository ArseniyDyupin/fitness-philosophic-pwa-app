import React, { useState } from 'react'
import { useTranslations } from '../stores/i18n.store'
import type { WorkoutExercise, ExerciseEdit, ExerciseStatus } from '../types/models'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface PlanExerciseCardProps {
  exercise: WorkoutExercise
  index: number
  edit: ExerciseEdit
  onEditChange: (edit: ExerciseEdit) => void
}

const PlanExerciseCard: React.FC<PlanExerciseCardProps> = ({ 
  exercise, 
  index, 
  edit, 
  onEditChange 
}) => {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)

  const getExerciseTypeName = (type: string) => {
    return t.exerciseTypes?.[type as keyof typeof t.exerciseTypes] || type
  }

  const formatExerciseDetails = (exercise: WorkoutExercise) => {
    switch (exercise.type) {
      case 'run':
        return `${exercise.details.distanceKm || 0} ${t.workoutCard?.km || 'km'} ${t.workoutDetailsPage?.for || 'in'} ${exercise.details.durationMin || 0} ${t.workoutDetailsPage?.minutes || 'minutes'}`
      case 'pullups':
      case 'pushups':
        if (exercise.details.repsPerSet) {
          const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
          return `${exercise.details.sets || 0} ${t.workoutDetailsPage?.sets || 'sets'}: ${exercise.details.repsPerSet.join('-')} (${totalReps} ${t.workoutDetailsPage?.total || 'total'})`
        }
        return t.workoutDetailsPage?.noRepsSpecified || 'No reps specified'
      case 'plank':
        if (exercise.details.seconds) {
          const totalSeconds = exercise.details.seconds.reduce((sum, seconds) => sum + seconds, 0)
          return `${exercise.details.seconds.length} ${t.workoutDetailsPage?.holds || 'holds'}: ${exercise.details.seconds.join('-')}s (${totalSeconds}s ${t.workoutDetailsPage?.total || 'total'})`
        }
        return t.workoutDetailsPage?.noTimeSpecified || 'No time specified'
      case 'custom':
        if (exercise.details.customExercise) {
          if (exercise.details.durationMin) {
            return `${exercise.details.customExercise} ${t.workoutDetailsPage?.for || 'for'} ${exercise.details.durationMin} ${t.workoutDetailsPage?.minutes || 'minutes'}`
          } else if (exercise.details.repsPerSet) {
            const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
            return `${exercise.details.customExercise}: ${exercise.details.sets || 0} ${t.workoutDetailsPage?.sets || 'sets'}: ${exercise.details.repsPerSet.join('-')} (${totalReps} ${t.workoutDetailsPage?.total || 'total'})`
          }
        }
        return t.workoutDetailsPage?.customExercise || 'Custom exercise'
      default:
        return t.workoutDetailsPage?.exerciseDetails || 'Exercise details'
    }
  }

  const handleStatusChange = (status: ExerciseStatus) => {
    onEditChange({ ...edit, status })
  }

  const handleDetailChange = (field: string, value: any) => {
    const updatedEdit = {
      ...edit,
      edited: {
        ...edit.edited,
        [field]: value
      }
    }
    onEditChange(updatedEdit)
  }

  const handleCommentChange = (comment: string) => {
    onEditChange({ ...edit, comment })
  }

  const getStatusColor = (status: ExerciseStatus) => {
    switch (status) {
      case 'as_planned': return 'text-green-600 bg-green-100'
      case 'skipped': return 'text-red-600 bg-red-100'
      case 'less': return 'text-yellow-600 bg-yellow-100'
      case 'more': return 'text-blue-600 bg-blue-100'
      case 'edited': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const shouldShowEditFields = edit.status === 'less' || edit.status === 'more' || edit.status === 'edited'

  return (
    <div className={`border rounded-lg p-4 ${isExpanded ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 capitalize">
            {exercise.type === 'custom' && exercise.details.customExercise
              ? exercise.details.customExercise
              : getExerciseTypeName(exercise.type)
            }
          </h4>
          <p className="text-sm text-gray-600">
            {formatExerciseDetails(exercise)}
          </p>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Status Selection */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.plan?.status?.as_planned || 'Status'}
        </label>
        <div className="flex flex-wrap gap-2">
          {(['as_planned', 'skipped', 'less', 'more', 'edited'] as ExerciseStatus[]).map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="radio"
                name={`status_${index}`}
                value={status}
                checked={edit.status === status}
                onChange={() => handleStatusChange(status)}
                className="sr-only"
              />
              <span className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                edit.status === status 
                  ? getStatusColor(status)
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}>
                {t.plan?.status?.[status] || status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Edit Fields */}
      {shouldShowEditFields && isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Type-specific fields */}
          {exercise.type === 'run' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutDetailsPage?.distance || 'Distance'} ({t.workoutCard?.km || 'km'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={edit.edited?.distanceKm || exercise.details.distanceKm || ''}
                  onChange={(e) => handleDetailChange('distanceKm', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutDetailsPage?.duration || 'Duration'} ({t.workoutDetailsPage?.minutes || 'minutes'})
                </label>
                <input
                  type="number"
                  value={edit.edited?.durationMin || exercise.details.durationMin || ''}
                  onChange={(e) => handleDetailChange('durationMin', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {(exercise.type === 'pullups' || exercise.type === 'pushups') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutDetailsPage?.sets || 'Sets'}
                </label>
                <input
                  type="number"
                  value={edit.edited?.sets || exercise.details.sets || ''}
                  onChange={(e) => handleDetailChange('sets', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutDetailsPage?.repsPerSet || 'Reps per set'} ({t.workoutDetailsPage?.commaSeparated || 'comma separated'})
                </label>
                <input
                  type="text"
                  value={(edit.edited?.repsPerSet || exercise.details.repsPerSet || []).join(',')}
                  onChange={(e) => handleDetailChange('repsPerSet', e.target.value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r)))}
                  placeholder="10,8,6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          )}

          {exercise.type === 'plank' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.workoutDetailsPage?.seconds || 'Seconds'} ({t.workoutDetailsPage?.commaSeparated || 'comma separated'})
              </label>
              <input
                type="text"
                value={(edit.edited?.seconds || exercise.details.seconds || []).join(',')}
                onChange={(e) => handleDetailChange('seconds', e.target.value.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)))}
                placeholder="60,45,30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {exercise.type === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutDetailsPage?.exerciseName || 'Exercise Name'}
                </label>
                <input
                  type="text"
                  value={edit.edited?.customExercise || exercise.details.customExercise || ''}
                  onChange={(e) => handleDetailChange('customExercise', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.workoutDetailsPage?.duration || 'Duration'} ({t.workoutDetailsPage?.minutes || 'minutes'})
                  </label>
                  <input
                    type="number"
                    value={edit.edited?.durationMin || exercise.details.durationMin || ''}
                    onChange={(e) => handleDetailChange('durationMin', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.workoutDetailsPage?.repsPerSet || 'Reps per set'} ({t.workoutDetailsPage?.commaSeparated || 'comma separated'})
                  </label>
                  <input
                    type="text"
                    value={(edit.edited?.repsPerSet || exercise.details.repsPerSet || []).join(',')}
                    onChange={(e) => handleDetailChange('repsPerSet', e.target.value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r)))}
                    placeholder="20,15,10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Notes field for all types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.workoutDetailsPage?.notes || 'Notes'}
            </label>
            <input
              type="text"
              value={edit.edited?.notes || exercise.details.notes || ''}
              onChange={(e) => handleDetailChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      )}

      {/* Exercise Comment */}
      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.plan?.exerciseComment || 'Exercise Comment'}
          </label>
          <textarea
            value={edit.comment || ''}
            onChange={(e) => handleCommentChange(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.plan?.exerciseComment || 'Add a comment about this exercise...'}
          />
        </div>
      )}
    </div>
  )
}

export default PlanExerciseCard
