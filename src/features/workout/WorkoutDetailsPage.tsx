import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useWorkoutStore } from '../../stores/workout.store'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'
import { useAIStore } from '../../stores/ai.store'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '../../services/kcal'
import { getBatchEstimates, needsAIEstimation, createEstimateInput } from '../../services/ai.estimate'
import { aiReviewService } from '../../services/ai.review'
import { dbHelpers } from '../../services/db'
import { ArrowLeft, Trash2, Check, X } from 'lucide-react'
import type { WorkoutExercise, AIWorkoutFeedback } from '../../types/models'

// New components
import WorkoutHeader from '../../components/workout/WorkoutHeader'
import ExerciseCard from '../../components/workout/ExerciseCard'
import AiFeedbackCard from '../../components/workout/AiFeedbackCard'
import WorkoutAnalytics from '../../components/workout/WorkoutAnalytics'

const WorkoutDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useTranslations()

  const { getWorkoutById, deleteWorkout, updateWorkout, workouts } = useWorkoutStore()
  const { profile } = useProfileStore()
  const { isConfigured: isAIConfigured, hasKey } = useAIStore()
  
  const [workout, setWorkout] = useState(getWorkoutById(id!))
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Inline editing states
  const [editingHeader, setEditingHeader] = useState(false)
  const [editingExercise, setEditingExercise] = useState<number | null>(null)
  const [editedDate, setEditedDate] = useState('')
  const [editedRpe, setEditedRpe] = useState(5)
  const [editedDurationMin, setEditedDurationMin] = useState<number | undefined>(undefined)
  const [editedExercise, setEditedExercise] = useState<WorkoutExercise | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<AIWorkoutFeedback | null>(null)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!workout && id) {
      setWorkout(getWorkoutById(id))
    }
  }, [id, workout, getWorkoutById])

  // Load AI feedback when workout changes
  useEffect(() => {
    if (workout) {
      console.log('Workout loaded:', workout.id, 'aiReviewId:', workout.aiReviewId)
      if (workout.aiReviewId) {
        loadAIFeedback()
      } else {
        // Try to load any existing feedback for this workout
        loadAIFeedback()
      }
    }
  }, [workout?.id, workout?.aiReviewId])

  const loadAIFeedback = async () => {
    if (!workout) return
    
    console.log('Loading AI feedback for workout:', workout.id)
    setIsLoadingFeedback(true)
    try {
      const feedback = await dbHelpers.getAIFeedbackByWorkout(workout.id)
      console.log('AI feedback loaded:', feedback)
      setAiFeedback(feedback || null)
    } catch (error) {
      console.error('Failed to load AI feedback:', error)
      // If it's a database error, try to upgrade
      if (error instanceof Error && (error.message.includes('NotFoundError') || error.message.includes('object stores was not found'))) {
        try {
          await dbHelpers.forceUpgrade()
          // Retry loading feedback
          const feedback = await dbHelpers.getAIFeedbackByWorkout(workout.id)
          console.log('AI feedback loaded after upgrade:', feedback)
          setAiFeedback(feedback || null)
        } catch (retryError) {
          console.error('Failed to load AI feedback after upgrade:', retryError)
          setAiFeedback(null)
        }
      } else {
        setAiFeedback(null)
      }
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.workoutDetailsPage?.workoutNotFound || 'Workout not found'}</h2>
          <button
            onClick={() => navigate('/workouts')}
            className="btn-primary"
          >
            {t.workoutDetailsPage?.backToWorkouts || 'Back to Workouts'}
          </button>
        </div>
      </div>
    )
  }

  const totalCalories = profile?.weight 
    ? calculateWorkoutCalories(workout.exercises, profile.weight, workout.rpe)
    : 0
  const totalDuration = workout.durationMin || calculateWorkoutDuration(workout.exercises)

  const handleDelete = async () => {
    if (confirm(t.workoutDetailsPage?.deleteConfirm || 'Are you sure you want to delete this workout?')) {
      setIsDeleting(true)
      try {
        await deleteWorkout(workout.id)
        navigate('/workouts')
      } catch (error) {
        console.error('Failed to delete workout:', error)
        alert(t.workoutDetailsPage?.failedToDelete || 'Failed to delete workout')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Inline editing functions
  const startEditingHeader = () => {
    setEditedDate(workout!.date.split('T')[0])
    setEditedRpe(workout!.rpe || 5)
    setEditedDurationMin(workout!.durationMin)
    setEditingHeader(true)
  }

  const startEditingExercise = (index: number) => {
    setEditedExercise({ ...workout!.exercises[index] })
    setEditingExercise(index)
  }

  const cancelEditing = () => {
    setEditingHeader(false)
    setEditingExercise(null)
    setEditedExercise(null)
  }

  const saveHeader = async () => {
    if (!workout) return
    
    setIsSaving(true)
    try {
      const updatedWorkout = {
        ...workout,
        date: new Date(editedDate).toISOString(),
        rpe: editedRpe,
        durationMin: editedDurationMin && editedDurationMin > 0 ? editedDurationMin : undefined
      }
      
      await updateWorkout(workout.id, updatedWorkout)
      setWorkout(updatedWorkout)
      setEditingHeader(false)
      showToast(t.workoutDetailsPage?.workoutUpdated || 'Workout updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update workout:', error)
      showToast(t.workoutDetailsPage?.updateFailed || 'Failed to update workout', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const saveExercise = async () => {
    if (!workout || editingExercise === null || !editedExercise) return
    
    setIsSaving(true)
    try {
      let updatedExercise = editedExercise
      
      // Get AI estimates if needed and AI is configured
      if (profile && isAIConfigured && needsAIEstimation(editedExercise)) {
        setIsEstimating(true)
        try {
          const estimateInput = createEstimateInput(editedExercise, {
            weightKg: profile.weight,
            age: profile.age,
            gender: profile.gender
          })
          
          const estimates = await getBatchEstimates([estimateInput])
          const estimate = estimates[0]
          
          if (estimate) {
            updatedExercise = {
              ...editedExercise,
              kcalEstimated: estimate.kcal,
              estimateMeta: {
                source: 'ai' as const,
                updatedAt: new Date().toISOString()
              }
            }
          }
        } catch (error) {
          console.error('Failed to get AI estimate:', error)
          // Continue without AI estimate
        } finally {
          setIsEstimating(false)
        }
      }
      
      const updatedExercises = [...workout.exercises]
      updatedExercises[editingExercise] = updatedExercise
      
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      }
      
      await updateWorkout(workout.id, updatedWorkout)
      setWorkout(updatedWorkout)
      setEditingExercise(null)
      setEditedExercise(null)
      showToast(t.workoutDetailsPage?.exerciseUpdated || 'Exercise updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update exercise:', error)
      showToast(t.workoutDetailsPage?.updateFailed || 'Failed to update exercise', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateAllAIEstimates = async () => {
    if (!workout || !profile || !isAIConfigured) return
    
    setIsEstimating(true)
    try {
      const exercisesNeedingEstimation = workout.exercises.filter(needsAIEstimation)
      
      if (exercisesNeedingEstimation.length === 0) {
        showToast('All exercises already have estimates', 'success')
        return
      }
      
      const estimateInputs = exercisesNeedingEstimation.map(exercise => 
        createEstimateInput(exercise, {
          weightKg: profile.weight,
          age: profile.age,
          gender: profile.gender
        })
      )
      
      const estimates = await getBatchEstimates(estimateInputs)
      
      // Update exercises with estimates
      const updatedExercises = workout.exercises.map(exercise => {
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
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      }
      
      await updateWorkout(workout.id, updatedWorkout)
      setWorkout(updatedWorkout)
      showToast('AI estimates updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update AI estimates:', error)
      showToast('Failed to update AI estimates', 'error')
    } finally {
      setIsEstimating(false)
    }
  }

  const updateAIAnalysis = async () => {
    if (!workout || !hasKey()) return
    
    console.log('Starting AI analysis for workout:', workout.id)
    setIsAnalyzing(true)
    try {
      const result = await aiReviewService.reviewWorkout(workout.id)
      console.log('AI analysis result:', result)
      
      // Reload the workout to get updated data
      const updatedWorkout = getWorkoutById(workout.id)
      console.log('Updated workout:', updatedWorkout)
      setWorkout(updatedWorkout)
      
      // Reload AI feedback
      if (updatedWorkout?.aiReviewId) {
        console.log('Reloading AI feedback with aiReviewId:', updatedWorkout.aiReviewId)
        await loadAIFeedback()
      } else {
        console.log('No aiReviewId found, trying to load feedback anyway')
        await loadAIFeedback()
      }
      
      // Debug: Check if feedback was actually saved
      setTimeout(async () => {
        try {
          const debugFeedback = await dbHelpers.getAIFeedbackByWorkout(workout.id)
          console.log('DEBUG: AI feedback after analysis:', debugFeedback)
        } catch (error) {
          console.error('DEBUG: Failed to get AI feedback after analysis:', error)
        }
      }, 1000)
      
      showToast(t.workoutDetailsPage?.analysisUpdated || 'Analysis updated', 'success')
    } catch (error) {
      console.error('Failed to update AI analysis:', error)
      
      // More specific error handling
      let errorMessage = t.workoutAnalysis?.error || 'Failed to perform AI analysis'
      
      if (error instanceof Error) {
        if (error.message.includes('NotFoundError') || error.message.includes('object stores was not found')) {
          // Try to force database upgrade
          try {
            await dbHelpers.forceUpgrade()
            errorMessage = t.workoutDetailsPage?.databaseUpdated || 'Database updated. Please try again'
          } catch (upgradeError) {
            console.error('Failed to upgrade database:', upgradeError)
            errorMessage = t.workoutDetailsPage?.databaseError || 'Database error: Please refresh the page and try again'
          }
        } else if (error.message.includes('API key')) {
          errorMessage = t.workoutDetailsPage?.invalidApiKey || 'Invalid API key. Please check your settings'
        } else if (error.message.includes('Rate limit')) {
          errorMessage = t.workoutDetailsPage?.rateLimitExceeded || 'Rate limit exceeded. Please try again later'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = t.workoutDetailsPage?.networkError || 'Network error. Please check your connection'
        }
      }
      
      showToast(errorMessage, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const renderExerciseEditFields = () => {
    if (!editedExercise) return null

    const updateExerciseField = (field: string, value: any) => {
      setEditedExercise(prev => prev ? {
        ...prev,
        details: { ...prev.details, [field]: value }
      } : null)
    }

    const updateExerciseType = (type: string) => {
      setEditedExercise(prev => prev ? { ...prev, type: type as any } : null)
    }

    return (
      <div className="space-y-4">
        {/* Exercise Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </>
        )}

        {(editedExercise.type === 'pullups' || editedExercise.type === 'pushups') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </>
        )}

        {editedExercise.type === 'plank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </>
        )}

        {/* Notes field for all types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.workoutDetailsPage?.notes || 'Notes'}
          </label>
          <textarea
            value={editedExercise.details.notes || ''}
            onChange={(e) => updateExerciseField('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={saveExercise}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-1"
          >
            <Check size={16} />
            <span>{isSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}</span>
          </button>
          <button
            onClick={cancelEditing}
            disabled={isSaving}
            className="btn-secondary flex items-center space-x-1"
          >
            <X size={16} />
            <span>{t.cancel || 'Cancel'}</span>
          </button>
        </div>
      </div>
    )
  }

  // Navigation functions
  const navigateToWeek = () => {
    const workoutDate = new Date(workout.date)
    const weekStart = new Date(workoutDate)
    weekStart.setDate(workoutDate.getDate() - workoutDate.getDay())
    const weekStartISO = weekStart.toISOString().split('T')[0]
    navigate(`/weekly?week=${weekStartISO}`)
  }

  const navigateToPreviousWorkout = () => {
    const currentIndex = workouts.findIndex((w: any) => w.id === workout.id)
    if (currentIndex > 0) {
      navigate(`/workout/${workouts[currentIndex - 1].id}`)
    }
  }

  const navigateToNextWorkout = () => {
    const currentIndex = workouts.findIndex((w: any) => w.id === workout.id)
    if (currentIndex < workouts.length - 1) {
      navigate(`/workout/${workouts[currentIndex + 1].id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <WorkoutHeader
        workout={workout}
        totalCalories={totalCalories}
        totalDuration={totalDuration}
        isEditing={editingHeader}
        isEstimating={isEstimating}
        isAnalyzing={isAnalyzing}
        hasKey={hasKey()}
        isAIConfigured={isAIConfigured}
        onEdit={startEditingHeader}
        onUpdateEstimates={updateAllAIEstimates}
        onUpdateAnalysis={updateAIAnalysis}
        onNavigateToWeek={navigateToWeek}
        onPreviousWorkout={navigateToPreviousWorkout}
        onNextWorkout={navigateToNextWorkout}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button and delete */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/workouts')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>{t.workoutDetailsPage?.backToWorkouts || 'Back to Workouts'}</span>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? (t.workoutDetailsPage?.deleting || 'Deleting...') : (t.workoutDetailsPage?.delete || 'Delete')}</span>
          </button>
        </div>

        {/* Header editing form */}
        {editingHeader && (
          <div className="card mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutForm?.date || 'Date'}
                </label>
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutForm?.rpe || 'RPE'}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editedRpe}
                    onChange={(e) => setEditedRpe(parseInt(e.target.value))}
                    className="w-full max-w-xs"
                  />
                  <div className="flex justify-between text-sm max-w-xs">
                    <span className="text-green-600">1-3 {t.workoutForm?.easy || 'Easy'}</span>
                    <span className="font-medium">
                      {editedRpe} - {editedRpe <= 3 ? t.workoutForm?.easy || 'Easy' : editedRpe <= 7 ? t.workoutForm?.moderate || 'Moderate' : t.workoutForm?.hard || 'Hard'}
                    </span>
                    <span className="text-red-600">8-10 {t.workoutForm?.hard || 'Hard'}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.workoutForm?.totalDuration || 'Total Workout Duration'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={editedDurationMin || ''}
                    onChange={(e) => setEditedDurationMin(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Optional"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">
                    {t.workoutForm?.durationMinutes || 'minutes'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={saveHeader}
                  disabled={isSaving}
                  className="btn-primary flex items-center space-x-1"
                >
                  <Check size={16} />
                  <span>{isSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}</span>
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <X size={16} />
                  <span>{t.cancel || 'Cancel'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.workoutDetailsPage?.exercises || 'Exercises'}</h3>
          
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={index}>
                {editingExercise === index ? (
                  <div className="border border-gray-200 rounded-lg p-4 ring-2 ring-primary-500 bg-primary-50">
                    {renderExerciseEditFields()}
                  </div>
                ) : (
                  <ExerciseCard
                    exercise={exercise}
                    index={index}
                    onEdit={startEditingExercise}
                    isEditing={editingExercise === index}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Feedback */}
        <AiFeedbackCard
          feedback={aiFeedback}
          isLoading={isLoadingFeedback}
          isAnalyzing={isAnalyzing}
          onUpdateAnalysis={updateAIAnalysis}
        />

        {/* Analytics */}
        <div className="mt-8">
          <WorkoutAnalytics
            exercises={workout.exercises}
            onRecalcEstimates={updateAllAIEstimates}
            isEstimating={isEstimating}
          />
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <X size={16} className="text-red-600" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default WorkoutDetailsPage