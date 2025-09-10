import React from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { Eye, Edit, Trash2, Plus, FileText } from 'lucide-react'
import type { Workout } from '../../types/models'

interface RecentWorkoutsProps {
  workouts: Workout[]
  isLoading?: boolean
  onEdit?: (workout: Workout) => void
  onDelete?: (workout: Workout) => void
}

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({
  workouts,
  isLoading = false,
  onEdit,
  onDelete
}) => {
  const t = useTranslations()
  const navigate = useNavigate()

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


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {(t.homeDashboard as any)?.recent?.title || 'Recent Workouts'}
          </h2>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {(t.homeDashboard as any)?.recent?.empty || 'No workouts yet'}
          </h3>
          
          <p className="text-gray-500 mb-6">
            Start tracking your fitness journey by adding your first workout
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate('/workouts')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>{(t.homeDashboard as any)?.recent?.add || 'Add Workout'}</span>
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>{(t.homeDashboard as any)?.recent?.import || 'Import JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {(t.homeDashboard as any)?.recent?.title || 'Recent Workouts'}
        </h2>
        <button
          onClick={() => navigate('/workouts')}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {(t.homeDashboard as any)?.recent?.showAll || 'Show All'}
        </button>
      </div>
      
      <div className="space-y-3">
        {workouts.slice(0, 5).map((workout) => {
          const totalCalories = workout.exercises?.reduce((sum, ex) => sum + (ex.kcalEstimated || 0), 0) || 0
          const totalDuration = workout.durationOverrideMin || workout.exercises?.reduce((sum, ex) => sum + (ex.details.durationMin || 0), 0) || 0
          const avgRPE = workout.rpe || 0
          const exerciseCount = workout.exercises?.length || 0
          const hasAIFeedback = workout.aiReviewId && workout.aiReviewId.length > 0

          return (
            <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {format(new Date(workout.date), 'MMM d, yyyy')}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                    </span>
                    {hasAIFeedback && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        AI Analyzed
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{exerciseCount} exercises</span>
                    <span>{totalCalories} cal</span>
                    <span>{formatDuration(totalDuration)}</span>
                    {avgRPE > 0 && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRPEBadgeColor(avgRPE)}`}>
                        RPE {avgRPE.toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {workout.exercises.slice(0, 2).map(ex => ex.details.customExercise || ex.type).join(', ')}
                      {workout.exercises.length > 2 && ` +${workout.exercises.length - 2} more`}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={() => onEdit(workout)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit workout"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={() => onDelete(workout)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecentWorkouts
