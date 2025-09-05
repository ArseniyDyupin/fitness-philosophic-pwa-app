import React from 'react'
import { useTranslations } from '../stores/i18n.store'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '../services/kcal'
import type { Workout, Profile } from '../types/models'

interface PlanSummaryProps {
  workout: Workout
  profile?: Profile
}

const PlanSummary: React.FC<PlanSummaryProps> = ({ workout, profile }) => {
  const t = useTranslations()

  const totalCalories = profile?.weight 
    ? calculateWorkoutCalories(workout.exercises, profile.weight, workout.rpe || 5)
    : 0
  const totalDuration = calculateWorkoutDuration(workout.exercises)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        {t.plan?.summary?.kcal || 'Summary'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.round(totalCalories)}
          </div>
          <div className="text-sm text-blue-700">
            {t.plan?.summary?.kcal || 'Total Calories'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.round(totalDuration)}
          </div>
          <div className="text-sm text-blue-700">
            {t.plan?.summary?.minutes || 'Duration (min)'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {workout.exercises.length}
          </div>
          <div className="text-sm text-blue-700">
            {t.plan?.summary?.exercises || 'Exercises'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanSummary
