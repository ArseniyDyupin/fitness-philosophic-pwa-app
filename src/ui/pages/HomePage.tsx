import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '@stores/workout.store'
import { useAIStore } from '@stores/ai.store'
import { useProfileStore } from '@stores/profile.store'
import { toastSuccess, toastError } from '@lib/toast'
import { useTranslations } from '@stores/i18n.store'
import { format, startOfWeek } from 'date-fns'
import { Bot, Settings, ClipboardCheck, Plus } from 'lucide-react'

// Import new dashboard components
import NextWorkoutCard from '@organisms/home/NextWorkoutCard'
import HomeKPI, { type DayStats, type WeekStats } from '@organisms/home/HomeKPI'
import RecentWorkouts from '@organisms/home/RecentWorkouts'
import HomeBanners from '@organisms/home/HomeBanners'
import BodyMetricsModal from '@modals/home/BodyMetricsModal'
import type { Workout } from '@/types/models'
import { toLocalDate, todayLocalDate } from '@/domain/date/localDate'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const t = useTranslations()
  const { 
    workouts, 
    loadWorkouts, 
    getLastN, 
    getDayStats, 
    getWeekStats,
    updateWorkout,
    deleteWorkout,
    isLoading: workoutsLoading 
  } = useWorkoutStore()
  const { hasKey } = useAIStore()
  const { profile } = useProfileStore()
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false)
  const [dayStats, setDayStats] = useState<DayStats>({ calories: 0, minutes: 0, exercises: 0 })
  const [weekStats, setWeekStats] = useState<WeekStats>({ calories: 0, minutes: 0, exercises: 0, workouts: 0 })
  const [recentWorkouts, setRecentWorkouts] = useState(workouts)

  // Load data on component mount
  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  // Update stats when workouts change
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    
    setDayStats(getDayStats(today, profile?.weight))
    setWeekStats(getWeekStats(format(weekStart, 'yyyy-MM-dd'), profile?.weight))
    setRecentWorkouts(getLastN(5))
  }, [workouts, getDayStats, getWeekStats, getLastN, profile?.weight])



  const handleOpenPlan = () => {
    if (todayPlan) navigate(`/workouts/${todayPlan.id}`)
  }

  const handleMarkDone = async () => {
    if (!todayPlan) return

    try {
      await updateWorkout(todayPlan.id, { status: 'completed' })
      toastSuccess(t.homeDashboard?.nextPlan?.markedDone || 'Workout marked as completed')
    } catch {
      toastError(t.error || 'Failed to update workout')
    }
  }


  const handleOpenSettings = () => {
    navigate('/settings')
  }

  const handleOpenAISettings = () => {
    navigate('/settings', { state: { scrollToAI: true } })
  }

  const handleViewWorkout = (workout: Workout) => {
    navigate(`/workouts/${workout.id}`)
  }

  const handleEditWorkout = (workout: Workout) => {
    navigate(`/workouts/${workout.id}`)
  }

  const handleDeleteWorkout = async (workout: Workout) => {
    const confirmed = window.confirm(
      t.workoutDetailsPage?.deleteConfirm?.message ||
      'Are you sure you want to delete this workout? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteWorkout(workout.id)
      toastSuccess(t.workoutDetailsPage?.deletedSuccessfully || 'Workout deleted successfully')
    } catch {
      toastError(t.workoutDetailsPage?.failedToDelete || 'Failed to delete workout')
    }
  }

  const todayPlan = workouts.find(workout =>
    workout.status === 'planned' && toLocalDate(workout.date) === todayLocalDate()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Key Notification */}
        {!hasKey() && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    {t.metrics?.ai?.keyRequired || 'AI Key Required'}
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    {t.metrics?.ai?.keyRequiredDescription || 'To activate AI features like workout analysis and text mode, you need to add your AI API key.'}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={handleOpenAISettings}
                      className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t.metrics?.ai?.addKey || 'Add AI Key'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Next Workout Card - Takes up 8 columns on desktop */}
          <div className="lg:col-span-8">
            <NextWorkoutCard
              plan={todayPlan}
              hasApiKey={hasKey()}
              onOpenPlan={handleOpenPlan}
              onMarkDone={handleMarkDone}
              onOpenSettings={handleOpenSettings}
            />
          </div>
          
          {/* KPI Card - Takes up 4 columns on desktop */}
          <div className="lg:col-span-4">
            <HomeKPI
              dayStats={dayStats}
              weekStats={weekStats}
              isLoading={workoutsLoading}
            />
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <button onClick={() => navigate('/workouts')} className="btn-primary flex min-h-[52px] items-center justify-center gap-2">
            <Plus className="h-5 w-5" /> {t.addWorkout}
          </button>
          <button onClick={() => navigate('/weekly-review')} className="btn-secondary flex min-h-[52px] items-center justify-center gap-2">
            <ClipboardCheck className="h-5 w-5" /> {t.weeklyReview.title}
          </button>
        </div>

        {/* Recent Workouts - Full width */}
        <div className="mb-6">
          <RecentWorkouts
            workouts={recentWorkouts}
            onViewWorkout={handleViewWorkout}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </div>

        {/* Banners - Full width */}
        <div className="mb-6">
          <HomeBanners
            onOpenMetricsModal={() => setIsMetricsModalOpen(true)}
          />
        </div>
      </main>

      {/* Body Metrics Modal */}
      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
      />

    </div>
  )
}

export default HomePage
