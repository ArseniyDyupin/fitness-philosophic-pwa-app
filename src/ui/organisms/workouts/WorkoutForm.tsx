import React, { useState, useEffect } from 'react'
import { useWorkoutStore } from '@stores/workout.store'
import { useProfileStore } from '@stores/profile.store'
import { useTranslations, useI18nStore } from '@stores/i18n.store'
import { useAIStore } from '@stores/ai.store'
import { aiService, getBatchEstimates, needsAIEstimation, createEstimateInput, aiReviewService } from '@services/ai'
import { toastError } from '@lib/toast'
import type { WorkoutExercise } from '@/types/models'
import { X, Plus, Edit3, Bot } from 'lucide-react'
import ExerciseCard from '@organisms/shared/ExerciseCard'
import { calculateExerciseCalories } from '@services/fitness'
import { todayLocalDate } from '@/domain/date/localDate'
import { useModalFocus } from '@/hooks/useModalFocus'

interface WorkoutFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (workoutId?: string) => void
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const dialogRef = useModalFocus<HTMLDivElement>(isOpen, onClose)
  const t = useTranslations()
  const { currentLanguage } = useI18nStore()
  const { addWorkout, updateWorkout } = useWorkoutStore()
  const { profile } = useProfileStore()
  const { isConfigured: isAIConfigured, hasKey } = useAIStore()
  
  const [mode, setMode] = useState<'form' | 'text'>('form')
  const [date, setDate] = useState<string>(todayLocalDate())
  const [rpe, setRpe] = useState(5)
  const [durationMin, setDurationMin] = useState<number | undefined>(undefined)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setDate(todayLocalDate())
      setRpe(5)
      setDurationMin(undefined)
      setExercises([])
      setTextInput('')
      setMode('form')
      setEnableAIAnalysis(hasKey()) // Default to true if AI is available
    }
  }, [isOpen, hasKey])

  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      type: 'run',
      details: {},
      kcalEstimated: 0
    }
    setExercises([newExercise, ...exercises])
  }

  const updateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    const updatedExercises = [...exercises]
    updatedExercises[index] = { ...updatedExercises[index], ...updates }

      if (profile?.weight) {
        updatedExercises[index].kcalEstimated = calculateExerciseCalories(
          updatedExercises[index],
          profile.weight
        )
      }
    
    setExercises(updatedExercises)
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const cloneExercise = (index: number) => {
    const cloned = { ...exercises[index] }
    setExercises([cloned, ...exercises])
  }

  const handleSave = async () => {
    if (isSaving) return

    if (exercises.length === 0) {
      toastError(t.workoutForm?.addAtLeastOneExercise || 'Please add at least one exercise')
      return
    }

    setIsSaving(true)
    try {
      // First, save the workout without AI estimates and analysis
      const workoutData = {
        date,
        exercises,
        rpe: enableAIAnalysis ? undefined : (rpe > 0 ? rpe : undefined), // Don't set RPE if AI analysis is enabled
        durationMin: durationMin && durationMin > 0 ? durationMin : undefined,
        status: 'completed' as const
      }

      const savedWorkout = await addWorkout(workoutData)
      
      // Then, get AI estimates for exercises that need them
      if (profile && isAIConfigured) {
        setIsEstimating(true)
        try {
          const exercisesNeedingEstimation = exercises.filter(needsAIEstimation)
          
          if (exercisesNeedingEstimation.length > 0) {
            const estimateInputs = exercisesNeedingEstimation.map(exercise => 
              createEstimateInput(exercise, {
                weightKg: profile.weight,
                age: profile.age,
                gender: profile.gender
              })
            )
            
            const estimates = await getBatchEstimates(estimateInputs)
            
            // Update exercises with estimates
            const updatedExercises = exercises.map(exercise => {
              const needsEstimate = needsAIEstimation(exercise)
              if (needsEstimate) {
                const estimateIndex = exercisesNeedingEstimation.findIndex(e => e === exercise)
                const estimate = estimates[estimateIndex]
                
                if (estimate) {
                  return {
                    ...exercise,
                    kcalEstimated: estimate.kcal,
                    estimateMeta: {
                      source: 'ai' as const,
                      updatedAt: new Date().toISOString()
                    }
                  }
                }
              }
              return exercise
            })
            
            // Update the workout with estimates
            await updateWorkout(savedWorkout.id, { exercises: updatedExercises })
          }
        } catch (error) {
          console.error('Failed to get AI estimates:', error)
          // Don't block the user - workout is already saved
        } finally {
          setIsEstimating(false)
        }
      }

      // Start AI analysis if enabled and AI is configured
      if (enableAIAnalysis && hasKey() && savedWorkout) {
        setIsAnalyzing(true)
        // Run AI analysis asynchronously without blocking navigation
        aiReviewService.reviewWorkout(savedWorkout.id)
          .then(() => {
            // Show success toast (could be implemented with a toast system)
            // AI analysis completed successfully
          })
          .catch((error) => {
            console.error('AI analysis failed:', error)
            // Show error toast (could be implemented with a toast system)
          })
          .finally(() => {
            setIsAnalyzing(false)
          })
      }
      
      onSuccess?.(savedWorkout.id)
      onClose()
    } catch (error) {
      console.error('Failed to save workout:', error)
      toastError(t.workoutForm?.failedToSave || 'Failed to save workout')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTextParse = async () => {
    if (!textInput.trim()) {
      toastError(t.workoutForm?.pleaseEnterDescription || 'Please enter workout description')
      return
    }

    if (!isAIConfigured) {
      toastError(t.workoutForm?.aiNotConfigured || 'AI is not configured. Please set up your OpenAI API key in Settings.')
      return
    }

    setIsProcessing(true)
    try {
      // Use AI to parse workout text
      const parsedExercises = await aiService.parseWorkoutText(textInput, currentLanguage)
      setExercises(parsedExercises as WorkoutExercise[])
      setMode('form')
    } catch (error) {
      console.error('Failed to parse workout text:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toastError(t.workoutForm?.aiParseFailed || `AI parsing failed: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }


  const getRpeColor = (rpeValue: number) => {
    if (rpeValue <= 3) return 'text-green-600'
    if (rpeValue <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRpeLabel = (rpeValue: number) => {
    if (rpeValue <= 3) return t.workoutForm?.easy || 'Easy'
    if (rpeValue <= 7) return t.workoutForm?.moderate || 'Moderate'
    return t.workoutForm?.hard || 'Hard'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="workout-form-title" tabIndex={-1} className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 id="workout-form-title" className="text-lg sm:text-2xl font-bold text-gray-900">
            {t.addWorkout}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.close || 'Close'}
            className="hit-44 focus-visible-ring text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setMode('form')}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors focus-visible-ring ${
                mode === 'form'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit3 size={16} />
              <span>{t.workoutForm?.formMode || 'Form Mode'}</span>
            </button>
            {isAIConfigured && (
              <button
                onClick={() => setMode('text')}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors focus-visible-ring ${
                  mode === 'text'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bot size={16} />
                <span>{t.workoutForm?.textMode || 'Text Mode'}</span>
              </button>
            )}
          </div>
        </div>

        {mode === 'form' ? (
          /* Form Mode */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.workoutForm?.date || 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.workoutForm?.rpe || 'RPE (Rate of Perceived Exertion)'}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rpe}
                    onChange={(e) => setRpe(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">1-3 {t.workoutForm?.easy || 'Easy'}</span>
                    <span className={`font-medium ${getRpeColor(rpe)}`}>
                      {rpe} - {getRpeLabel(rpe)}
                    </span>
                    <span className="text-red-600">8-10 {t.workoutForm?.hard || 'Hard'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.workoutForm?.totalDuration || 'Total Workout Duration'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationMin || ''}
                    onChange={(e) => setDurationMin(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder={t.workoutForm?.optional || 'Optional'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">
                    {t.workoutForm?.durationMinutes || 'minutes'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t.workoutForm?.optionalDescription || 'Optional: Total time spent on the workout including rest'}
                </p>
              </div>

              {/* AI Analysis Checkbox - only show if AI is configured */}
              {hasKey() && (
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableAIAnalysis"
                      checked={enableAIAnalysis}
                      onChange={(e) => setEnableAIAnalysis(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAIAnalysis" className="text-sm font-medium text-gray-700">
                      {t.workoutAnalysis?.enable || 'Analyze workout with AI'}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    {t.workoutForm?.aiWillEstimate || 'AI will automatically estimate RPE and provide feedback after saving'}
                  </p>
                </div>
              )}
            </div>

            {/* Exercises */}
            <div>
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-medium text-gray-900">{t.workoutForm?.exercises || 'Exercises'}</h3>
                  <button
                    onClick={addExercise}
                    className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <Plus size={16} />
                    <span>{t.workoutForm?.addExercise || 'Add Exercise'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={index}
                    exercise={exercise}
                    index={index}
                    onUpdate={(updates: Partial<WorkoutExercise>) => updateExercise(index, updates)}
                    onRemove={() => removeExercise(index)}
                    onClone={() => cloneExercise(index)}
                  />
                ))}
              </div>

              {exercises.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>{t.workoutForm?.noExercisesAdded || 'No exercises added yet. Click "Add Exercise" to get started.'}</p>
                </div>
              )}
            </div>

            {/* Summary */}
            {exercises.length > 0 && profile?.weight && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{t.workoutForm?.workoutSummary || 'Workout Summary'}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {hasKey() && (
                    <div>
                      <span className="text-gray-600">{t.workoutForm?.estimatesWillBeCalculated || 'Estimates will be calculated after saving'}</span>
                      <div className="font-medium text-sm text-gray-500">
                        {isEstimating ? (t.workoutForm?.aiEstimationInProgress || 'AI estimation in progress...') : (t.workoutForm?.caloriesWillBeEstimated || 'Calories and duration will be estimated automatically')}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t.workoutForm?.exercisesCount || 'Exercises:'}</span>
                    <div className="font-medium">{exercises.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Text Mode */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.workoutForm?.describeWorkout || 'Describe your workout'}
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder={t.workoutForm?.workoutDescriptionPlaceholder || "Example: пробежал 5 км, подтянулся 7-5-3-3-2, отжимания 20-20-15, планка 60-45-50"}
              />
              <p className="text-sm text-gray-500 mt-2">
                {t.workoutForm?.workoutDescriptionHelp || "Describe your workout in natural language. The AI will parse it into structured exercises."}
              </p>
            </div>

            <button
              onClick={handleTextParse}
              disabled={isProcessing || !textInput.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (t.workoutForm?.parsing || 'Parsing...') : (t.workoutForm?.parseAndContinue || 'Parse and Continue')}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary focus-visible-ring"
          >
            {t.cancel}
          </button>
          {mode === 'form' && (
            <button
              onClick={handleSave}
              disabled={exercises.length === 0 || isSaving || isEstimating || isAnalyzing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 focus-visible-ring"
            >
              {isSaving && !isEstimating && !isAnalyzing ? (
                <span>{t.saving || 'Saving...'}</span>
              ) : hasKey() && isEstimating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t.workoutForm?.aiEstimationInProgress || 'AI estimation...'}</span>
                </>
              ) : hasKey() && isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t.workoutAnalysis?.starting || 'Starting AI analysis...'}</span>
                </>
              ) : (
                <span>{t.save}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkoutForm
