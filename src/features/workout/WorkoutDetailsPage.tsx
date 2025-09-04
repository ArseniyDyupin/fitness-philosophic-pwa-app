import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useWorkoutStore } from '../../stores/workout.store'
import { useProfileStore } from '../../stores/profile.store'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '../../services/kcal'
import { format } from 'date-fns'
import { ArrowLeft, Edit3, Trash2, TrendingUp } from 'lucide-react'

const WorkoutDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { getWorkoutById, deleteWorkout } = useWorkoutStore()
  const { profile } = useProfileStore()
  
  const [workout, setWorkout] = useState(getWorkoutById(id!))
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!workout && id) {
      setWorkout(getWorkoutById(id))
    }
  }, [id, workout, getWorkoutById])

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Workout not found</h2>
          <button
            onClick={() => navigate('/workouts')}
            className="btn-primary"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    )
  }

  const totalCalories = profile?.weight 
    ? calculateWorkoutCalories(workout.exercises, profile.weight, workout.rpe)
    : 0
  const totalDuration = calculateWorkoutDuration(workout.exercises)

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-600 bg-green-100'
    if (rpe <= 7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRpeLabel = (rpe: number) => {
    if (rpe <= 3) return 'Easy'
    if (rpe <= 7) return 'Moderate'
    return 'Hard'
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this workout?')) {
      setIsDeleting(true)
      try {
        await deleteWorkout(workout.id)
        navigate('/workouts')
      } catch (error) {
        console.error('Failed to delete workout:', error)
        alert('Failed to delete workout')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const formatExerciseDetails = (exercise: any) => {
    switch (exercise.type) {
      case 'run':
        return `${exercise.details.distanceKm || 0} km in ${exercise.details.durationMin || 0} minutes`
      case 'pullups':
      case 'pushups':
        if (exercise.details.repsPerSet) {
          const totalReps = exercise.details.repsPerSet.reduce((sum: number, reps: number) => sum + reps, 0)
          return `${exercise.details.sets || 0} sets: ${exercise.details.repsPerSet.join('-')} (${totalReps} total)`
        }
        return 'No reps specified'
      case 'plank':
        if (exercise.details.seconds) {
          const totalSeconds = exercise.details.seconds.reduce((sum: number, seconds: number) => sum + seconds, 0)
          return `${exercise.details.seconds.length} holds: ${exercise.details.seconds.join('-')}s (${totalSeconds}s total)`
        }
        return 'No time specified'
      case 'custom':
        if (exercise.details.customExercise) {
          if (exercise.details.durationMin) {
            return `${exercise.details.customExercise} for ${exercise.details.durationMin} minutes`
          } else if (exercise.details.repsPerSet) {
            const totalReps = exercise.details.repsPerSet.reduce((sum: number, reps: number) => sum + reps, 0)
            return `${exercise.details.customExercise}: ${exercise.details.sets || 0} sets: ${exercise.details.repsPerSet.join('-')} (${totalReps} total)`
          }
        }
        return 'Custom exercise'
      default:
        return 'Exercise details'
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
              <span>Back to Workouts</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Workout Details</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/workouts/${workout.id}/edit`)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit3 size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {/* Workout Summary */}
        <div className="card mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
              </h2>
              {workout.rpe && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRpeColor(workout.rpe)}`}>
                  RPE {workout.rpe} - {getRpeLabel(workout.rpe)}
                </span>
              )}
            </div>
            
            {workout.aiReviewId && (
              <div className="flex items-center space-x-2 text-primary-600">
                <TrendingUp size={20} />
                <span className="font-medium">AI Reviewed</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalCalories}</div>
              <div className="text-sm text-gray-600">Total Calories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(totalDuration)}</div>
              <div className="text-sm text-gray-600">Duration (minutes)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{workout.exercises.length}</div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Exercises</h3>
          
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {exercise.type === 'custom' && exercise.details.customExercise
                        ? exercise.details.customExercise
                        : exercise.type
                      }
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatExerciseDetails(exercise)}
                    </p>
                  </div>
                  
                  {exercise.kcalEstimated && exercise.kcalEstimated > 0 && (
                    <div className="text-sm text-gray-500">
                      ~{exercise.kcalEstimated} kcal
                    </div>
                  )}
                </div>
                
                {exercise.details.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{exercise.details.notes}</p>
                  </div>
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
              <span>AI Analysis</span>
            </h3>
            <p className="text-gray-600">
              This workout has been analyzed by AI. View the full analysis and recommendations in the AI section.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default WorkoutDetailsPage
