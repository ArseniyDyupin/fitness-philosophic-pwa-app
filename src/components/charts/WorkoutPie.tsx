import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useTranslations } from '../../stores/i18n.store'
import { WorkoutExercise } from '../../types/models'

interface WorkoutPieProps {
  exercises: WorkoutExercise[]
}

interface PieData {
  name: string
  value: number
  color: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

// Custom tooltip component
const PieTooltip: React.FC<any> = ({ active, payload }) => {
  const t = useTranslations()
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = payload[0].payload.total || 0
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0'
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {data.name}
        </div>
        <div className="text-sm text-gray-600">
          {data.value} kcal ({percentage}%)
        </div>
      </div>
    )
  }
  
  return null
}

const WorkoutPie: React.FC<WorkoutPieProps> = ({ exercises }) => {
  const t = useTranslations()
  
  // Prepare data for pie chart
  const pieData: PieData[] = exercises
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

  const totalCalories = pieData.reduce((sum, item) => sum + item.value, 0)

  if (pieData.length === 0) {
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
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {pieData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-600 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WorkoutPie
