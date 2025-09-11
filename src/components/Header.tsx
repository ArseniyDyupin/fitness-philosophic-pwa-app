import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import { downloadExport } from '../services/export'
import { toastSuccess, toastError } from '../lib/toast'
import { ArrowLeft, Download, MoreVertical } from 'lucide-react'
import GenerateWorkoutButton from './home/GenerateWorkoutButton'
import HeaderReminderBanner from './HeaderReminderBanner'
import BodyMetricsModal from './BodyMetricsModal'

const Header: React.FC = () => {
  const t = useTranslations()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isExporting, setIsExporting] = useState(false)
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])


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
              to="/" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/')
                  ? 'font-semibold text-gray-900 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              {t.header?.home || 'Overview'}
            </Link>
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
            {/* Generate Workout Button - Desktop */}
            <div className="hidden md:block">
              <GenerateWorkoutButton
                variant="primary"
                showIcon={true}
                showText={true}
                className="text-sm"
              />
            </div>
            
            {/* Generate Workout Button - Mobile (icon only, same size as export) */}
            <div className="md:hidden">
              <GenerateWorkoutButton
                variant="primary"
                showIcon={true}
                showText={false}
                className="p-2"
                title={t.header?.generate || 'Generate Workout'}
              />
            </div>
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary flex items-center space-x-2 text-sm pwa-touch-target p-2"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              ) : (
                <Download size={16} />
              )}
              <span className="hidden sm:inline">{t.header?.export || t.exportAll || 'Export Data'}</span>
            </button>
            
            {/* Mobile Menu Button */}
            <div className="mobile-menu-container relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden btn-secondary flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors pwa-touch-target"
                aria-label="Open navigation menu"
              >
                <MoreVertical size={16} />
              </button>
              
              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <div className="md:hidden absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]">
                  <div className="py-1">
                    <Link 
                      to="/" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm transition-colors pwa-touch-target ${
                        isActive('/')
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-current={isActive('/') ? 'page' : undefined}
                    >
                      {t.header?.home || 'Overview'}
                    </Link>
                    <Link 
                      to="/workouts" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm transition-colors pwa-touch-target ${
                        isActive('/workouts')
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-current={isActive('/workouts') ? 'page' : undefined}
                    >
                      {t.header?.workouts || t.workouts}
                    </Link>
                    <Link 
                      to="/stats" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm transition-colors pwa-touch-target ${
                        isActive('/stats')
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-current={isActive('/stats') ? 'page' : undefined}
                    >
                      {t.statsPage?.title || 'Statistics'}
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm transition-colors pwa-touch-target ${
                        isActive('/settings')
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      aria-current={isActive('/settings') ? 'page' : undefined}
                    >
                      {t.header?.settings || t.settings}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
