import React from 'react'
import { WeekStats } from '../../services/stats.week'
import { useTranslations } from '../../stores/i18n.store'
import { format } from 'date-fns'

interface WeeklyActivityChartProps {
  stats: WeekStats
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ stats }) => {
  const t = useTranslations()

  const maxValue = Math.max(
    ...stats.days.map(day => Math.max(day.workoutKcal, day.foodKcal))
  )

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0
    return Math.max((value / maxValue) * 100, 2) // Minimum 2% height for visibility
  }

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.weeklyPage?.activityChart || 'Activity by Day'}
      </h3>
      
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">{t.weeklyPage?.workoutCalories || 'Workout Calories'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">{t.weeklyPage?.foodCalories || 'Food Calories'}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex items-end justify-between space-x-2 h-48">
          {stats.days.map((day, index) => {
            const date = new Date(day.date)
            const workoutHeight = getBarHeight(day.workoutKcal)
            const foodHeight = getBarHeight(day.foodKcal)
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                {/* Bars */}
                <div className="w-full flex flex-col justify-end h-32 space-y-1">
                  {/* Food calories bar */}
                  {foodHeight > 0 && (
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${foodHeight}%` }}
                      title={`${t.weeklyPage?.foodCalories || 'Food'}: ${Math.round(day.foodKcal)} kcal`}
                    />
                  )}
                  
                  {/* Workout calories bar */}
                  {workoutHeight > 0 && (
                    <div
                      className="w-full bg-blue-500 rounded-b"
                      style={{ height: `${workoutHeight}%` }}
                      title={`${t.weeklyPage?.workoutCalories || 'Workout'}: ${Math.round(day.workoutKcal)} kcal`}
                    />
                  )}
                </div>

                {/* Day label */}
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-medium">{format(date, 'EEE')}</div>
                  <div className="text-gray-500">{format(date, 'd')}</div>
                  {day.workouts > 0 && (
                    <div className="text-blue-600 font-medium">●</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
          <div>
            <span className="font-medium">{t.weeklyPage?.totalWorkouts || 'Total Workouts'}: </span>
            {stats.workoutsCount}
          </div>
          <div>
            <span className="font-medium">{t.weeklyPage?.balance || 'Balance'}: </span>
            <span className={stats.weeklyBalance >= 0 ? 'text-red-600' : 'text-blue-600'}>
              {Math.round(stats.weeklyBalance)} kcal
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyActivityChart
