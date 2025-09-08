import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useWorkoutStore } from '../../stores/workout.store'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'
import { useAIStore } from '../../stores/ai.store'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '../../services/kcal'
import { getBatchEstimates, needsAIEstimation, createEstimateInput } from '../../services/ai.estimate'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Trash2, TrendingUp, Check, X, Bot } from 'lucide-react'
import type { WorkoutExercise } from '../../types/models'

const WorkoutDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useTranslations()

  const { getWorkoutById, deleteWorkout, updateWorkout } = useWorkoutStore()
  const { profile } = useProfileStore()
  const { isConfigured: isAIConfigured } = useAIStore()
  
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!workout && id) {
      setWorkout(getWorkoutById(id))
    }
  }, [id, workout, getWorkoutById])

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

  const formatExerciseDetails = (exercise: any) => {
    switch (exercise.type) {
      case 'run':
        return `${exercise.details.distanceKm || 0} ${t.workoutCard?.km || 'km'} ${t.workoutDetailsPage?.for || 'in'} ${exercise.details.durationMin || 0} ${t.workoutDetailsPage?.minutes || 'minutes'}`
      case 'pullups':
      case 'pushups':
        if (exercise.details.repsPerSet) {
          const totalReps = exercise.details.repsPerSet.reduce((sum: number, reps: number) => sum + reps, 0)
          return `${exercise.details.sets || 0} ${t.workoutDetailsPage?.sets || 'sets'}: ${exercise.details.repsPerSet.join('-')} (${totalReps} ${t.workoutDetailsPage?.total || 'total'})`
        }
        return t.workoutDetailsPage?.noRepsSpecified || 'No reps specified'
      case 'plank':
        if (exercise.details.seconds) {
          const totalSeconds = exercise.details.seconds.reduce((sum: number, seconds: number) => sum + seconds, 0)
          return `${exercise.details.seconds.length} ${t.workoutDetailsPage?.holds || 'holds'}: ${exercise.details.seconds.join('-')}s (${totalSeconds}s ${t.workoutDetailsPage?.total || 'total'})`
        }
        return t.workoutDetailsPage?.noTimeSpecified || 'No time specified'
      case 'custom':
        if (exercise.details.customExercise) {
          if (exercise.details.durationMin) {
            return `${exercise.details.customExercise} ${t.workoutDetailsPage?.for || 'for'} ${exercise.details.durationMin} ${t.workoutDetailsPage?.minutes || 'minutes'}`
          } else if (exercise.details.repsPerSet) {
            const totalReps = exercise.details.repsPerSet.reduce((sum: number, reps: number) => sum + reps, 0)
            return `${exercise.details.customExercise}: ${exercise.details.sets || 0} ${t.workoutDetailsPage?.sets || 'sets'}: ${exercise.details.repsPerSet.join('-')} (${totalReps} ${t.workoutDetailsPage?.total || 'total'})`
          }
        }
        return t.workoutDetailsPage?.customExercise || 'Custom exercise'
      default:
        return t.workoutDetailsPage?.exerciseDetails || 'Exercise details'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/workouts')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>{t.workoutDetailsPage?.backToWorkouts || 'Back to Workouts'}</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t.workoutDetailsPage?.workoutDetails || 'Workout Details'}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>{isDeleting ? (t.workoutDetailsPage?.deleting || 'Deleting...') : (t.workoutDetailsPage?.delete || 'Delete')}</span>
            </button>
          </div>
        </div>

        {/* Workout Summary */}
        <div className={`card mb-8 ${editingHeader ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {editingHeader ? (
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
                        <span className={`font-medium ${getRpeColor(editedRpe)}`}>
                          {editedRpe} - {getRpeLabel(editedRpe)}
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
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {workout.rpe && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRpeColor(workout.rpe)}`}>
                        RPE {workout.rpe} - {getRpeLabel(workout.rpe)}
                      </span>
                    )}
                    {workout.durationMin && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {workout.durationMin} min
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!editingHeader && (
                <button
                  onClick={startEditingHeader}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={t.workoutDetailsPage?.editWorkout || 'Edit workout'}
                >
                  <Edit size={16} />
                </button>
              )}
              
              {workout.aiReviewId && (
                <div className="flex items-center space-x-2 text-primary-600">
                  <TrendingUp size={20} />
                  <span className="font-medium">{t.workoutDetailsPage?.aiReviewed || 'AI Reviewed'}</span>
                </div>
              )}
              
              {isAIConfigured && (
                <button
                  onClick={updateAllAIEstimates}
                  disabled={isEstimating}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Update AI estimates for all exercises"
                >
                  {isEstimating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                      <span className="text-sm">Updating...</span>
                    </>
                  ) : (
                    <>
                      <Bot size={16} />
                      <span className="text-sm">Update AI Estimates</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalCalories}</div>
              <div className="text-sm text-gray-600">{t.workoutDetailsPage?.totalCalories || 'Total Calories'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(totalDuration)}</div>
              <div className="text-sm text-gray-600">{t.workoutDetailsPage?.duration || 'Duration (minutes)'}</div>
            </div>
        <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{workout.exercises.length}</div>
              <div className="text-sm text-gray-600">{t.workoutDetailsPage?.exercises || 'Exercises'}</div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.workoutDetailsPage?.exercises || 'Exercises'}</h3>
          
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className={`border border-gray-200 rounded-lg p-4 ${editingExercise === index ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
                {editingExercise === index ? (
                  renderExerciseEditFields()
                ) : (
                  <>
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
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditingExercise(index)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={t.workoutDetailsPage?.editExercise || 'Edit exercise'}
                        >
                          <Edit size={16} />
                        </button>
                        
                        {exercise.kcalEstimated && exercise.kcalEstimated > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <span>~{exercise.kcalEstimated} kcal</span>
                            {exercise.estimateMeta?.source === 'ai' && (
                              <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded" title="Estimated by AI">
                                AI
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {exercise.details.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{exercise.details.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis (if available) */}
        {workout.aiReviewId && (
          <div className="card mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp size={20} className="text-primary-600" />
              <span>{t.workoutDetailsPage?.aiAnalysis || 'AI Analysis'}</span>
            </h3>
            <p className="text-gray-600">
              {t.workoutDetailsPage?.aiAnalysisDescription || 'This workout has been analyzed by AI. View the full analysis and recommendations in the AI section.'}
            </p>
          </div>
        )}

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
