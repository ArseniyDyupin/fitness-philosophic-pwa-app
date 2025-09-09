import React, { useState, useEffect } from 'react'
import { useTranslations } from '../stores/i18n.store'
import { useProfileStore } from '../stores/profile.store'
import { metricsService } from '../services/metrics.service'
import { startOfWeek, subWeeks, format } from 'date-fns'
import { Calendar, X, Clock } from 'lucide-react'
import type { BodyMetricsSettings } from '../types/body-metrics'

interface HeaderReminderBannerProps {
  onOpenMetricsModal: () => void
}

const HeaderReminderBanner: React.FC<HeaderReminderBannerProps> = ({ onOpenMetricsModal }) => {
  const t = useTranslations()
  const { profile } = useProfileStore()
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<BodyMetricsSettings | null>(null)

  useEffect(() => {
    checkReminderConditions()
  }, [])

  const checkReminderConditions = async () => {
    try {
      setIsLoading(true)
      
      // Get settings
      const metricsSettings = await metricsService.getSettings()
      setSettings(metricsSettings)
      
      // Check if reminders are enabled
      if (!metricsSettings.reminderEnabled) {
        setIsLoading(false)
        return
      }
      
      // Get active metrics
      const activeDefs = await metricsService.getActiveDefs()
      if (activeDefs.length === 0) {
        setIsLoading(false)
        return
      }
      
      // Check if it's Monday (start of week) or first visit after weekend
      const today = new Date()
      const dayOfWeek = today.getDay()
      const isMonday = dayOfWeek === 1
      
      // Check if we've already shown reminder today
      const lastReminderDate = localStorage.getItem('metrics-reminder-last-shown')
      const todayStr = format(today, 'yyyy-MM-dd')
      
      if (lastReminderDate === todayStr) {
        setIsLoading(false)
        return
      }
      
      // Check if last week's metrics are filled
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
      const isLastWeekFilled = await metricsService.isWeekFilled(lastWeekStart, 1)
      
      // Show banner if it's Monday and last week is not filled
      if (isMonday && !isLastWeekFilled) {
        setShowBanner(true)
      }
      
    } catch (error) {
      console.error('Failed to check reminder conditions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFillNow = () => {
    // Mark reminder as shown today
    localStorage.setItem('metrics-reminder-last-shown', format(new Date(), 'yyyy-MM-dd'))
    setShowBanner(false)
    onOpenMetricsModal()
  }

  const handleSnooze = () => {
    // Mark reminder as shown today
    localStorage.setItem('metrics-reminder-last-shown', format(new Date(), 'yyyy-MM-dd'))
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (isLoading || !showBanner || !settings) {
    return null
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {t.metrics?.reminder || 'Time to update measurements for the past week'}
              </p>
              <p className="text-xs text-blue-700">
                {t.metrics?.reminderDesc || 'Keep track of your progress with weekly measurements'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSnooze}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Clock size={14} />
              <span>{t.metrics?.snooze || 'Snooze'}</span>
            </button>
            
            <button
              onClick={handleFillNow}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              {t.metrics?.fillNow || 'Fill Now'}
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderReminderBanner
