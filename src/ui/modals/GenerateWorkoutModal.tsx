import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import { useWorkoutStore } from '@stores/workout.store'
import { aiService } from '@services/ai'
import type { PlanSuggestion } from '../../types/models'
import { X, Calendar, MessageSquare, Activity, Sparkles, Loader } from 'lucide-react'

interface GenerateWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onPlanGenerated: (plan: PlanSuggestion) => void
}

const GenerateWorkoutModal: React.FC<GenerateWorkoutModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated
}) => {
  const t = useTranslations()
  const { profile } = useProfileStore()
  const { workouts } = useWorkoutStore()
  
  const [futureDate, setFutureDate] = useState('')
  const [preferences, setPreferences] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set default date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFutureDate(tomorrow.toISOString().split('T')[0])
      setPreferences('')
      setError(null)
    }
  }, [isOpen])

  const lastWorkout = workouts.length > 0 ? workouts[0] : null

  const handleGenerate = async () => {
    if (!profile) {
      setError(t.error || 'Profile not found')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const recentWorkouts = workouts.slice(0, 5)
      
      // Create enhanced prompt with additional parameters
      const enhancedPrompt = `${preferences ? `Предпочтения: ${preferences}\n` : ''}Дата тренировки: ${futureDate}`
      
      const plan = await aiService.generateNextWorkout(
        profile, 
        recentWorkouts, 
        profile.language || 'ru',
        enhancedPrompt
      )

      // Update plan with future date
      console.log('Updating plan with future date:', futureDate)
      console.log('Original plan forDate:', plan.forDate)
      console.log('Original plan workoutTemplate date:', plan.workoutTemplate?.date)
      
      const updatedPlan: PlanSuggestion = {
        ...plan,
        forDate: futureDate,
        workoutTemplate: {
          ...plan.workoutTemplate!,
          date: futureDate
        }
      }
      
      console.log('Updated plan forDate:', updatedPlan.forDate)
      console.log('Updated plan workoutTemplate date:', updatedPlan.workoutTemplate?.date)

      onPlanGenerated(updatedPlan)
      onClose()
    } catch (error) {
      console.error('Failed to generate plan:', error)
      setError(t.error || 'Failed to generate plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatWorkoutDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatWorkoutSummary = (workout: any) => {
    const exercises = workout.exercises.map((e: any) => e.type).join(', ')
    const calories = workout.exercises.reduce((sum: number, e: any) => sum + (e.kcalEstimated || 0), 0)
    return `${exercises} • ${Math.round(calories)} ккал • RPE ${workout.rpe || 'не указан'}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t.plan?.generateModal?.title || 'Generate New Workout'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              {t.plan?.generateModal?.date || 'Workout Date'}
            </label>
            <input
              type="date"
              value={futureDate}
              onChange={(e) => setFutureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              {t.plan?.generateModal?.preferences || 'Preferences'}
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder={t.plan?.generateModal?.preferencesPlaceholder || 'Describe your preferences for this workout...'}
            />
          </div>

          {/* Last Workout Info */}
          {lastWorkout && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Activity size={16} className="inline mr-2" />
                {t.plan?.generateModal?.lastWorkout || 'Last Workout'}
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  {formatWorkoutDate(lastWorkout.date)}
                </div>
                <div className="text-sm text-gray-800">
                  {formatWorkoutSummary(lastWorkout)}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="btn-secondary"
          >
            {t.plan?.generateModal?.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary flex items-center space-x-2"
          >
            {isGenerating ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            <span>
              {isGenerating 
                ? (t.plan?.generateModal?.generating || 'Generating...') 
                : (t.plan?.generateModal?.generate || 'Generate')
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenerateWorkoutModal
