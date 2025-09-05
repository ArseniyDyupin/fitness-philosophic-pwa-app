import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslations, useI18nStore } from '../stores/i18n.store'
import { useProfileStore } from '../stores/profile.store'
import { useWorkoutStore } from '../stores/workout.store'
import { useAIStore } from '../stores/ai.store'
import { aiService } from '../services/ai'
import { Sparkles, Loader } from 'lucide-react'

const HomePage: React.FC = () => {
  const t = useTranslations()
  const navigate = useNavigate()
  const { currentLanguage } = useI18nStore()
  const { profile } = useProfileStore()
  const { workouts } = useWorkoutStore()
  const { isConfigured } = useAIStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGeneratePlan = async () => {
    if (!profile) {
      showToast(t.error || 'Profile not found', 'error')
      return
    }

    setIsGenerating(true)
    try {
      const recentWorkouts = workouts.slice(0, 5) // Get last 5 workouts
      const plan = await aiService.generateNextWorkout(profile, recentWorkouts, currentLanguage)
      
      showToast(t.plan?.planGenerated || 'Plan generated successfully', 'success')
      
      // Navigate to plan realization page
      setTimeout(() => {
        navigate(`/plan/${plan.id}`)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to generate plan:', error)
      showToast(t.error || 'Failed to generate plan', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.welcome}
          </h2>
          <p className="text-lg text-gray-600">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/workouts"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🏃</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.workouts}
            </h3>
            <p className="text-gray-600">
              {t.homePage?.workoutsDescription || 'Track your workouts and get AI analysis'}
            </p>
          </Link>

          <Link
            to="/food"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🍎</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.food}
            </h3>
            <p className="text-gray-600">
              {t.homePage?.foodDescription || 'Log your nutrition and track calories'}
            </p>
          </Link>

          <Link
            to="/weekly"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.weekly}
            </h3>
            <p className="text-gray-600">
              {t.homePage?.weeklyDescription || 'Weekly check-ins and progress tracking'}
            </p>
          </Link>

          <Link
            to="/settings"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.settings}
            </h3>
            <p className="text-gray-600">
              {t.homePage?.settingsDescription || 'Manage your profile and preferences'}
            </p>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {/* Generate Plan Button (only if AI is configured) */}
          {isConfigured && (
            <div>
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="btn-primary text-lg px-8 py-3 flex items-center space-x-2 mx-auto"
              >
                {isGenerating ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <Sparkles size={20} />
                )}
                <span>
                  {isGenerating 
                    ? (t.loading || 'Generating...') 
                    : (t.plan?.generatePlan || 'Generate Plan')
                  }
                </span>
              </button>
              <p className="text-sm text-gray-600 mt-2">
                {t.plan?.generatePlan === 'Generate Plan' 
                  ? 'Get a personalized workout plan from AI'
                  : 'Получите персональный план тренировки от ИИ'
                }
              </p>
            </div>
          )}
          
          {/* Add Workout Button */}
          <div>
            <Link
              to="/workouts"
              className="btn-secondary text-lg px-8 py-3"
            >
              {t.addWorkout}
            </Link>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <Sparkles size={16} className="text-green-600" />
            ) : (
              <Loader size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
