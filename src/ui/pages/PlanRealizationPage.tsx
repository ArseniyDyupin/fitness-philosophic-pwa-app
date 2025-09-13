import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslations } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import { useWorkoutStore } from '@stores/workout.store'
import { useAIStore } from '@stores/ai.store'
import { calculateWorkoutCalories } from '@services/fitness'
import { getBatchEstimates, needsAIEstimation, createEstimateInput, aiService } from '@services/ai'
import { db } from '@services/data'
import { toastSuccess, toastError } from '@lib/toast'
import PlanSummary from '@organisms/plan/PlanSummary'
import PlanExerciseCard from '@organisms/plan/PlanExerciseCard'
import type { PlanSuggestion, ExerciseEdit, Workout, WorkoutExercise } from '@/types/models'
import { ArrowLeft, Save, X, RotateCcw, Loader } from 'lucide-react'

const PlanRealizationPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const t = useTranslations()
  const { profile } = useProfileStore()
  const { addWorkout } = useWorkoutStore()
  const { isConfigured: isAIConfigured } = useAIStore()

  const [plan, setPlan] = useState<PlanSuggestion | null>(null)
  const [exerciseEdits, setExerciseEdits] = useState<ExerciseEdit[]>([])
  const [rpe, setRpe] = useState<number>(5)
  const [workoutComment, setWorkoutComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [adjustmentText, setAdjustmentText] = useState('')
  const [showAdjustment, setShowAdjustment] = useState(false)

  useEffect(() => {
    if (planId) {
      loadPlan()
    }
  }, [planId])

  const loadPlan = async () => {
    try {
      const loadedPlan = await db.plans.get(planId!)
      if (loadedPlan) {
        setPlan(loadedPlan)
        setRpe(loadedPlan.workoutTemplate?.rpe || 5)

        // Initialize exercise edits
        const edits: ExerciseEdit[] =
          loadedPlan.workoutTemplate?.exercises.map((_, index) => ({
            index,
            status: 'as_planned' as const
          })) || []
        setExerciseEdits(edits)
      } else {
        toastError(t.plan?.noPlanAvailable || 'Plan not found')
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to load plan:', error)
      toastError(t.error || 'Failed to load plan')
    }
  }


  const handleExerciseEditChange = (index: number, edit: ExerciseEdit) => {
    setExerciseEdits((prev) => prev.map((e, i) => (i === index ? edit : e)))
  }

  const createWorkoutFromPlan = async () => {
    if (!plan || !plan.workoutTemplate) return

    setIsSaving(true)
    try {
      // Filter out skipped exercises and apply edits
      const finalExercises = plan.workoutTemplate.exercises
        .map((exercise, index) => {
          const edit = exerciseEdits[index]
          if (!edit || edit.status === 'skipped') return null

          // Apply edits if any
          if (edit.edited) {
            return {
              ...exercise,
              details: { ...exercise.details, ...edit.edited }
            }
          }
          return exercise
        })
        .filter(Boolean)

      // Get AI estimates for exercises that need them
      let exercisesWithEstimates = finalExercises as WorkoutExercise[]
      
      if (profile && isAIConfigured) {
        const exercisesNeedingEstimation = finalExercises.filter(exercise => needsAIEstimation(exercise!))
        
        if (exercisesNeedingEstimation.length > 0) {
          const estimateInputs = exercisesNeedingEstimation.map(exercise => 
            createEstimateInput(exercise!, {
              weightKg: profile.weight,
              age: profile.age,
              gender: profile.gender
            })
          )
          
          const estimates = await getBatchEstimates(estimateInputs)
          
          // Update exercises with estimates
          exercisesWithEstimates = finalExercises.map(exercise => {
            const needsEstimate = needsAIEstimation(exercise!)
            if (needsEstimate) {
              const estimateIndex = exercisesNeedingEstimation.findIndex(e => e === exercise)
              const estimate = estimates[estimateIndex]
              
              if (estimate) {
                return {
                  ...exercise!,
                  kcalEstimated: estimate.kcal,
                  estimateMeta: {
                    source: 'ai' as const,
                    updatedAt: new Date().toISOString()
                  }
                } as WorkoutExercise
              }
            }
            
            // Fallback to local calculation if no AI estimate
            return {
              ...exercise!,
              kcalEstimated: profile?.weight
                ? calculateWorkoutCalories([exercise!], profile.weight, rpe)
                : undefined
            } as WorkoutExercise
          })
        } else {
          // No AI estimates needed, use local calculation
          exercisesWithEstimates = finalExercises.map((exercise) => ({
            ...exercise!,
            kcalEstimated: profile?.weight
              ? calculateWorkoutCalories([exercise!], profile.weight, rpe)
              : undefined
          })) as WorkoutExercise[]
        }
      } else {
        // No AI configured, use local calculation
        exercisesWithEstimates = finalExercises.map((exercise) => ({
          ...exercise!,
          kcalEstimated: profile?.weight
            ? calculateWorkoutCalories([exercise!], profile.weight, rpe)
            : undefined
        })) as WorkoutExercise[]
      }

      const workoutDate = plan.workoutTemplate?.date || plan.forDate

      const workout: Workout = {
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: workoutDate,
        exercises: exercisesWithEstimates,
        rpe,
        aiReviewId: plan.id, // Link to the original plan
        status: 'completed', // Mark as completed when saved
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save workout
      await addWorkout(workout)

      toastSuccess(t.plan?.save || 'Workout saved successfully')
      
      // Navigate to workouts list
      setTimeout(() => {
        navigate('/workouts')
      }, 1500)
    } catch (error) {
      console.error('Failed to save workout:', error)
      toastError(t.error || 'Failed to save workout')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const handleAdjustPlan = async () => {
    if (!plan || !profile || !adjustmentText.trim()) return

    setIsAdjusting(true)
    try {
      const recentWorkouts = await db.workouts.orderBy('date').reverse().limit(5).toArray()
      
      // Generate new plan with adjustment
      const newPlan = await aiService.generateNextWorkout(
        profile, 
        recentWorkouts, 
        profile.language || 'ru',
        `Корректировка плана: ${adjustmentText}`
      )

      // Update current plan with new data
      setPlan(newPlan)
      setRpe(newPlan.workoutTemplate?.rpe || 5)
      
      // Reset exercise edits
      const newEdits: ExerciseEdit[] = newPlan.workoutTemplate?.exercises.map((_, index) => ({
        index,
        status: 'as_planned' as const
      })) || []
      setExerciseEdits(newEdits)
      
      setShowAdjustment(false)
      setAdjustmentText('')
      toastSuccess(t.plan?.adjust?.apply || 'Plan adjusted successfully')
      
    } catch (error) {
      console.error('Failed to adjust plan:', error)
      toastError(t.error || 'Failed to adjust plan')
    } finally {
      setIsAdjusting(false)
    }
  }

  if (!plan || !plan.workoutTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.loading || 'Loading...'}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
                <ArrowLeft size={20} />
                <span>{t.back || 'Back'}</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {t.plan?.title || 'Plan for Today'}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {new Date(plan.forDate).toLocaleDateString()}
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  rpe <= 3
                    ? 'text-green-600 bg-green-100'
                    : rpe <= 7
                      ? 'text-yellow-600 bg-yellow-100'
                      : 'text-red-600 bg-red-100'
                }`}
              >
                RPE {rpe}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RPE Selection */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.plan?.rpe || 'RPE'}</h3>
              <p className="text-sm text-gray-600">
                {t.plan?.rpe === 'RPE'
                  ? 'Rate of Perceived Exertion (1-10 scale)'
                  : 'Уровень воспринимаемой нагрузки (шкала 1-10)'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                {rpe}
              </span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        {plan.notes && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t.plan?.analysis || 'Workout Analysis'}
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {plan.notes.split('\n\nСоветы:')[0]}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <PlanSummary workout={plan.workoutTemplate} profile={profile || undefined} />

        {/* Exercises */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.plan?.summary?.exercises || 'Exercises'}
          </h3>

          {plan.workoutTemplate.exercises.map((exercise, index) => (
            <PlanExerciseCard
              key={index}
              exercise={exercise}
              index={index}
              edit={exerciseEdits[index] || { index, status: 'as_planned' }}
              onEditChange={(edit) => handleExerciseEditChange(index, edit)}
            />
          ))}
        </div>

        {/* Workout Comment */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t.plan?.workoutComment || 'Workout Comment'}
          </h3>
          <textarea
            value={workoutComment}
            onChange={(e) => setWorkoutComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.plan?.workoutComment || 'Add a comment about your workout...'}
          />
        </div>

        {/* Plan Adjustment */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.plan?.adjust?.button || 'Adjust Plan'}
            </h3>
            <button
              onClick={() => setShowAdjustment(!showAdjustment)}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>{t.plan?.adjust?.button || 'Adjust Plan'}</span>
            </button>
          </div>
          
          {showAdjustment && (
            <div className="space-y-4">
              <textarea
                value={adjustmentText}
                onChange={(e) => setAdjustmentText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder={t.plan?.adjust?.placeholder || 'Specify what needs to be changed...'}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAdjustment(false)
                    setAdjustmentText('')
                  }}
                  className="btn-secondary"
                >
                  {t.cancel || 'Cancel'}
                </button>
                <button
                  onClick={handleAdjustPlan}
                  disabled={isAdjusting || !adjustmentText.trim()}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isAdjusting ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <RotateCcw size={16} />
                  )}
                  <span>
                    {isAdjusting 
                      ? (t.loading || 'Loading...') 
                      : (t.plan?.adjust?.apply || 'Apply Changes')
                    }
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
            <X size={16} />
            <span>{t.plan?.cancel || 'Cancel'}</span>
          </button>

          <button
            onClick={createWorkoutFromPlan}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={16} />
            )}
            <span>{isSaving ? t.saving || 'Saving...' : t.plan?.save || 'Save as Workout'}</span>
          </button>
        </div>
      </main>

    </div>
  )
}

export default PlanRealizationPage
