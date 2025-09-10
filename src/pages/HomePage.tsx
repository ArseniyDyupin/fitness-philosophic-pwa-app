import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations, useI18nStore } from '../stores/i18n.store'
import { useProfileStore } from '../stores/profile.store'
import { useWorkoutStore } from '../stores/workout.store'
import { useAIStore } from '../stores/ai.store'
import { aiService } from '../services/ai'
import { toastSuccess, toastError } from '../lib/toast'
import { format, startOfWeek } from 'date-fns'
import { Sparkles, Loader, Plus } from 'lucide-react'

// Import new dashboard components
import NextWorkoutCard from '../components/home/NextWorkoutCard'
import HomeKPI, { type DayStats, type WeekStats } from '../components/home/HomeKPI'
import RecentWorkouts from '../components/home/RecentWorkouts'
import HomeBanners from '../components/home/HomeBanners'
import QuickAddMenu from '../components/home/QuickAddMenu'
import BodyMetricsModal from '../components/BodyMetricsModal'

const HomePage: React.FC = () => {
  const t = useTranslations()
  const navigate = useNavigate()
  const { currentLanguage } = useI18nStore()
  const { profile } = useProfileStore()
  const { 
    workouts, 
    loadWorkouts, 
    getLastN, 
    getDayStats, 
    getWeekStats,
    isLoading: workoutsLoading 
  } = useWorkoutStore()
  const { hasKey } = useAIStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
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
    
    setDayStats(getDayStats(today))
    setWeekStats(getWeekStats(format(weekStart, 'yyyy-MM-dd')))
    setRecentWorkouts(getLastN(5))
  }, [workouts, getDayStats, getWeekStats, getLastN])


  const handleGeneratePlan = async () => {
    if (!profile) {
      toastError(t.error || 'Profile not found')
      return
    }

    setIsGenerating(true)
    try {
      const recentWorkouts = workouts.slice(0, 5) // Get last 5 workouts
      const plan = await aiService.generateNextWorkout(profile, recentWorkouts, currentLanguage)
      
      toastSuccess(t.plan?.planGenerated || 'Plan generated successfully')
      
      // Navigate to plan realization page
      setTimeout(() => {
        navigate(`/plan/${plan.id}`)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to generate plan:', error)
      toastError(t.error || 'Failed to generate plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenPlan = () => {
    // For now, navigate to workouts page
    // In the future, this could open a specific plan
    navigate('/workouts')
  }

  const handleMarkDone = () => {
    // This would mark the current plan as completed
    toastSuccess('Plan marked as completed')
  }

  const handleRegenerate = () => {
    handleGeneratePlan()
  }

  const handleOpenSettings = () => {
    navigate('/settings')
  }

  const handleEditWorkout = (workout: any) => {
    navigate(`/workouts/${workout.id}`)
  }

  const handleDeleteWorkout = () => {
    // This would delete the workout
    toastSuccess('Workout deleted')
  }

  const handleOpenTextParser = () => {
    // This would open a text parser modal
    toastSuccess('Text parser coming soon')
  }

  // Get today's plan (if any)
  const todayPlan = recentWorkouts.find(workout => workout.date === format(new Date(), 'yyyy-MM-dd'))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with CTA */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t.welcome}
              </h1>
              <p className="text-gray-600">
                {t.welcomeSubtitle}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {!hasKey() ? (
                <button
                  onClick={handleOpenSettings}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Sparkles size={16} />
                  <span>{(t.homeDashboard as any)?.cta?.enableAI || 'Enable AI'}</span>
                </button>
              ) : todayPlan ? (
                <button
                  onClick={handleOpenPlan}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>{(t.homeDashboard as any)?.cta?.openPlan || 'Open Today\'s Plan'}</span>
                </button>
              ) : (
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span>{(t.homeDashboard as any)?.cta?.generatePlan || 'Generate Plan'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Next Workout Card - Takes up 8 columns on desktop */}
          <div className="lg:col-span-8">
            <NextWorkoutCard
              plan={todayPlan}
              hasApiKey={hasKey()}
              onOpenPlan={handleOpenPlan}
              onMarkDone={handleMarkDone}
              onRegenerate={handleRegenerate}
              onOpenSettings={handleOpenSettings}
              onGeneratePlan={handleGeneratePlan}
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

        {/* Recent Workouts - Full width */}
        <div className="mb-6">
          <RecentWorkouts
            workouts={recentWorkouts}
            isLoading={workoutsLoading}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
          />
        </div>

        {/* Banners - Full width */}
        <div className="mb-6">
          <HomeBanners
            onOpenMetricsModal={() => setIsMetricsModalOpen(true)}
          />
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsQuickAddOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-30 flex items-center justify-center"
        aria-label="Add workout"
      >
        <Plus size={24} />
      </button>

      {/* Quick Add Menu */}
      <QuickAddMenu
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onOpenTextParser={handleOpenTextParser}
      />

      {/* Body Metrics Modal */}
      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
      />

    </div>
  )
}

export default HomePage
