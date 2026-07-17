import React, { useState } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Zap, Target, Play, CheckCircle, Settings, Plus } from 'lucide-react'
import type { Workout, PlanSuggestion } from '@/types/models'
import GenerateWorkoutButton from '@molecules/home/GenerateWorkoutButton'
import WorkoutForm from '@organisms/workouts/WorkoutForm'
import GenerateWorkoutModal from '@modals/shared/GenerateWorkoutModal'

interface NextWorkoutCardProps {
  plan?: Workout
  hasApiKey: boolean
  onOpenPlan: () => void
  onMarkDone: () => void
  onOpenSettings: () => void
}

const NextWorkoutCard: React.FC<NextWorkoutCardProps> = ({
  plan,
  hasApiKey,
  onOpenPlan,
  onMarkDone,
  onOpenSettings
}) => {
  const t = useTranslations()
  const navigate = useNavigate()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  const handleFormSuccess = (workoutId?: string) => {
    setIsFormOpen(false)
    if (workoutId) {
      navigate(`/workouts/${workoutId}`)
    }
  }

  const handlePlanGenerated = (generatedPlan: PlanSuggestion) => {
    setIsGenerateModalOpen(false)
    if (generatedPlan.workoutTemplate) {
      navigate(`/workouts/${generatedPlan.workoutTemplate.id}`)
    }
  }

  const handleGenerateClick = () => {
    setIsGenerateModalOpen(true)
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getRPEBadgeColor = (rpe: number): string => {
    if (rpe <= 3) return 'bg-green-100 text-green-800'
    if (rpe <= 6) return 'bg-yellow-100 text-yellow-800'
    if (rpe <= 8) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getRPEBadgeText = (rpe: number): string => {
    if (rpe <= 3) return t.workoutForm?.easy || 'Easy'
    if (rpe <= 6) return t.workoutForm?.moderate || 'Moderate'
    if (rpe <= 8) return t.workoutForm?.hard || 'Hard'
    return t.workoutForm?.veryHard || 'Very Hard'
  }

  if (plan) {
    const totalCalories = plan.exercises?.reduce((sum, ex) => sum + (ex.kcalEstimated || 0), 0) || 0
    const totalDuration = plan.durationMin || plan.exercises?.reduce((sum, ex) => sum + (ex.details.durationMin || 0), 0) || 0
    const avgRPE = plan.rpe || 0
    const exerciseCount = plan.exercises?.length || 0

    return (
      <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t.homeDashboard?.nextPlan?.today || 'Plan for Today'}
            </h2>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{t.homeDashboard?.kpi?.minutes || 'Minutes'}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(totalDuration)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{t.homeDashboard?.kpi?.calories || 'Calories'}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {totalCalories}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{t.homeDashboard?.kpi?.exercises || 'Exercises'}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {exerciseCount}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="text-sm text-gray-600">{t.homeDashboard?.kpi?.rpe || 'RPE'}</span>
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getRPEBadgeColor(avgRPE)}`}>
              {avgRPE.toFixed(1)} - {getRPEBadgeText(avgRPE)}
            </div>
          </div>
        </div>

        {/* Exercise List */}
        {plan.exercises && plan.exercises.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t.homeDashboard?.nextPlan?.exercises || 'Exercises'}:</h3>
            <div className="space-y-1">
              {plan.exercises.slice(0, 3).map((exercise, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{exercise.details.customExercise || exercise.type}</span>
                  <span className="text-gray-500">
                    {exercise.details.sets && exercise.details.repsPerSet ? 
                      `${exercise.details.sets}x${exercise.details.repsPerSet[0]}` : 
                      exercise.details.durationMin ? `${exercise.details.durationMin}min` : ''
                    } {exercise.details.weightKg && `${exercise.details.weightKg}kg`}
                  </span>
                </div>
              ))}
              {plan.exercises.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{plan.exercises.length - 3} {t.homeDashboard?.nextPlan?.moreExercises || 'more exercises'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onOpenPlan}
            className="btn-primary flex items-center space-x-2 flex-1 justify-center"
          >
            <Play size={16} />
            <span>{t.homeDashboard?.nextPlan?.open || 'Open Plan'}</span>
          </button>
          <button
            onClick={onMarkDone}
            className="btn-secondary flex items-center space-x-2"
          >
            <CheckCircle size={16} />
            <span>{t.homeDashboard?.nextPlan?.markDone || 'Mark Done'}</span>
          </button>
        </div>
      </div>
      
      {/* Workout Form Modal */}
      <WorkoutForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </>
  )
  }

  // No plan state
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.homeDashboard?.nextPlan?.noPlan || 'No plan created for today'}
          </h3>
          
          <p className="text-gray-500 mb-6">
            {hasApiKey 
              ? t.homeDashboard?.nextPlan?.generateDescription || 'Generate a personalized workout plan for today'
              : t.homeDashboard?.nextPlan?.enableAIDescription || 'Enable AI to generate personalized workout plans'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {hasApiKey ? (
              <GenerateWorkoutButton
                variant="primary"
                size="md"
                showIcon={true}
                showText={true}
                onClick={handleGenerateClick}
              />
            ) : (
              <button
                onClick={onOpenSettings}
                className="btn-primary flex items-center space-x-2"
              >
                <Settings size={16} />
                <span>{t.homeDashboard?.nextPlan?.enableAI || 'Enable AI'}</span>
              </button>
            )}
            
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-secondary flex items-center space-x-1 sm:space-x-2 touch-manipulation"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t.homeDashboard?.cta?.addWorkout || t.addWorkout || 'Add Workout'}</span>
              <span className="sm:hidden">{t.homeDashboard?.cta?.add || 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Workout Form Modal */}
      <WorkoutForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
      
      {/* Generate Workout Modal */}
      <GenerateWorkoutModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />
    </>
  )
}

export default NextWorkoutCard
