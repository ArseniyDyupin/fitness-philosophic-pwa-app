import React, { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import type { Workout } from '@/types/models'
import WeeklyActivityChart from '@organisms/shared/WeeklyActivityChart'
import { calculateWorkoutCalories } from '@services/fitness'

export interface WeekSummaryProps {
  workouts: Workout[]
  weekStart: Date
  previousWeekWorkouts?: Workout[]
}

const WeekSummary: React.FC<WeekSummaryProps> = ({
  workouts,
  weekStart,
  previousWeekWorkouts = []
}) => {
  const t = useTranslations()
  const { profile } = useProfileStore()
  const [isExpanded, setIsExpanded] = useState(true)

  const totalCalories = workouts.reduce((sum, workout) => {
    return sum + calculateWorkoutCalories(workout.exercises, profile?.weight || 70, workout.rpe)
  }, 0)

  const totalDuration = workouts.reduce((sum, workout) => {
    return sum + (workout.durationOverrideMin || workout.exercises.reduce((exSum, exercise) => {
      return exSum + (exercise.details.durationMin || 0)
    }, 0))
  }, 0)


  const avgRpe = workouts.length > 0 
    ? workouts.reduce((sum, workout) => sum + (workout.rpe || 0), 0) / workouts.length 
    : 0

  const prevTotalCalories = previousWeekWorkouts.reduce((sum, workout) => {
    return sum + calculateWorkoutCalories(workout.exercises, profile?.weight || 70, workout.rpe)
  }, 0)

  const prevTotalDuration = previousWeekWorkouts.reduce((sum, workout) => {
    return sum + (workout.durationOverrideMin || workout.exercises.reduce((exSum, exercise) => {
      return exSum + (exercise.details.durationMin || 0)
    }, 0))
  }, 0)

  const prevAvgRpe = previousWeekWorkouts.length > 0 
    ? previousWeekWorkouts.reduce((sum, workout) => sum + (workout.rpe || 0), 0) / previousWeekWorkouts.length 
    : 0

  // Calculate differences
  const caloriesDiff = totalCalories - prevTotalCalories
  const durationDiff = totalDuration - prevTotalDuration
  const rpeDiff = avgRpe - prevAvgRpe

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-3 h-3 text-green-500" />
    if (diff < 0) return <TrendingDown className="w-3 h-3 text-red-500" />
    return null
  }

  const getTrendColor = (diff: number) => {
    if (diff > 0) return 'text-green-600'
    if (diff < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatTrend = (diff: number, unit: string) => {
    if (diff === 0) return ''
    const sign = diff > 0 ? '+' : ''
    return `${sign}${Math.round(diff)}${unit}`
  }

  // Goal progress
  const goalFrequency = profile?.frequency || 0
  const goalProgress = goalFrequency > 0 ? (workouts.length / goalFrequency) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t.workoutsPage?.summary?.title || 'Week Summary'}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
          aria-label={isExpanded ? t.workoutsPage?.summary?.collapseSummary || 'Collapse summary' : t.workoutsPage?.summary?.expandSummary || 'Expand summary'}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Workouts Count */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {workouts.length}
              </div>
              <div className="text-sm text-gray-600">
                {t.workoutsPage?.summary?.workouts || 'Workouts'}
              </div>
            </div>

            {/* Total Calories */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1 flex items-center justify-center space-x-1">
                <span>{Math.round(totalCalories)}</span>
                {getTrendIcon(caloriesDiff)}
              </div>
              <div className="text-sm text-gray-600">
                {t.workoutsPage?.summary?.calories || 'Calories'}
              </div>
              {caloriesDiff !== 0 && (
                <div className={`text-xs ${getTrendColor(caloriesDiff)}`}>
                  {formatTrend(caloriesDiff, '')}
                </div>
              )}
            </div>

            {/* Total Duration */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center space-x-1">
                <span>{Math.round(totalDuration)}</span>
                {getTrendIcon(durationDiff)}
              </div>
              <div className="text-sm text-gray-600">
                {t.workoutsPage?.summary?.duration || 'Duration (min)'}
              </div>
              {durationDiff !== 0 && (
                <div className={`text-xs ${getTrendColor(durationDiff)}`}>
                  {formatTrend(durationDiff, t.workoutsPage?.summary?.min || 'min')}
                </div>
              )}
            </div>

            {/* Average RPE */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1 flex items-center justify-center space-x-1">
                <span>{avgRpe > 0 ? avgRpe.toFixed(1) : '—'}</span>
                {avgRpe > 0 && getTrendIcon(rpeDiff)}
              </div>
              <div className="text-sm text-gray-600">
                {t.workoutsPage?.summary?.avgRpe || 'Avg RPE'}
              </div>
              {avgRpe > 0 && rpeDiff !== 0 && (
                <div className={`text-xs ${getTrendColor(rpeDiff)}`}>
                  {formatTrend(rpeDiff, '')}
                </div>
              )}
            </div>
          </div>

          {/* Goal Progress */}
          {goalFrequency > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {t.workoutsPage?.summary?.goalProgress?.replace('{{done}}', workouts.length.toString()).replace('{{goal}}', goalFrequency.toString()) || `${workouts.length} / ${goalFrequency} workouts`}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(goalProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
            </div>
          )}
          {workouts.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t.workoutsPage?.summary?.weeklyActivity || 'Weekly Activity'}
              </h4>
              <WeeklyActivityChart workouts={workouts} weekStart={weekStart} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WeekSummary
