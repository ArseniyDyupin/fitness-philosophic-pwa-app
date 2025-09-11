import React from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useWorkoutStore } from '../../stores/workout.store'
import { useAIStore } from '../../stores/ai.store'
import { Zap, Clock, Target, Calendar, Activity } from 'lucide-react'
import GenerateWorkoutButton from './GenerateWorkoutButton'

export interface DayStats {
  calories: number
  minutes: number
  exercises: number
  rpeAvg?: number
  workoutCount?: number
}

export interface WeekStats extends DayStats {
  workouts: number
  goalPerWeek?: number
}

interface HomeKPIProps {
  dayStats: DayStats
  weekStats: WeekStats
  isLoading?: boolean
}

const HomeKPI: React.FC<HomeKPIProps> = ({ dayStats, weekStats, isLoading = false }) => {
  const t = useTranslations()
  const navigate = useNavigate()
  const { profile } = useProfileStore()
  const { getWorkoutsByDate } = useWorkoutStore()
  const { hasKey } = useAIStore()

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60) // Remove decimal places
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Get today's workouts to check if there are any
  const today = new Date().toISOString().split('T')[0]
  const todayWorkouts = getWorkoutsByDate(today)
  const hasWorkoutsToday = todayWorkouts.length > 0
  console.log(todayWorkouts, '<<<<<<todayWorkouts')


  const getProgressPercentage = (current: number, goal: number): number => {
    if (goal === 0) return 0
    return Math.min((current / goal) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {(t.homeDashboard as any)?.kpi?.today || 'Today'}
      </h2>
      
      {/* Today's Stats */}
      {hasWorkoutsToday ? (
        <div className="mb-6">
          {/* Workout count badge if multiple workouts */}
          {todayWorkouts.length > 1 && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {todayWorkouts.length} {(t.homeDashboard as any)?.kpi?.workoutsCount || 'workouts'}
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate('/workouts')}
            >
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.calories || 'Calories'}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{dayStats.calories}</div>
            </div>
            
            <div 
              className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate('/workouts')}
            >
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.minutes || 'Minutes'}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatDuration(dayStats.minutes)}</div>
            </div>
            
            <div 
              className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate('/workouts')}
            >
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.exercises || 'Exercises'}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{dayStats.exercises}</div>
            </div>
            
            <div 
              className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate('/workouts')}
            >
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.rpe || 'RPE'}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {dayStats.rpeAvg ? dayStats.rpeAvg.toFixed(1) : '-'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 mb-6">
          <p className="text-gray-500 mb-4">
            {(t.homeDashboard as any)?.kpi?.noWorkoutsToday || 'You haven\'t trained today'}
          </p>
          {hasKey() && (
            <GenerateWorkoutButton
              variant="primary"
              size="md"
              showIcon={true}
              showText={true}
            />
          )}
        </div>
      )}

      {/* Week Progress */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          {(t.homeDashboard as any)?.kpi?.week || 'Week'} {(t.homeDashboard as any)?.kpi?.progress || 'Progress'}
        </h3>
        
        <div className="space-y-3">
          {/* Workouts Progress */}
          <div 
            className="cursor-pointer"
            onClick={() => navigate('/workouts')}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.workouts || 'Workouts'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {weekStats.workouts}/{profile?.frequency || 3}
                </span>
                {weekStats.workouts > (profile?.frequency || 3) && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +{weekStats.workouts - (profile?.frequency || 3)}
                  </span>
                )}
              </div>
            </div>
            {(profile?.frequency || 3) > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(weekStats.workouts, profile?.frequency || 3)}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {/* Calories Progress */}
          <div 
            className="cursor-pointer"
            onClick={() => navigate('/stats')}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-orange-500 mr-2" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.calories || 'Calories'}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{weekStats.calories}</span>
            </div>
          </div>
          
          {/* Time Progress */}
          <div 
            className="cursor-pointer"
            onClick={() => navigate('/stats')}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">{(t.homeDashboard as any)?.kpi?.minutes || 'Minutes'}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatDuration(weekStats.minutes)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeKPI
