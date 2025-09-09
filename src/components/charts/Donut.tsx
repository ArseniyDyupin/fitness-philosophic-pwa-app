import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTranslations } from '../../stores/i18n.store'

interface DonutData {
  name: string
  value: number
  color: string
}

interface DonutProps {
  data: DonutData[]
  height?: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

// Custom tooltip component
const DonutTooltip: React.FC<any> = ({ active, payload }) => {
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

const Donut: React.FC<DonutProps> = ({ data, height = 200 }) => {
  const t = useTranslations()
  
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0 || total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">
            {t.workoutDetailsPage?.analytics?.empty || 'Insufficient data for analytics'}
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
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((item, index) => (
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

export default Donut
