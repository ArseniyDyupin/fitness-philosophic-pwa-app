import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Bot } from 'lucide-react'
import { useTranslations } from '../../stores/i18n.store'
import type { WorkoutExercise } from '../../types/models'
import Donut from '../charts/Donut'
import BarMini from '../charts/BarMini'

interface WorkoutAnalyticsProps {
  exercises: WorkoutExercise[]
  onRecalcEstimates: () => void
  isEstimating: boolean
}

const WorkoutAnalytics: React.FC<WorkoutAnalyticsProps> = ({
  exercises,
  onRecalcEstimates,
  isEstimating
}) => {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)

  // Prepare data for calories donut chart
  const caloriesData = exercises
    .filter(exercise => exercise.kcalEstimated && exercise.kcalEstimated > 0)
    .map((exercise, index) => {
      const name = exercise.type === 'custom' && exercise.details.customExercise
        ? exercise.details.customExercise
        : t.exerciseTypes?.[exercise.type as keyof typeof t.exerciseTypes] || exercise.type
      
      return {
        name,
        value: exercise.kcalEstimated || 0,
        color: COLORS[index % COLORS.length]
      }
    })

  // Prepare data for duration bar chart
  const durationData = exercises
    .filter(exercise => exercise.details.durationMin && exercise.details.durationMin > 0)
    .map((exercise, index) => {
      const name = exercise.type === 'custom' && exercise.details.customExercise
        ? exercise.details.customExercise
        : t.exerciseTypes?.[exercise.type as keyof typeof t.exerciseTypes] || exercise.type
      
      return {
        name,
        value: exercise.details.durationMin || 0,
        color: COLORS[index % COLORS.length]
      }
    })

  const hasCaloriesData = caloriesData.length > 0
  const hasDurationData = durationData.length > 0
  const hasAnyData = hasCaloriesData || hasDurationData

  // Calculate cardio vs strength ratio
  const getCardioStrengthRatio = () => {
    const cardioTypes = ['run']
    const strengthTypes = ['pullups', 'pushups', 'plank']
    
    const cardioCalories = caloriesData
      .filter(item => cardioTypes.some(type => item.name.toLowerCase().includes(type)))
      .reduce((sum, item) => sum + item.value, 0)
    
    const strengthCalories = caloriesData
      .filter(item => strengthTypes.some(type => item.name.toLowerCase().includes(type)))
      .reduce((sum, item) => sum + item.value, 0)
    
    const total = cardioCalories + strengthCalories
    if (total === 0) return null
    
    return {
      cardio: Math.round((cardioCalories / total) * 100),
      strength: Math.round((strengthCalories / total) * 100)
    }
  }

  const ratio = getCardioStrengthRatio()

  return (
    <div className="card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} workout analytics`}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span>{t.workoutDetailsPage?.analytics?.title || 'Workout Analytics'}</span>
        </h3>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {hasAnyData ? (
            <div className="space-y-6 mt-6">
              {/* KPI Cards */}
              {ratio && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{ratio.cardio}%</div>
                    <div className="text-sm text-blue-700">Cardio</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{ratio.strength}%</div>
                    <div className="text-sm text-orange-700">Strength</div>
                  </div>
                </div>
              )}
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calories Distribution */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    {t.workoutDetailsPage?.analytics?.caloriesSplit || 'Calories Distribution'}
                  </h4>
                  <Donut data={caloriesData} />
                </div>
                
                {/* Duration by Exercise */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    {t.workoutDetailsPage?.analytics?.durationByExercise || 'Duration by Exercise'}
                  </h4>
                  <BarMini data={durationData} />
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                {t.workoutDetailsPage?.analytics?.empty || 'Insufficient data for analytics'}
              </div>
              <div className="text-sm text-gray-600 mb-6">
                Recalculate AI estimates to see detailed analytics
              </div>
              <button
                onClick={onRecalcEstimates}
                disabled={isEstimating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                {isEstimating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span>Recalculating...</span>
                  </>
                ) : (
                  <>
                    <Bot size={16} />
                    <span>{t.workoutDetailsPage?.analytics?.ctaRecalc || 'Recalculate AI Estimates'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export default WorkoutAnalytics
