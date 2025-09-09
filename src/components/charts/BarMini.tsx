import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslations } from '../../stores/i18n.store'

interface BarData {
  name: string
  value: number
  color: string
}

interface BarMiniProps {
  data: BarData[]
  height?: number
  unit?: string
}

// Custom tooltip component
const BarTooltip: React.FC<any> = ({ active, payload, label }) => {
  const t = useTranslations()
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = payload[0].payload.total || 0
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0'
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {label}
        </div>
        <div className="text-sm text-gray-600">
          {data.value} {t.workoutDetailsPage?.exercise?.min || 'min'} ({percentage}%)
        </div>
      </div>
    )
  }
  
  return null
}

const BarMini: React.FC<BarMiniProps> = ({ data, height = 200, unit = 'min' }) => {
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
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            label={{ value: t.workoutDetailsPage?.exercise?.min || 'Minutes', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<BarTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarMini
