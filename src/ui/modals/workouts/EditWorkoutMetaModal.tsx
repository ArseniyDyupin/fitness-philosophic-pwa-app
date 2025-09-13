import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import type { Workout } from '@/types/models'

interface EditWorkoutMetaModalProps {
  isOpen: boolean
  onClose: () => void
  workout: Workout
  onSave: (updatedWorkout: Partial<Workout>) => Promise<void>
}

const EditWorkoutMetaModal: React.FC<EditWorkoutMetaModalProps> = ({
  isOpen,
  onClose,
  workout,
  onSave
}) => {
  const t = useTranslations()
  const [editedDate, setEditedDate] = useState('')
  const [editedDurationMin, setEditedDurationMin] = useState<number | undefined>(undefined)
  const [editedRpe, setEditedRpe] = useState<number | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && workout) {
      setEditedDate(workout.date.split('T')[0])
      setEditedDurationMin(workout.durationOverrideMin)
      setEditedRpe(workout.rpe)
    }
  }, [isOpen, workout])

  const handleSave = async () => {
    if (!workout) return

    setIsSaving(true)
    try {
      const updatedWorkout: Partial<Workout> = {
        date: new Date(editedDate).toISOString(),
        durationOverrideMin: editedDurationMin && editedDurationMin > 0 ? editedDurationMin : undefined,
        rpe: editedRpe,
        rpeSource: editedRpe ? 'manual' as const : undefined,
        updatedAt: new Date().toISOString()
      }

      await onSave(updatedWorkout)
      onClose()
    } catch (error) {
      console.error('Failed to save workout metadata:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getRpeLabel = (rpe: number) => {
    if (rpe <= 3) return t.workoutForm?.easy || 'Easy'
    if (rpe <= 7) return t.workoutForm?.moderate || 'Moderate'
    return t.workoutForm?.hard || 'Hard'
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.workoutDetailsPage?.metaModal?.title || 'Change workout metadata'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.workoutDetailsPage?.metaModal?.date || 'Date'}
              </label>
              <input
                type="date"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.workoutDetailsPage?.metaModal?.durationMin || 'Duration (min)'}
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={editedDurationMin || ''}
                onChange={(e) => setEditedDurationMin(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use calculated duration from exercises
              </p>
            </div>
            
            {/* RPE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.workoutDetailsPage?.metaModal?.rpe || 'RPE (1–10)'}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editedRpe || 5}
                  onChange={(e) => setEditedRpe(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">1-3 {t.workoutForm?.easy || 'Easy'}</span>
                  <span className="font-medium">
                    {editedRpe || 5} - {getRpeLabel(editedRpe || 5)}
                  </span>
                  <span className="text-red-600">8-10 {t.workoutForm?.hard || 'Hard'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {t.workoutDetailsPage?.metaModal?.cancel || 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : (t.workoutDetailsPage?.metaModal?.save || 'Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditWorkoutMetaModal
