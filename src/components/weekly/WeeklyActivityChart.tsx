import React from 'react'
import { WeekStats } from '../../services/stats.week'
import { useTranslations } from '../../stores/i18n.store'
import { format } from 'date-fns'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

interface WeeklyActivityChartProps {
  stats: WeekStats
}

// Custom tooltip component
const WeeklyTooltip: React.FC<any> = ({ active, payload, label }) => {
  const t = useTranslations()
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const date = new Date(label)
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-2">
          {format(date, 'EEEE, MMMM d')}
        </div>
        
        <div className="space-y-1 text-sm">
          {data.workoutKcal > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>{t.weeklyPage?.charts?.completed || 'Workout Calories'}: {Math.round(data.workoutKcal)} kcal</span>
            </div>
          )}
          
          {data.plannedKcal > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-300 rounded"></div>
              <span>{t.weeklyPage?.charts?.planned || 'Planned'}: {Math.round(data.plannedKcal)} kcal</span>
            </div>
          )}
          
          {data.foodKcal > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>{t.weeklyPage?.foodCalories || 'Food Calories'}: {Math.round(data.foodKcal)} kcal</span>
            </div>
          )}
        </div>
        
        {data.items && data.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">
              {t.weeklyPage?.tooltip?.workouts || 'Workouts'}:
            </div>
            <div className="space-y-1">
              {data.items.map((item: any, index: number) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    item.status === 'completed' ? 'bg-blue-500' : 
                    item.status === 'planned' ? 'bg-blue-300' : 'bg-gray-400'
                  }`}></span>
                  {item.exercisesShort} ({Math.round(item.kcal)} kcal)
                  {item.rpe && ` • RPE ${item.rpe}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  return null
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ stats }) => {
  const t = useTranslations()

  // Prepare data for recharts
  const chartData = stats.days.map(day => ({
    date: day.date,
    workoutKcal: Math.round(day.workoutKcal),
    plannedKcal: Math.round(day.plannedKcal),
    foodKcal: Math.round(day.foodKcal),
    items: day.items
  }))

  const maxValue = Math.max(
    ...stats.days.map(day => Math.max(day.workoutKcal + day.plannedKcal, day.foodKcal))
  )

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.weeklyPage?.charts?.activity || 'Activity by Day'}
      </h3>
      
      <div className="space-y-4">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return format(date, 'EEE d')
                }}
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                domain={[0, maxValue * 1.1]}
              />
              <Tooltip content={<WeeklyTooltip />} />
              <Legend />
              
              {/* Completed workout calories */}
              <Bar 
                dataKey="workoutKcal" 
                name={t.weeklyPage?.charts?.completed || 'Workout Calories'}
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]}
              />
              
              {/* Planned workout calories */}
              <Bar 
                dataKey="plannedKcal" 
                name={t.weeklyPage?.charts?.planned || 'Planned (AI)'}
                fill="#93c5fd" 
                fillOpacity={0.7}
                radius={[2, 2, 0, 0]}
              />
              
              {/* Food calories as line */}
              <Line 
                type="monotone" 
                dataKey="foodKcal" 
                name={t.weeklyPage?.foodCalories || 'Food Calories'}
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
          <div>
            <span className="font-medium">{t.weeklyPage?.totalWorkouts || 'Total Workouts'}: </span>
            {stats.workoutsCount}
            {stats.days.reduce((sum, day) => sum + day.planned, 0) > 0 && (
              <span className="text-blue-400 ml-2">
                (+{stats.days.reduce((sum, day) => sum + day.planned, 0)} {t.weeklyPage?.charts?.planned || 'planned'})
              </span>
            )}
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
