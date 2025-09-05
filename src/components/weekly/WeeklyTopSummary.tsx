import React from 'react'
import { WeekStats } from '../../services/stats.week'
import { useTranslations } from '../../stores/i18n.store'
import { TrendingUp, TrendingDown, Flame, Activity, Target, Zap } from 'lucide-react'

interface WeeklyTopSummaryProps {
  stats: WeekStats
  deltas?: any
}

const WeeklyTopSummary: React.FC<WeeklyTopSummaryProps> = ({ stats, deltas }) => {
  const t = useTranslations()

  const formatDelta = (value: number | undefined) => {
    if (value === undefined || value === 0) return null
    const isPositive = value > 0
    const icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50'
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
        {React.createElement(icon, { size: 12, className: 'mr-1' })}
        {isPositive ? '+' : ''}{value}
      </div>
    )
  }

  const summaryCards = [
    {
      title: t.weeklyPage?.workoutsCount || 'Workouts',
      value: stats.workoutsCount,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delta: deltas?.workoutsCount
    },
    {
      title: t.weeklyPage?.workoutCalories || 'Workout Calories',
      value: `${Math.round(stats.workoutKcalTotal)}`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      delta: deltas?.workoutKcalTotal
    },
    {
      title: t.weeklyPage?.foodCalories || 'Food Calories',
      value: `${Math.round(stats.foodKcalTotal)}`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delta: deltas?.foodKcalTotal
    },
    {
      title: t.weeklyPage?.weeklyBalance || 'Weekly Balance',
      value: `${Math.round(stats.weeklyBalance)}`,
      icon: stats.weeklyBalance >= 0 ? TrendingUp : TrendingDown,
      color: stats.weeklyBalance >= 0 ? 'text-red-600' : 'text-blue-600',
      bgColor: stats.weeklyBalance >= 0 ? 'bg-red-50' : 'bg-blue-50',
      delta: deltas?.weeklyBalance
    },
    {
      title: t.weeklyPage?.avgRpe || 'Avg RPE',
      value: stats.avgRPE ? `${stats.avgRPE.toFixed(1)}` : 'N/A',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      delta: deltas?.avgRPE
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {summaryCards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            {formatDelta(card.delta)}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-600 mt-1">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WeeklyTopSummary
