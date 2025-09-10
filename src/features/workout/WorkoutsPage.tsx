import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslations } from '../../stores/i18n.store'
import { useWorkoutStore } from '../../stores/workout.store'
import { useProfileStore } from '../../stores/profile.store'
import WorkoutForm from '../../components/WorkoutForm'
import WeekNavigator from '../../components/workout/WeekNavigator'
import WeekSection from '../../components/workout/WeekSection'
import { Plus } from 'lucide-react'
import { startOfWeek, addWeeks, isSameWeek } from 'date-fns'

const WorkoutsPage: React.FC = () => {
  const t = useTranslations()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { workouts, loadWorkouts, isLoading, getWorkoutsByWeek } = useWorkoutStore()
  const { profile } = useProfileStore()
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Get selected week from URL params or default to current week
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
    // Refresh the workouts list
    loadWorkouts()
    
    // Navigate to workout details if workoutId is provided
    if (workoutId) {
      navigate(`/workouts/${workoutId}`)
    }
  }

  const handleAddWorkout = () => {
    setIsFormOpen(true)
  }

  const handleGenerateWorkout = () => {
    // Navigate to AI workout generation
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
            <span className="sm:hidden">Add</span>
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

      {/* Mobile FAB */}
      <button
        onClick={handleAddWorkout}
        className="fixed bottom-6 right-6 sm:hidden bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors touch-manipulation z-50"
        aria-label="Add workout"
      >
        <Plus size={24} />
      </button>

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
