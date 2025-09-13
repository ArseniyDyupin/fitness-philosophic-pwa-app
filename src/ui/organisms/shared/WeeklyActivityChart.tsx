import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { WorkoutExercise, Workout } from '@/types/models'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { getWorkoutTotalDuration } from '@services/fitness'

interface WeeklyActivityChartProps {
  workouts: Workout[]
  weekStart?: Date
}

interface DayData {
  date: string
  durationMinTotal: number
  workouts: number
  details: Array<{
    id: string
    rpe?: number
    kcal: number
    durationMin: number
    exercisesShort: string
  }>
}

// Helper function to create exercise summary
const createExerciseSummary = (exercises: WorkoutExercise[]): string => {
  const summaries = exercises.map(ex => {
    switch (ex.type) {
      case 'run':
        return ex.details.distanceKm ? `${ex.details.distanceKm}км бег` : 'Бег'
      case 'pullups':
        return ex.details.repsPerSet ? `${ex.details.repsPerSet.reduce((a, b) => a + b, 0)} подтягиваний` : 'Подтягивания'
      case 'pushups':
        return ex.details.repsPerSet ? `${ex.details.repsPerSet.reduce((a, b) => a + b, 0)} отжиманий` : 'Отжимания'
      case 'plank':
        return ex.details.seconds ? `${Math.round(Array.isArray(ex.details.seconds) ? ex.details.seconds.reduce((a, b) => a + b, 0) / 60 : ex.details.seconds / 60)}мин планка` : 'Планка'
      case 'custom':
        return ex.details.customExercise || 'Свое упражнение'
      default:
        return 'Упражнение'
    }
  })
  return summaries.slice(0, 2).join(', ') + (summaries.length > 2 ? '...' : '')
}

// Custom tooltip component
const WeeklyTooltip: React.FC<any> = ({ active, payload, label }) => {
  const t = useTranslations()
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const date = new Date(label)
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-sm">
        <div className="text-sm font-semibold text-gray-900 mb-2">
          {format(date, 'EEEE, MMMM d')}
        </div>
        
        <div className="space-y-1 text-sm mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>{t.weeklyPage?.tooltip?.minutesTotal || 'Total Minutes'}: {Math.round(data.durationMinTotal)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>{t.weeklyPage?.tooltip?.workoutsCount || 'Workouts'}: {data.workouts}</span>
          </div>
        </div>
        
        {data.details && data.details.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">
              {t.weeklyPage?.tooltip?.workout || 'Workout Details'}:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.details.slice(0, 4).map((detail: any, index: number) => (
                <div key={index} className="text-xs text-gray-600">
                  <div className="font-medium">
                    {detail.rpe ? `RPE ${detail.rpe}` : ''} • {Math.round(detail.durationMin)} мин • {Math.round(detail.kcal)} kcal
                  </div>
                  <div className="text-gray-500 truncate">
                    {detail.exercisesShort.length > 50 
                      ? detail.exercisesShort.substring(0, 50) + '...' 
                      : detail.exercisesShort}
                  </div>
                </div>
              ))}
              {data.details.length > 4 && (
                <div className="text-xs text-gray-400 italic">
                  +{data.details.length - 4} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  return null
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ workouts, weekStart }) => {
  const t = useTranslations()
  const [chartData, setChartData] = useState<DayData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (workouts && weekStart) {
      processChartData()
    }
  }, [workouts, weekStart])

  const processChartData = () => {
    if (!weekStart || !workouts) return
    
    setIsProcessing(true)
    try {
      const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 })
      const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 })
      
      // Get workouts for the week
      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date)
        return workoutDate >= weekStartDate && workoutDate <= weekEndDate
      })

      // Create day data
      const days = eachDayOfInterval({ start: weekStartDate, end: weekEndDate })
      const dayData: DayData[] = days.map(day => {
        const dateStr = day.toISOString().split('T')[0]
        const dayWorkouts = weekWorkouts.filter(w => {
          return w.date.split('T')[0] === dateStr
        })
        
        // Filter only completed workouts
        const completedWorkouts = dayWorkouts.filter(w => (w.status || 'completed') === 'completed')
        
        // Calculate total duration
        const durationMinTotal = completedWorkouts.reduce((total, workout) => {
          return total + getWorkoutTotalDuration(workout)
        }, 0)

        // Create details for tooltip
        const details = completedWorkouts.map(workout => ({
          id: workout.id,
          rpe: workout.rpe,
          kcal: workout.exercises.reduce((sum, exercise) => sum + (exercise.kcalEstimated || 0), 0),
          durationMin: getWorkoutTotalDuration(workout),
          exercisesShort: createExerciseSummary(workout.exercises)
        }))
        
        return {
          date: dateStr,
          durationMinTotal: Math.round(durationMinTotal),
          workouts: completedWorkouts.length,
          details
        }
      })

      setChartData(dayData)
    } catch (error) {
    } finally {
      setIsProcessing(false)
    }
  }

  const maxValue = Math.max(
    ...chartData.map(day => day.durationMinTotal)
  )

  // Check if there's any data to display
  const hasData = chartData.some(day => day.workouts > 0 || day.durationMinTotal > 0)
  const isLoading = isProcessing
  
  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.weeklyPage?.charts?.activity || 'Activity by Day'}
      </h3>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">
              {t.weeklyPage?.processing || 'Processing chart data...'}
            </span>
          </div>
        ) : hasData ? (
          <>
            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    domain={[0, Math.max(maxValue * 1.1, 10)]} // Ensure minimum domain for visibility
                    label={{ value: t.weeklyPage?.charts?.duration || 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<WeeklyTooltip />} />
                  <Legend />
                  
                  {/* Workout duration */}
                  <Bar 
                    dataKey="durationMinTotal" 
                    name={t.weeklyPage?.charts?.duration || 'Duration (min)'}
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-medium mb-2">
                {t.weeklyPage?.noData || 'No workout data for this week'}
              </div>
              <div className="text-sm">
                {t.weeklyPage?.addWorkout || 'Add some workouts to see your activity chart'}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
          <div>
            <span className="font-medium">{t.weeklyPage?.totalWorkouts || 'Total Workouts'}: </span>
            {chartData.reduce((sum, day) => sum + day.workouts, 0)}
          </div>
          <div>
            <span className="font-medium">{t.weeklyPage?.charts?.duration || 'Total Duration'}: </span>
            <span className="text-blue-600">
              {Math.round(chartData.reduce((sum, day) => sum + day.durationMinTotal, 0))} мин
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyActivityChart
