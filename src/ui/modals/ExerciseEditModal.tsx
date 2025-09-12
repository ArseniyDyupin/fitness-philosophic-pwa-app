import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import type { WorkoutExercise } from '@types/models'

interface ExerciseEditModalProps {
  isOpen: boolean
  onClose: () => void
  exercise: WorkoutExercise
  onSave: (updatedExercise: WorkoutExercise) => Promise<void>
}

const ExerciseEditModal: React.FC<ExerciseEditModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onSave
}) => {
  const t = useTranslations()
  const [editedExercise, setEditedExercise] = useState<WorkoutExercise>(exercise)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && exercise) {
      setEditedExercise({ ...exercise })
    }
  }, [isOpen, exercise])

  const updateExerciseField = (field: string, value: string | number | number[]) => {
    setEditedExercise(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }))
  }

  const updateExerciseType = (type: string) => {
    setEditedExercise(prev => ({ ...prev, type: type }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedExercise)
      onClose()
    } catch (error) {
      console.error('Failed to save exercise:', error)
    } finally {
      setIsSaving(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {t.workoutDetailsPage?.editExercise || 'Edit Exercise'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              aria-label="Close modal"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.workoutDetailsPage?.exerciseType || 'Exercise Type'}
              </label>
              <select
                value={editedExercise.type}
                onChange={(e) => updateExerciseType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="run">{t.exerciseTypes?.run || 'Run'}</option>
                <option value="pullups">{t.exerciseTypes?.pullups || 'Pull-ups'}</option>
                <option value="pushups">{t.exerciseTypes?.pushups || 'Push-ups'}</option>
                <option value="plank">{t.exerciseTypes?.plank || 'Plank'}</option>
                <option value="custom">{t.exerciseTypes?.custom || 'Custom'}</option>
              </select>
            </div>

            {/* Type-specific fields */}
            {editedExercise.type === 'run' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.workoutDetailsPage?.distance || 'Distance'} ({t.workoutCard?.km || 'km'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedExercise.details.distanceKm || ''}
                    onChange={(e) => updateExerciseField('distanceKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.workoutDetailsPage?.duration || 'Duration'} ({t.workoutDetailsPage?.minutes || 'minutes'})
                  </label>
                  <input
                    type="number"
                    value={editedExercise.details.durationMin || ''}
                    onChange={(e) => updateExerciseField('durationMin', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {(editedExercise.type === 'pullups' || editedExercise.type === 'pushups') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.workoutDetailsPage?.sets || 'Sets'}
                  </label>
                  <input
                    type="number"
                    value={editedExercise.details.sets || ''}
                    onChange={(e) => updateExerciseField('sets', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.workoutDetailsPage?.repsPerSet || 'Reps per set'} ({t.workoutDetailsPage?.commaSeparated || 'comma separated'})
                  </label>
                  <input
                    type="text"
                    value={editedExercise.details.repsPerSet?.join(',') || ''}
                    onChange={(e) => updateExerciseField('repsPerSet', e.target.value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r)))}
                    placeholder="10,8,6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {editedExercise.type === 'plank' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.workoutDetailsPage?.seconds || 'Seconds'} ({t.workoutDetailsPage?.commaSeparated || 'comma separated'})
                </label>
                <input
                  type="text"
                  value={editedExercise.details.seconds?.join(',') || ''}
                  onChange={(e) => updateExerciseField('seconds', e.target.value.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)))}
                  placeholder="60,45,30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {editedExercise.type === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.workoutDetailsPage?.exerciseName || 'Exercise Name'}
                  </label>
                  <input
                    type="text"
                    value={editedExercise.details.customExercise || ''}
                    onChange={(e) => updateExerciseField('customExercise', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.workoutDetailsPage?.duration || 'Duration'} ({t.workoutDetailsPage?.minutes || 'minutes'})
                    </label>
                    <input
                      type="number"
                      value={editedExercise.details.durationMin || ''}
                      onChange={(e) => updateExerciseField('durationMin', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.workoutDetailsPage?.repsPerSet || 'Reps per set'} ({t.workoutDetailsPage?.commaSeparated || 'comma separated'})
                    </label>
                    <input
                      type="text"
                      value={editedExercise.details.repsPerSet?.join(',') || ''}
                      onChange={(e) => updateExerciseField('repsPerSet', e.target.value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r)))}
                      placeholder="20,15,10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes field for all types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.workoutDetailsPage?.notes || 'Notes'}
              </label>
              <textarea
                value={editedExercise.details.notes || ''}
                onChange={(e) => updateExerciseField('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add notes about this exercise..."
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 p-3 sm:p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 touch-manipulation"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center space-x-1 sm:space-x-2 touch-manipulation"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{t.save || 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExerciseEditModal
