import React from 'react'
import { Bot, RefreshCw, Settings } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import { format } from 'date-fns'
import MetricCard from '@atoms/MetricCard'
import type { Workout } from '../../types/models'

interface WorkoutHeaderProps {
  workout: Workout
  totalCalories: number
  totalDuration: number
  isEstimating: boolean
  isAnalyzing: boolean
  hasKey: boolean
  isAIConfigured: boolean
  onUpdateEstimates: () => void
  onUpdateAnalysis: () => void
  onEditMeta: () => void
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  workout,
  totalCalories,
  totalDuration,
  isEstimating,
  isAnalyzing,
  hasKey,
  isAIConfigured,
  onUpdateEstimates,
  onUpdateAnalysis,
  onEditMeta
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
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        {/* Main header row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
          {/* Left side - Title and navigation */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 sm:space-x-4 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t.workoutDetailsPage?.workoutDetails || 'Workout Details'}
              </h1>
            </div>
            
            {/* Date below title */}
            <div className="text-sm text-gray-600">
              {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2">
            {/* Update Analysis (Primary) */}
            {hasKey && (
              <button
                onClick={onUpdateAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                title={t.workoutDetailsPage?.actions?.updateAnalysis || 'Update analysis'}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-700"></div>
                    <span className="text-xs sm:text-sm">{t.workoutAnalysis?.starting || 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm hidden sm:inline">{t.workoutDetailsPage?.actions?.updateAnalysis || 'Update Analysis'}</span>
                    <span className="text-xs sm:hidden">Update</span>
                  </>
                )}
              </button>
            )}
            
            {/* Recalculate AI Estimates (Secondary) */}
            {isAIConfigured && (
              <button
                onClick={onUpdateEstimates}
                disabled={isEstimating}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                title={t.workoutDetailsPage?.actions?.recalcEstimates || 'Recalculate AI estimates'}
              >
                {isEstimating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-700"></div>
                    <span className="text-xs sm:text-sm">Updating...</span>
                  </>
                ) : (
                  <>
                    <Bot size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm hidden sm:inline">{t.workoutDetailsPage?.actions?.recalcEstimates || 'Recalculate AI Estimates'}</span>
                    <span className="text-xs sm:hidden">Recalc</span>
                  </>
                )}
              </button>
            )}
            
            {/* Edit Meta (Tertiary) */}
            <button
              onClick={onEditMeta}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors touch-manipulation"
              title={t.workoutDetailsPage?.actions?.editMeta || 'Change date/duration/RPE'}
            >
              <Settings size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">{t.workoutDetailsPage?.actions?.editMeta || 'Change date/duration/RPE'}</span>
              <span className="text-xs sm:hidden">Edit</span>
            </button>
          </div>
        </div>
        
        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
              hint={workout.rpeSource === 'ai' 
                ? t.workoutDetailsPage?.metrics?.rpeSourceAI || 'Source: AI'
                : t.workoutDetailsPage?.metrics?.rpeSourceManual || 'Source: Manual'
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkoutHeader
