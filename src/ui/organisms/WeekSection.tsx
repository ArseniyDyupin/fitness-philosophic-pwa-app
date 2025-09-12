import React from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useAIStore } from '@stores/ai.store'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import type { Workout } from '../../types/models'
import WorkoutCard from './WorkoutCard'
import WeekSummary from './WeekSummary'

interface WeekSectionProps {
  workouts: Workout[]
  weekStart: Date
  previousWeekWorkouts?: Workout[]
  onAddWorkout: () => void
  onGenerateWorkout: () => void
}

const WeekSection: React.FC<WeekSectionProps> = ({
  workouts,
  weekStart,
  previousWeekWorkouts,
  onAddWorkout,
  onGenerateWorkout
}) => {
  const t = useTranslations()
  const { isConfigured: isAIConfigured } = useAIStore()
  const navigate = useNavigate()

  const handleWorkoutClick = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`)
  }

  const handleEditWorkout = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`)
  }

  const handleDeleteWorkout = (workoutId: string) => {
    // This will be handled by the parent component
    console.log('Delete workout:', workoutId)
  }

  const handleUpdateAnalysis = (workoutId: string) => {
    // This will be handled by the parent component
    console.log('Update analysis for workout:', workoutId)
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty Week State */}
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t.workoutsPage?.emptyWeek?.title || 'No workouts this week'}
            </h3>
            <p className="text-gray-500 mb-6">
              Start your fitness journey by adding your first workout
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onAddWorkout}
                className="btn-primary flex items-center justify-center space-x-2 touch-manipulation"
              >
                <Plus size={18} />
                <span>{t.workoutsPage?.emptyWeek?.add || 'Add Workout'}</span>
              </button>
              {isAIConfigured && (
                <button
                  onClick={onGenerateWorkout}
                  className="btn-secondary flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <Sparkles size={18} />
                  <span>{t.workoutsPage?.emptyWeek?.generate || 'Generate Workout'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onClick={() => handleWorkoutClick(workout.id)}
            onEdit={() => handleEditWorkout(workout.id)}
            onDelete={() => handleDeleteWorkout(workout.id)}
            onUpdateAnalysis={() => handleUpdateAnalysis(workout.id)}
          />
        ))}
      </div>
      <WeekSummary
        workouts={workouts}
        weekStart={weekStart}
        previousWeekWorkouts={previousWeekWorkouts}
      />
    </div>
  )
}

export default WeekSection
