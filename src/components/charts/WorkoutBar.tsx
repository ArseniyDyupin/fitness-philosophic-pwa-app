import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslations } from '../../stores/i18n.store'
import { WorkoutExercise } from '../../types/models'

interface WorkoutBarProps {
  exercises: WorkoutExercise[]
}

interface BarData {
  name: string
  duration: number
  color: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

// Custom tooltip component
const BarTooltip: React.FC<any> = ({ active, payload, label }) => {
  const t = useTranslations()
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = payload[0].payload.total || 0
    const percentage = total > 0 ? ((data.duration / total) * 100).toFixed(1) : '0'
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {label}
        </div>
        <div className="text-sm text-gray-600">
          {data.duration} {t.workoutDetailsPage?.minutes || 'minutes'} ({percentage}%)
        </div>
      </div>
    )
  }
  
  return null
}

const WorkoutBar: React.FC<WorkoutBarProps> = ({ exercises }) => {
  const t = useTranslations()
  
  // Prepare data for bar chart
  const barData: BarData[] = exercises
    .filter(exercise => exercise.details.durationMin && exercise.details.durationMin > 0)
    .map((exercise, index) => {
      const name = exercise.type === 'custom' && exercise.details.customExercise
        ? exercise.details.customExercise
        : t.exerciseTypes?.[exercise.type as keyof typeof t.exerciseTypes] || exercise.type
      
      return {
        name,
        duration: exercise.details.durationMin || 0,
        color: COLORS[index % COLORS.length]
      }
    })

  const totalDuration = barData.reduce((sum, item) => sum + item.duration, 0)

  if (barData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">
            {t.workoutDetailsPage?.noAnalytics || 'Insufficient data for analytics'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#666"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            label={{ value: t.workoutDetailsPage?.minutes || 'Minutes', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<BarTooltip />} />
          <Bar 
            dataKey="duration" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WorkoutBar
