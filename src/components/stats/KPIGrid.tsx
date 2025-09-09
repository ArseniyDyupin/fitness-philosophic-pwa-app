import React from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { Flame, Clock, TrendingUp, Calendar, Target, Activity } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { StatsKPI } from '../../types/stats'

interface KPIGridProps {
  kpi: StatsKPI
}

const KPIGrid: React.FC<KPIGridProps> = ({ kpi }) => {
  const t = useTranslations()

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getRpeColor = (rpe?: number): string => {
    if (!rpe) return 'text-gray-500'
    if (rpe <= 3) return 'text-green-600'
    if (rpe <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRpeLabel = (rpe?: number): string => {
    if (!rpe) return 'N/A'
    if (rpe <= 3) return 'Easy'
    if (rpe <= 7) return 'Moderate'
    return 'Hard'
  }

  const formatLastWorkout = (date?: string): string => {
    if (!date) return 'Never'
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const kpiItems = [
    {
      icon: Target,
      label: t.statsPage?.kpi?.workouts || 'Total Workouts',
      value: kpi.totalWorkouts.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Flame,
      label: t.statsPage?.kpi?.calories || 'Calories Burned',
      value: kpi.totalCalories.toLocaleString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Clock,
      label: t.statsPage?.kpi?.time || 'Total Time',
      value: formatTime(kpi.totalMinutes),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: TrendingUp,
      label: t.statsPage?.kpi?.avgRpe || 'Average RPE',
      value: kpi.avgRpe ? `${kpi.avgRpe} - ${getRpeLabel(kpi.avgRpe)}` : 'N/A',
      color: getRpeColor(kpi.avgRpe),
      bgColor: 'bg-gray-100'
    },
    {
      icon: Activity,
      label: t.statsPage?.kpi?.perWeek || 'Workouts/Week',
      value: kpi.workoutsPerWeek ? kpi.workoutsPerWeek.toFixed(1) : 'N/A',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Calendar,
      label: t.statsPage?.kpi?.activeDays || 'Active Days',
      value: kpi.activeDays?.toString() || '0',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bgColor} mb-3`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className={`text-2xl font-bold ${item.color} mb-1`}>
              {item.value}
            </div>
            <div className="text-sm text-gray-600">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Last Workout Info */}
      {kpi.lastWorkoutDate && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>
              {t.statsPage?.kpi?.lastWorkout || 'Last Workout'}: {formatLastWorkout(kpi.lastWorkoutDate)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default KPIGrid
