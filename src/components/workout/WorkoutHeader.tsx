import React from 'react'
import { Edit, Bot, RefreshCw, ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import { useTranslations } from '../../stores/i18n.store'
import { format } from 'date-fns'
import MetricCard from './MetricCard'
import type { Workout } from '../../types/models'

interface WorkoutHeaderProps {
  workout: Workout
  totalCalories: number
  totalDuration: number
  isEditing: boolean
  isEstimating: boolean
  isAnalyzing: boolean
  hasKey: boolean
  isAIConfigured: boolean
  onEdit: () => void
  onUpdateEstimates: () => void
  onUpdateAnalysis: () => void
  onNavigateToWeek?: () => void
  onPreviousWorkout?: () => void
  onNextWorkout?: () => void
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  workout,
  totalCalories,
  totalDuration,
  isEditing,
  isEstimating,
  isAnalyzing,
  hasKey,
  isAIConfigured,
  onEdit,
  onUpdateEstimates,
  onUpdateAnalysis,
  onNavigateToWeek,
  onPreviousWorkout,
  onNextWorkout
}) => {
  const t = useTranslations()

  const getRpeColor = (rpe: number): 'green' | 'yellow' | 'red' => {
    if (rpe <= 3) return 'green'
    if (rpe <= 7) return 'yellow'
    return 'red'
  }

  const getRpeLabel = (rpe: number) => {
    if (rpe <= 3) return t.workoutForm?.easy || 'Easy'
    if (rpe <= 7) return t.workoutForm?.moderate || 'Moderate'
    return t.workoutForm?.hard || 'Hard'
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main header row */}
        <div className="flex justify-between items-start mb-4">
          {/* Left side - Date and navigation */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
              </h1>
              
              {/* Navigation arrows */}
              <div className="flex items-center space-x-2">
                {onPreviousWorkout && (
                  <button
                    onClick={onPreviousWorkout}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={t.workoutDetailsPage?.actions?.prev || 'Previous workout'}
                    aria-label={t.workoutDetailsPage?.actions?.prev || 'Previous workout'}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                {onNextWorkout && (
                  <button
                    onClick={onNextWorkout}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={t.workoutDetailsPage?.actions?.next || 'Next workout'}
                    aria-label={t.workoutDetailsPage?.actions?.next || 'Next workout'}
                  >
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Link to week */}
            {onNavigateToWeek && (
              <button
                onClick={onNavigateToWeek}
                className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Calendar size={14} />
                <span>{t.workoutDetailsPage?.actions?.toWeek || 'To Week'}</span>
              </button>
            )}
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Update Analysis (Primary) */}
            {hasKey && (
              <button
                onClick={onUpdateAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.workoutDetailsPage?.actions?.updateAnalysis || 'Update analysis'}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></div>
                    <span className="text-sm">{t.workoutAnalysis?.starting || 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span className="text-sm">{t.workoutDetailsPage?.actions?.updateAnalysis || 'Update Analysis'}</span>
                  </>
                )}
              </button>
            )}
            
            {/* Recalculate AI Estimates (Secondary) */}
            {isAIConfigured && (
              <button
                onClick={onUpdateEstimates}
                disabled={isEstimating}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.workoutDetailsPage?.actions?.recalcEstimates || 'Recalculate AI estimates'}
              >
                {isEstimating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span className="text-sm">Updating...</span>
                  </>
                ) : (
                  <>
                    <Bot size={16} />
                    <span className="text-sm">{t.workoutDetailsPage?.actions?.recalcEstimates || 'Recalculate AI Estimates'}</span>
                  </>
                )}
              </button>
            )}
            
            {/* Edit Workout (Tertiary) */}
            {!isEditing && (
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                title={t.workoutDetailsPage?.actions?.editWorkout || 'Edit workout'}
              >
                <Edit size={16} />
                <span className="text-sm">{t.workoutDetailsPage?.actions?.editWorkout || 'Edit Workout'}</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            value={totalCalories}
            label={t.workoutDetailsPage?.metrics?.calories || 'Total Calories'}
            color="blue"
          />
          <MetricCard
            value={Math.round(totalDuration)}
            label={t.workoutDetailsPage?.metrics?.duration || 'Duration (minutes)'}
            color="green"
          />
          <MetricCard
            value={workout.exercises.length}
            label={t.workoutDetailsPage?.metrics?.exercises || 'Exercises'}
            color="purple"
          />
          {workout.rpe && (
            <MetricCard
              value={`${workout.rpe} - ${getRpeLabel(workout.rpe)}`}
              label={t.workoutDetailsPage?.metrics?.rpe || 'RPE (1–10)'}
              color={getRpeColor(workout.rpe)}
              hint={t.workoutDetailsPage?.rpeHint || 'RPE — subjective intensity rating (1–10)'}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkoutHeader
