import React from 'react'
import { WeekStats } from '../../services/stats.week'
import { useTranslations } from '../../stores/i18n.store'
import { Trophy, Clock, MapPin, Target, Zap } from 'lucide-react'

interface WeeklyPRsProps {
  stats: WeekStats
}

const WeeklyPRs: React.FC<WeeklyPRsProps> = ({ stats }) => {
  const t = useTranslations()

  const prs = [
    {
      key: 'longestRunKm',
      title: t.weeklyPage?.prs?.longestRun || 'Longest Run',
      value: stats.prs.longestRunKm,
      unit: 'km',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'fastestRunPaceMinPerKm',
      title: t.weeklyPage?.prs?.fastestPace || 'Fastest Pace',
      value: stats.prs.fastestRunPaceMinPerKm,
      unit: 'min/km',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      format: (val: number) => `${Math.floor(val)}:${((val % 1) * 60).toFixed(0).padStart(2, '0')}`
    },
    {
      key: 'maxPullupsTotalReps',
      title: t.weeklyPage?.prs?.maxPullups || 'Max Pull-ups',
      value: stats.prs.maxPullupsTotalReps,
      unit: 'reps',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      key: 'maxPushupsTotalReps',
      title: t.weeklyPage?.prs?.maxPushups || 'Max Push-ups',
      value: stats.prs.maxPushupsTotalReps,
      unit: 'reps',
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      key: 'longestPlankSec',
      title: t.weeklyPage?.prs?.longestPlank || 'Longest Plank',
      value: stats.prs.longestPlankSec,
      unit: 'sec',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      format: (val: number) => `${Math.round(val)}`
    }
  ]

  const validPRs = prs.filter(pr => pr.value !== undefined && pr.value > 0)

  if (validPRs.length === 0) {
    return (
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t.weeklyPage?.prs?.title || 'Personal Records'}
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>{t.weeklyPage?.prs?.noRecords || 'No personal records this week'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.weeklyPage?.prs?.title || 'Personal Records'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validPRs.map((pr) => (
          <div key={pr.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className={`p-3 rounded-lg ${pr.bgColor}`}>
              <pr.icon className={`h-6 w-6 ${pr.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{pr.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {pr.format ? pr.format(pr.value!) : pr.value}
                <span className="text-sm font-normal text-gray-500 ml-1">{pr.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyPRs
