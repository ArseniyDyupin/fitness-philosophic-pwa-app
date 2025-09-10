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
import { ArrowLeft, Trash2, Check, X, ArrowRight } from 'lucide-react'
import type { Workout, WorkoutExercise, AIWorkoutFeedback } from '../../types/models'

// New components
import WorkoutHeader from '../../components/workout/WorkoutHeader'
import ExerciseCard from '../../components/workout/ExerciseCard'
import AiFeedbackCard from '../../components/workout/AiFeedbackCard'
import EditWorkoutMetaModal from '../../components/workout/EditWorkoutMetaModal'
import ExerciseEditModal from '../../components/workout/ExerciseEditModal'

const WorkoutDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useTranslations()

  const { getWorkoutById, deleteWorkout, updateWorkout, getPrevNext } = useWorkoutStore()
  const { profile } = useProfileStore()
  const { isConfigured: isAIConfigured, hasKey } = useAIStore()
  
  const [workout, setWorkout] = useState(getWorkoutById(id!))
  const [isDeleting, setIsDeleting] = useState(false)
  
  // States
  const [isEstimating, setIsEstimating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<AIWorkoutFeedback | null>(null)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null)

  const { next: nextWorkout, prev: prevWorkout } = getPrevNext(id)

  useEffect(() => {
    if (!workout && id) {
      setWorkout(getWorkoutById(id))
    }
  }, [id, workout, getWorkoutById])

  useEffect(() => {
    if (id) {
      if (workout?.aiReviewId) {
        loadAIFeedback()
      } else {
        setAiFeedback(null)
      }
    }
  }, [id, workout?.aiReviewId])

  const loadAIFeedback = async () => {
    if (!workout) return
    setIsLoadingFeedback(true)
    try {
      const feedback = await dbHelpers.getAIFeedbackByWorkout(workout.id)
      setAiFeedback(feedback || null)
    } catch (error) {
      console.error('Failed to load AI feedback:', error)
      if (error instanceof Error && (error.message.includes('NotFoundError') || error.message.includes('object stores was not found'))) {
        try {
          await dbHelpers.forceUpgrade()
          const feedback = await dbHelpers.getAIFeedbackByWorkout(workout.id)
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
    setIsAnalyzing(true)
    try {
      await aiReviewService.reviewWorkout(workout.id)
      const updatedWorkout = getWorkoutById(workout.id)
      setWorkout(updatedWorkout)
      await loadAIFeedback()
      setTimeout(async () => {
        try {
          await dbHelpers.getAIFeedbackByWorkout(workout.id)
        } catch (error) {
          console.error('DEBUG: Failed to get AI feedback after analysis:', error)
        }
      }, 1000)
      
      showToast(t.workoutDetailsPage?.analysisUpdated || 'Analysis updated', 'success')
    } catch (error) {
      console.error('Failed to update AI analysis:', error)
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

  const handleSaveMeta = async (updatedWorkout: Partial<Workout>) => {
    try {
      await updateWorkout(workout.id, updatedWorkout)
      setWorkout({ ...workout, ...updatedWorkout })
      showToast(t.workoutDetailsPage?.metaModal?.saved || 'Data updated', 'success')
    } catch (error) {
      console.error('Failed to save workout metadata:', error)
      showToast(t.workoutDetailsPage?.updateFailed || 'Failed to update', 'error')
    }
  }

  const navigateToPreviousWorkout = () => {
    if (prevWorkout) {
      setWorkout(null)
      navigate(`/workouts/${prevWorkout.id}`)
    }
  }

  const navigateToNextWorkout = () => {
    if (nextWorkout) {
      setWorkout(null)
      navigate(`/workouts/${nextWorkout.id}`)
    }
  }

  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise)
    setIsExerciseModalOpen(true)
  }

  const handleSaveExercise = async (updatedExercise: WorkoutExercise) => {
    if (!workout || !editingExercise) return

    try {
      // Get AI estimates if needed and AI is configured
      let finalExercise = updatedExercise
      if (profile && isAIConfigured && needsAIEstimation(updatedExercise)) {
        try {
          const estimateInput = createEstimateInput(updatedExercise, {
            weightKg: profile.weight,
            age: profile.age,
            gender: profile.gender
          })
          
          const estimates = await getBatchEstimates([estimateInput])
          const estimate = estimates[0]
          
          if (estimate) {
            finalExercise = {
              ...updatedExercise,
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
        }
      }

      // Find and update the exercise
      const exerciseIndex = workout.exercises.findIndex(ex => ex === editingExercise)
      if (exerciseIndex !== -1) {
        const updatedExercises = [...workout.exercises]
        updatedExercises[exerciseIndex] = finalExercise
        
        const updatedWorkout = {
          ...workout,
          exercises: updatedExercises
        }
        
        await updateWorkout(workout.id, updatedWorkout)
        setWorkout(updatedWorkout)
        showToast(t.workoutDetailsPage?.exerciseUpdated || 'Exercise updated successfully', 'success')
      }
    } catch (error) {
      console.error('Failed to update exercise:', error)
      showToast(t.workoutDetailsPage?.updateFailed || 'Failed to update exercise', 'error')
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <WorkoutHeader
        workout={workout}
        totalCalories={totalCalories}
        totalDuration={totalDuration}
        isEstimating={isEstimating}
        isAnalyzing={isAnalyzing}
        hasKey={hasKey()}
        isAIConfigured={isAIConfigured}
        onUpdateEstimates={updateAllAIEstimates}
        onUpdateAnalysis={updateAIAnalysis}
        onEditMeta={() => setIsMetaModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Back button and delete */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/workouts')}
            className="btn-secondary flex items-center space-x-1 sm:space-x-2 touch-manipulation"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{t.workoutDetailsPage?.backToWorkouts || 'Back to Workouts'}</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-1 sm:space-x-2 touch-manipulation"
          >
            <Trash2 size={16} className="sm:w-4 sm:h-4" />
            <span className="text-sm sm:text-base">{isDeleting ? (t.workoutDetailsPage?.deleting || 'Deleting...') : (t.workoutDetailsPage?.delete || 'Delete')}</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {prevWorkout && (<button
              onClick={navigateToPreviousWorkout}
              className="btn-secondary flex items-center space-x-1 sm:space-x-2 touch-manipulation"
              title={t.workoutDetailsPage?.nav?.prev || 'Previous workout'}
              aria-label={t.workoutDetailsPage?.nav?.prev || 'Previous workout'}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{t.workoutDetailsPage?.nav?.prev || 'Previous workout'}</span>
            </button>)}
            {nextWorkout && (<button
              onClick={navigateToNextWorkout}
              className="btn-secondary flex items-center space-x-1 sm:space-x-2 touch-manipulation"
              title={t.workoutDetailsPage?.nav?.next || 'Next workout'}
              aria-label={t.workoutDetailsPage?.nav?.next || 'Next workout'}
            >
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{t.workoutDetailsPage?.nav?.next || 'Next workout'}</span>
            </button>)}
          </div>
        </div>

        <div className="card mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{t.workoutDetailsPage?.exercises || 'Exercises'}</h3>
          
          <div className="space-y-2 sm:space-y-3">
            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={index}
                exercise={exercise}
                index={index}
                onEdit={handleEditExercise}
                isEditing={false}
              />
            ))}
          </div>
        </div>

        <AiFeedbackCard
          feedback={aiFeedback}
          isLoading={isLoadingFeedback}
          isAnalyzing={isAnalyzing}
          onUpdateAnalysis={updateAIAnalysis}
        />

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

      <EditWorkoutMetaModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        workout={workout}
        onSave={handleSaveMeta}
      />

      {editingExercise && (
        <ExerciseEditModal
          isOpen={isExerciseModalOpen}
          onClose={() => {
            setIsExerciseModalOpen(false)
            setEditingExercise(null)
          }}
          exercise={editingExercise}
          onSave={handleSaveExercise}
        />
      )}
    </div>
  )
}

export default WorkoutDetailsPage