import React, { useState, useEffect } from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useWorkoutStore } from '../../stores/workout.store'
import { useProfileStore } from '../../stores/profile.store'
import WorkoutForm from '../../components/WorkoutForm'
import WorkoutCard from '../../components/WorkoutCard'
import { Plus } from 'lucide-react'

const WorkoutsPage: React.FC = () => {
  const t = useTranslations()
  const { workouts, loadWorkouts, isLoading } = useWorkoutStore()
  const { profile } = useProfileStore()
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  const handleWorkoutSuccess = () => {
    // Refresh the workouts list
    loadWorkouts()
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.workouts}</h1>
            <p className="text-lg text-gray-600 mt-2">
              {t.workoutsPage?.trackWorkoutsAndProgress || 'Track your workouts and progress'}
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t.addWorkout}</span>
          </button>
        </div>

        {/* Workouts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.workoutsPage?.loadingWorkouts || 'Loading workouts...'}</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏃</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t.noWorkoutsFound}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t.workoutsPage?.startFitnessJourney || 'Start your fitness journey by adding your first workout'}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary text-lg px-8 py-3"
            >
              {t.addFirstWorkout}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                userWeight={profile.weight}
              />
            ))}
          </div>
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
