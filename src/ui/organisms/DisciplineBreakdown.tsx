import React, { useState } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import type { DisciplineStats } from '@types/stats'

interface DisciplineBreakdownProps {
  discipline: DisciplineStats
}

const DisciplineBreakdown: React.FC<DisciplineBreakdownProps> = ({ discipline }) => {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)
  const [chartType, setChartType] = useState<'calories' | 'time'>('calories')

  const colors = {
    run: '#3B82F6',      // Blue
    pullups: '#10B981',  // Green
    pushups: '#F59E0B',  // Yellow
    plank: '#8B5CF6',    // Purple
    custom: '#EF4444'    // Red
  }

  const disciplineNames = {
    run: t.statsPage?.discipline?.run || 'Running',
    pullups: t.statsPage?.discipline?.pullups || 'Pull-ups',
    pushups: t.statsPage?.discipline?.pushups || 'Push-ups',
    plank: t.statsPage?.discipline?.plank || 'Plank',
    custom: t.statsPage?.discipline?.custom || 'Custom'
  }

  // Prepare data for charts
  const pieData = Object.entries(discipline).map(([key, stats]) => ({
    name: disciplineNames[key as keyof typeof disciplineNames],
    value: chartType === 'calories' ? stats.calories : stats.minutes,
    color: colors[key as keyof typeof colors],
    sessions: stats.sessions
  })).filter(item => item.value > 0)

  const barData = Object.entries(discipline).map(([key, stats]) => ({
    name: disciplineNames[key as keyof typeof disciplineNames],
    calories: Math.round(stats.calories),
    minutes: Math.round(stats.minutes),
    sessions: stats.sessions
  })).filter(item => item.calories > 0 || item.minutes > 0)

  const totalCalories = Object.values(discipline).reduce((sum, stats) => sum + stats.calories, 0)
  const totalMinutes = Object.values(discipline).reduce((sum, stats) => sum + stats.minutes, 0)
  const totalValue = chartType === 'calories' ? totalCalories : totalMinutes

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalValue) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {chartType === 'calories' ? (t.statsPage?.chart?.calories || 'Calories') : (t.statsPage?.chart?.minutes || 'Minutes')}: {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">{percentage}{t.statsPage?.chart?.ofTotal || '% of total'}</p>
          <p className="text-sm text-gray-500">{t.statsPage?.chart?.sessions || 'Sessions:'} {data.sessions}</p>
        </div>
      )
    }
    return null
  }

  if (pieData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t.statsPage?.discipline?.title || 'Discipline Breakdown'}
        </h2>
        <div className="text-center py-8 text-gray-500">
          {t.statsPage?.chart?.noData || 'No workout data available for this period'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t.statsPage?.discipline?.title || 'Discipline Breakdown'}
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
          aria-label={isExpanded ? (t.statsPage?.chart?.collapse || 'Collapse') : (t.statsPage?.chart?.expand || 'Expand')}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Chart Type Selector */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('calories')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartType === 'calories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.statsPage?.chart?.calories || 'Calories'}
          </button>
          <button
            onClick={() => setChartType('time')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartType === 'time'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.statsPage?.chart?.time || 'Time'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartType === 'calories' ? (
                  <Bar dataKey="calories" fill="#3B82F6" name={t.statsPage?.chart?.calories || 'Calories'} />
                ) : (
                  <Bar dataKey="minutes" fill="#10B981" name={t.statsPage?.chart?.minutes || 'Minutes'} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {Object.entries(discipline).map(([key, stats]) => {
          if (stats.sessions === 0) return null
          
          return (
            <div key={key} className="text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: colors[key as keyof typeof colors] }}
              />
              <div className="text-sm font-medium text-gray-900">
                {disciplineNames[key as keyof typeof disciplineNames]}
              </div>
              <div className="text-xs text-gray-600">
                {stats.sessions} {t.statsPage?.chart?.sessionsCount || 'sessions'}
              </div>
              <div className="text-xs text-gray-500">
                {chartType === 'calories' 
                  ? `${Math.round(stats.calories)} ${t.statsPage?.chart?.kcal || 'kcal'}`
                  : `${Math.round(stats.minutes)} ${t.statsPage?.chart?.minutes || 'min'}`
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DisciplineBreakdown
