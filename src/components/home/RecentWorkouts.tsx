import React from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import type { Workout } from '../../types/models'
import WorkoutCard from '../workout/WorkoutCard'

interface RecentWorkoutsProps {
  workouts: Workout[]
  isLoading?: boolean
  userWeight?: number
  onEdit?: (workout: Workout) => void
  onDelete?: (workout: Workout) => void
}

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({
  workouts,
  isLoading = false,
  userWeight = 70,
  onEdit,
  onDelete
}) => {
  const t = useTranslations()
  const navigate = useNavigate()

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
        {workouts.slice(0, 5).map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            userWeight={userWeight}
            onClick={() => navigate(`/workouts/${workout.id}`)}
            onEdit={onEdit ? () => onEdit(workout) : undefined}
            onDelete={onDelete ? () => onDelete(workout) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default RecentWorkouts
