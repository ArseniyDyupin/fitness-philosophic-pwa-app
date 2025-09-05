import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslations, useI18nStore } from '../stores/i18n.store'
import { useProfileStore } from '../stores/profile.store'
import { useWorkoutStore } from '../stores/workout.store'
import { useAIStore } from '../stores/ai.store'
import { downloadExport } from '../services/export'
import { aiService } from '../services/ai'
import { ArrowLeft, Download, Check, X, Sparkles, Loader } from 'lucide-react'

const Header: React.FC = () => {
  const t = useTranslations()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentLanguage } = useI18nStore()
  const { profile } = useProfileStore()
  const { workouts } = useWorkoutStore()
  const { isConfigured } = useAIStore()
  
  const [isExporting, setIsExporting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadExport()
      showToast(t.exportSuccess || 'Data exported successfully', 'success')
    } catch (error) {
      console.error('Export failed:', error)
      showToast(t.error || 'Export failed', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
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

  // Check if back button should be shown
  const shouldShowBackButton = () => {
    const rootPaths = ['/', '/workouts', '/food', '/weekly', '/settings']
    return !rootPaths.includes(location.pathname) && !location.pathname.startsWith('/onboarding')
  }

  // Check if navigation item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side: Back button + Logo */}
          <div className="flex items-center space-x-4">
            {shouldShowBackButton() && (
              <button
                onClick={handleBack}
                className="btn-ghost p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t.header?.back || 'Back'}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
              {t.aiTrainer}
            </Link>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex space-x-1">
            <Link 
              to="/workouts" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/workouts')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/workouts') ? 'page' : undefined}
            >
              {t.header?.workouts || t.workouts}
            </Link>
            <Link 
              to="/food" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/food')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/food') ? 'page' : undefined}
            >
              {t.header?.food || t.food}
            </Link>
            <Link 
              to="/weekly" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/weekly')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/weekly') ? 'page' : undefined}
            >
              {t.header?.week || t.weekly}
            </Link>
            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/settings')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/settings') ? 'page' : undefined}
            >
              {t.header?.settings || t.settings}
            </Link>
          </nav>

          {/* Right side: Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Generate Plan Button (only if AI is configured) */}
            {isConfigured && (
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="btn-primary flex items-center space-x-2 text-sm"
                title={t.header?.generate || 'Generate Workout'}
              >
                {isGenerating ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                <span className="hidden sm:inline">
                  {isGenerating 
                    ? (t.header?.generating || 'Generating...') 
                    : (t.header?.generate || 'Generate Workout')
                  }
                </span>
              </button>
            )}
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              ) : (
                <Download size={16} />
              )}
              <span className="hidden sm:inline">{t.header?.export || t.exportAll || 'Export Data'}</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-gray-200 py-2">
          <div className="flex justify-around">
            <Link 
              to="/workouts" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${
                isActive('/workouts')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/workouts') ? 'page' : undefined}
            >
              <span className="text-xs">{t.header?.workouts || t.workouts}</span>
            </Link>
            <Link 
              to="/food" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${
                isActive('/food')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/food') ? 'page' : undefined}
            >
              <span className="text-xs">{t.header?.food || t.food}</span>
            </Link>
            <Link 
              to="/weekly" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${
                isActive('/weekly')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/weekly') ? 'page' : undefined}
            >
              <span className="text-xs">{t.header?.week || t.weekly}</span>
            </Link>
            <Link 
              to="/settings" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${
                isActive('/settings')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/settings') ? 'page' : undefined}
            >
              <span className="text-xs">{t.header?.settings || t.settings}</span>
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <X size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
