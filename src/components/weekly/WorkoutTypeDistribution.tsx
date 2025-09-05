import React from 'react'
import { WeekStats } from '../../services/stats.week'
import { useTranslations } from '../../stores/i18n.store'

interface WorkoutTypeDistributionProps {
  stats: WeekStats
}

const WorkoutTypeDistribution: React.FC<WorkoutTypeDistributionProps> = ({ stats }) => {
  const t = useTranslations()

  const exerciseTypes = [
    {
      key: 'run' as const,
      label: t.weeklyPage?.types?.run || 'Run',
      color: 'bg-blue-500',
      sessions: stats.volume.run.sessions,
      metric: stats.volume.run.distanceKm > 0 ? `${stats.volume.run.distanceKm.toFixed(1)} km` : '0 km'
    },
    {
      key: 'pullups' as const,
      label: t.weeklyPage?.types?.pullups || 'Pull-ups',
      color: 'bg-green-500',
      sessions: stats.volume.pullups.sessions,
      metric: `${stats.volume.pullups.reps} reps`
    },
    {
      key: 'pushups' as const,
      label: t.weeklyPage?.types?.pushups || 'Push-ups',
      color: 'bg-orange-500',
      sessions: stats.volume.pushups.sessions,
      metric: `${stats.volume.pushups.reps} reps`
    },
    {
      key: 'plank' as const,
      label: t.weeklyPage?.types?.plank || 'Plank',
      color: 'bg-purple-500',
      sessions: stats.volume.plank.sessions,
      metric: `${Math.round(stats.volume.plank.seconds / 60)} min`
    },
    {
      key: 'custom' as const,
      label: t.weeklyPage?.types?.custom || 'Custom',
      color: 'bg-gray-500',
      sessions: stats.volume.custom.sessions,
      metric: `${stats.volume.custom.sessions} sessions`
    }
  ]

  const totalSessions = exerciseTypes.reduce((sum, type) => sum + type.sessions, 0)

  if (totalSessions === 0) {
    return (
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t.weeklyPage?.typesChart || 'Exercise Types Distribution'}
        </h3>
        <div className="text-center py-8 text-gray-500">
          {t.weeklyPage?.noData || 'No workout data for this week'}
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.weeklyPage?.typesChart || 'Exercise Types Distribution'}
      </h3>
      
      <div className="space-y-3">
        {exerciseTypes
          .filter(type => type.sessions > 0)
          .map((type) => {
            const percentage = (type.sessions / totalSessions) * 100
            
            return (
              <div key={type.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${type.color}`}></div>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{type.sessions} sessions</div>
                    <div className="text-xs text-gray-500">{type.metric}</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${type.color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 text-right">
                  {percentage.toFixed(1)}% of total sessions
                </div>
              </div>
            )
          })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t.weeklyPage?.totalSessions || 'Total Sessions'}:</span>
          <span className="font-semibold text-gray-900">{totalSessions}</span>
        </div>
      </div>
    </div>
  )
}

export default WorkoutTypeDistribution
