import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslations } from '@stores/i18n.store'
import { useWorkoutStore } from '@stores/workout.store'
import { useProfileStore } from '@stores/profile.store'
import WorkoutForm from '@organisms/workouts/WorkoutForm'
import WeekSection from '@organisms/workouts/WeekSection'
import WeekNavigator from '@molecules/workouts/WeekNavigator'
import { Plus } from 'lucide-react'
import { startOfWeek, addWeeks, isSameWeek } from 'date-fns'

const WorkoutsPage: React.FC = () => {
  const t = useTranslations()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { workouts, loadWorkouts, isLoading, getWorkoutsByWeek } = useWorkoutStore()
  const { profile } = useProfileStore()
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const week = searchParams.get('week')
    if (week == null) {
      handleWeekChange(startOfWeek(new Date(), { weekStartsOn: 2 }))
    }
  }, [])

  const weekParam = searchParams.get('week')
  const selectedWeekStart = weekParam 
    ? new Date(weekParam) 
    : startOfWeek(new Date(), { weekStartsOn: 1 })

  // Get workouts for current and previous week
  const currentWeekWorkouts = getWorkoutsByWeek(selectedWeekStart)
  const previousWeekWorkouts = getWorkoutsByWeek(addWeeks(selectedWeekStart, -1))

  // Check if we have data for navigation
  const hasPreviousWeek = getWorkoutsByWeek(addWeeks(selectedWeekStart, -1)).length > 0 || 
    workouts.some(w => new Date(w.date) < selectedWeekStart)
  const hasNextWeek = getWorkoutsByWeek(addWeeks(selectedWeekStart, 1)).length > 0 || 
    workouts.some(w => new Date(w.date) > addWeeks(selectedWeekStart, 1))
  const isCurrentWeek = isSameWeek(selectedWeekStart, new Date(), { weekStartsOn: 1 })

  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  const handleWeekChange = (weekStart: Date) => {
    const weekString = weekStart.toISOString().split('T')[0]
    setSearchParams({ week: weekString })
  }

  const handleWorkoutSuccess = (workoutId?: string) => {
    loadWorkouts()
    if (workoutId) {
      navigate(`/workouts/${workoutId}`)
    }
  }

  const handleAddWorkout = () => {
    setIsFormOpen(true)
  }

  const handleGenerateWorkout = () => {
    navigate('/workout/generate')
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.loading}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Week Navigator */}
      <WeekNavigator
        selectedWeekStart={selectedWeekStart}
        onWeekChange={handleWeekChange}
        hasPreviousWeek={hasPreviousWeek}
        hasNextWeek={hasNextWeek}
        isCurrentWeek={isCurrentWeek}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.workouts}</h1>
            <p className="text-sm sm:text-lg text-gray-600 mt-1 sm:mt-2">
              {t.workoutsPage?.trackWorkoutsAndProgress || 'Track your workouts and progress'}
            </p>
          </div>
          <button
            onClick={handleAddWorkout}
            className="btn-primary flex items-center space-x-1 sm:space-x-2 touch-manipulation"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t.addWorkout}</span>
            <span className="sm:hidden">{t.add}</span>
          </button>
        </div>

        {/* Week Section */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.workoutsPage?.loadingWorkouts || 'Loading workouts...'}</p>
          </div>
        ) : (
          <WeekSection
            workouts={currentWeekWorkouts}
            weekStart={selectedWeekStart}
            previousWeekWorkouts={previousWeekWorkouts}
            onAddWorkout={handleAddWorkout}
            onGenerateWorkout={handleGenerateWorkout}
          />
        )}
      </main>

      {/* Workout Form Modal */}
      <WorkoutForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleWorkoutSuccess}
      />
    </div>
  )
}

export default WorkoutsPage
