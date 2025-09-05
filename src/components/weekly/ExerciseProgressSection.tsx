import React from 'react'
import { WeekStats } from '../../services/stats.week'
import { useTranslations } from '../../stores/i18n.store'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ExerciseProgressSectionProps {
  stats: WeekStats
  deltas?: Partial<Record<keyof WeekStats['volume'], any>>
}

const ExerciseProgressSection: React.FC<ExerciseProgressSectionProps> = ({ stats, deltas }) => {
  const t = useTranslations()

  const exercises = [
    {
      key: 'run' as const,
      title: t.weeklyPage?.types?.run || 'Run',
      icon: '🏃',
      current: {
        distance: stats.volume.run.distanceKm,
        duration: stats.volume.run.durationMin,
        sessions: stats.volume.run.sessions
      },
      delta: deltas?.run
    },
    {
      key: 'pullups' as const,
      title: t.weeklyPage?.types?.pullups || 'Pull-ups',
      icon: '💪',
      current: {
        reps: stats.volume.pullups.reps,
        sets: stats.volume.pullups.sets,
        sessions: stats.volume.pullups.sessions
      },
      delta: deltas?.pullups
    },
    {
      key: 'pushups' as const,
      title: t.weeklyPage?.types?.pushups || 'Push-ups',
      icon: '🤸',
      current: {
        reps: stats.volume.pushups.reps,
        sets: stats.volume.pushups.sets,
        sessions: stats.volume.pushups.sessions
      },
      delta: deltas?.pushups
    },
    {
      key: 'plank' as const,
      title: t.weeklyPage?.types?.plank || 'Plank',
      icon: '🧘',
      current: {
        seconds: stats.volume.plank.seconds,
        holds: stats.volume.plank.holds,
        sessions: stats.volume.plank.sessions
      },
      delta: deltas?.plank
    }
  ]

  const formatDelta = (value: number | undefined, unit: string) => {
    if (value === undefined || value === 0) return null
    
    const isPositive = value > 0
    const icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`inline-flex items-center text-xs ${color}`}>
        {React.createElement(icon, { size: 12, className: 'mr-1' })}
        {isPositive ? '+' : ''}{value} {unit}
      </div>
    )
  }

  const getExerciseMetrics = (exercise: typeof exercises[0]) => {
    switch (exercise.key) {
      case 'run':
        return [
          { label: t.weeklyPage?.metrics?.distance || 'Distance', value: `${exercise.current.distance.toFixed(1)} km`, delta: exercise.delta?.distanceKm },
          { label: t.weeklyPage?.metrics?.duration || 'Duration', value: `${Math.round(exercise.current.duration)} min`, delta: exercise.delta?.durationMin },
          { label: t.weeklyPage?.metrics?.sessions || 'Sessions', value: exercise.current.sessions.toString(), delta: exercise.delta?.sessions }
        ]
      case 'pullups':
      case 'pushups':
        return [
          { label: t.weeklyPage?.metrics?.reps || 'Reps', value: exercise.current.reps.toString(), delta: exercise.delta?.reps },
          { label: t.weeklyPage?.metrics?.sets || 'Sets', value: exercise.current.sets.toString(), delta: exercise.delta?.sets },
          { label: t.weeklyPage?.metrics?.sessions || 'Sessions', value: exercise.current.sessions.toString(), delta: exercise.delta?.sessions }
        ]
      case 'plank':
        return [
          { label: t.weeklyPage?.metrics?.duration || 'Duration', value: `${Math.round(exercise.current.seconds / 60)} min`, delta: exercise.delta?.seconds },
          { label: t.weeklyPage?.metrics?.holds || 'Holds', value: exercise.current.holds.toString(), delta: exercise.delta?.holds },
          { label: t.weeklyPage?.metrics?.sessions || 'Sessions', value: exercise.current.sessions.toString(), delta: exercise.delta?.sessions }
        ]
      default:
        return []
    }
  }

  const activeExercises = exercises.filter(ex => 
    ex.current.sessions > 0 || 
    (ex.current as any).distance > 0 || 
    (ex.current as any).reps > 0 || 
    (ex.current as any).seconds > 0
  )

  if (activeExercises.length === 0) {
    return (
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t.weeklyPage?.progress?.title || 'Exercise Progress'}
        </h3>
        <div className="text-center py-8 text-gray-500">
          {t.weeklyPage?.progress?.noData || 'No exercise data for this week'}
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.weeklyPage?.progress?.title || 'Exercise Progress'}
      </h3>
      
      <div className="space-y-6">
        {activeExercises.map((exercise) => {
          const metrics = getExerciseMetrics(exercise)
          
          return (
            <div key={exercise.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{exercise.icon}</span>
                <h4 className="text-lg font-semibold text-gray-900">{exercise.title}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {metric.label}
                    </div>
                    {formatDelta(metric.delta, metric.label.toLowerCase())}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExerciseProgressSection
