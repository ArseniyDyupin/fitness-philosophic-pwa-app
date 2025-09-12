import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslations } from '@stores/i18n.store'
import { downloadExport } from '@services/export'
import { toastSuccess, toastError } from '@lib/toast'
import { ArrowLeft, Download, MoreVertical } from 'lucide-react'
import GenerateWorkoutButton from '@molecules/home/GenerateWorkoutButton'
import Button from '@atoms/Button'
import ReminderBanner from '@molecules/shared/ReminderBanner'
import BodyMetricsModal from '@modals/home/BodyMetricsModal'

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
      <ReminderBanner 
        title={t.header?.metricsReminder || 'Weekly Metrics Reminder'}
        message={t.header?.metricsReminderMessage || 'Don\'t forget to log your weekly body metrics'}
        onAction={() => setIsMetricsModalOpen(true)}
        actionText={t.header?.logMetrics || 'Log Metrics'}
        variant="info"
      />
      
      <header className="bg-white shadow-sm border-b border-gray-200 pwa-safe-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side: Back button + Logo */}
          <div className="flex items-center space-x-4">
            {shouldShowBackButton() && (
              <button
                onClick={handleBack}
                className="btn-ghost p-2 hover:bg-gray-100 rounded-lg transition-colors pwa-touch-target"
                aria-label={t.header?.back || 'Назад'}
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
              {t.header?.home || 'Обзор'}
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
              {t.statsPage?.title || 'Статистика'}
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
                className="w-10 h-10 flex items-center justify-center"
                title={t.header?.generate || 'Создать тренировку'}
              />
            </div>
            
            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              loading={isExporting}
              className="md:hidden w-10 h-10 flex items-center justify-center"
            >
              <Download size={16} />
            </Button>
            
            {/* Export Button - Desktop */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              loading={isExporting}
              variant="secondary"
              className="hidden md:flex items-center space-x-2 text-sm p-2"
            >
              <Download size={16} />
              <span>{t.header?.export || t.exportAll || 'Экспорт данных'}</span>
            </Button>
            
            {/* Mobile Menu Button */}
            <div className="mobile-menu-container relative">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="secondary"
                className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900"
                aria-label={t.header?.openMenu || 'Открыть меню навигации'}
              >
                <MoreVertical size={16} />
              </Button>
              
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
                      {t.header?.home || 'Обзор'}
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
                      {t.statsPage?.title || 'Статистика'}
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
