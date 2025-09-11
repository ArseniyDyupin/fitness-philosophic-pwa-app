import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import { downloadExport } from '../services/export'
import { toastSuccess, toastError } from '../lib/toast'
import { ArrowLeft, Download } from 'lucide-react'
import GenerateWorkoutButton from './home/GenerateWorkoutButton'
import HeaderReminderBanner from './HeaderReminderBanner'
import BodyMetricsModal from './BodyMetricsModal'

const Header: React.FC = () => {
  const t = useTranslations()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isExporting, setIsExporting] = useState(false)
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false)


  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadExport()
      toastSuccess(t.exportSuccess || 'Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toastError(t.error || 'Export failed')
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


  // Check if back button should be shown
  const shouldShowBackButton = () => {
    const rootPaths = ['/', '/workouts', '/stats', '/settings'] // Removed '/food' temporarily
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
    <>
      {/* Reminder Banner */}
      <HeaderReminderBanner onOpenMetricsModal={() => setIsMetricsModalOpen(true)} />
      
      <header className="bg-white shadow-sm border-b border-gray-200 pwa-safe-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side: Back button + Logo */}
          <div className="flex items-center space-x-4">
            {shouldShowBackButton() && (
              <button
                onClick={handleBack}
                className="btn-ghost p-2 hover:bg-gray-100 rounded-lg transition-colors pwa-touch-target"
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
            {/* Temporarily hidden - will be implemented later */}
            {/* <Link 
              to="/food" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/food')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/food') ? 'page' : undefined}
            >
              {t.header?.food || t.food}
            </Link> */}
            <Link 
              to="/stats" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/stats')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/stats') ? 'page' : undefined}
            >
              {t.statsPage?.title || 'Statistics'}
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
            {/* Generate Workout Button */}
            <GenerateWorkoutButton
              variant="primary"
              size="sm"
              showText={false}
              className="text-sm"
            />
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary flex items-center space-x-2 text-sm pwa-touch-target"
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
        <nav className="md:hidden border-t border-gray-200 py-2 pwa-safe-area">
          <div className="flex justify-around pwa-scroll">
            <Link 
              to="/workouts" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors pwa-touch-target ${
                isActive('/workouts')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/workouts') ? 'page' : undefined}
            >
              <span className="text-xs">{t.header?.workouts || t.workouts}</span>
            </Link>
            {/* Temporarily hidden - will be implemented later */}
            {/* <Link 
              to="/food" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${
                isActive('/food')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/food') ? 'page' : undefined}
            >
              <span className="text-xs">{t.header?.food || t.food}</span>
            </Link> */}
            <Link 
              to="/stats" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors pwa-touch-target ${
                isActive('/stats')
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/stats') ? 'page' : undefined}
            >
              <span className="text-xs">{t.statsPage?.title || 'Statistics'}</span>
            </Link>
            <Link 
              to="/settings" 
              className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors pwa-touch-target ${
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
      {/* Body Metrics Modal */}
      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
      />
    </header>
    </>
  )
}

export default Header
