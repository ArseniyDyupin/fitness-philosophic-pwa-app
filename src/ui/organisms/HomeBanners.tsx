import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useNavigate } from 'react-router-dom'
import { X, Settings, User, Activity } from 'lucide-react'
import { useProfileStore } from '@stores/profile.store'
import { useAIStore } from '@stores/ai.store'
import { metricsService } from '@services/metrics.service'

interface Banner {
  id: string
  type: 'warning' | 'info' | 'success'
  icon: React.ReactNode
  title: string
  message: string
  actionText: string
  onAction: () => void
  onDismiss?: () => void
}

interface HomeBannersProps {
  onOpenMetricsModal?: () => void
}

const HomeBanners: React.FC<HomeBannersProps> = ({ onOpenMetricsModal }) => {
  const t = useTranslations()
  const navigate = useNavigate()
  const { profile } = useProfileStore()
  const { hasKey } = useAIStore()
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [profile, hasKey])

  const loadBanners = async () => {
    try {
      setIsLoading(true)
      const newBanners: Banner[] = []

      // Check if profile is incomplete
      if (!profile?.name || !profile?.age || !profile?.height || !profile?.weight) {
        newBanners.push({
          id: 'incomplete-profile',
          type: 'warning',
          icon: <User className="w-5 h-5" />,
          title: t.homeDashboard?.banners?.finishProfile || 'Complete your profile',
          message: t.homeDashboard?.banners?.completeProfileMessage || 'Complete your profile to get personalized recommendations',
          actionText: t.homeDashboard?.banners?.setup || 'Setup',
          onAction: () => navigate('/settings')
        })
      }

      // Check if API key is missing
      if (!hasKey()) {
        newBanners.push({
          id: 'missing-api-key',
          type: 'info',
          icon: <Settings className="w-5 h-5" />,
          title: t.homeDashboard?.banners?.apiKey || 'Connect OpenAI key to enable AI features',
          message: t.homeDashboard?.banners?.enableAIMessage || 'Enable AI to generate personalized workout plans and get analysis',
          actionText: t.homeDashboard?.banners?.setup || 'Setup',
          onAction: () => navigate('/settings')
        })
      }

      // Check if body metrics need updating
      try {
        const activeDefs = await metricsService.getActiveDefs()
        if (activeDefs.length > 0) {
          const lastWeek = new Date()
          lastWeek.setDate(lastWeek.getDate() - 7)
          const isWeekFilled = await metricsService.isWeekFilled(lastWeek)
          
          if (!isWeekFilled) {
            newBanners.push({
              id: 'metrics-update',
              type: 'info',
              icon: <Activity className="w-5 h-5" />,
              title: t.homeDashboard?.banners?.metrics || 'Time to update measurements for the past week',
              message: t.homeDashboard?.banners?.metricsMessage || 'Keep track of your progress by updating your body measurements',
              actionText: t.homeDashboard?.banners?.fill || 'Fill',
              onAction: () => onOpenMetricsModal?.()
            })
          }
        }
      } catch (error) {
        console.log(t.homeDashboard?.banners?.bodyMetricsCheckFailed || 'Body metrics check failed:', error)
      }

      // Check if user hasn't worked out in a while
      // This would require checking recent workouts - for now, we'll skip this check
      // as it would require additional data from the workouts store

      setBanners(newBanners)
    } catch (error) {
      console.error(t.homeDashboard?.banners?.failedToLoadBanners || 'Failed to load banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissBanner = (bannerId: string) => {
    setBanners(prev => prev.filter(banner => banner.id !== bannerId))
    
    // Store dismissal in localStorage until tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    localStorage.setItem(`banner-dismissed-${bannerId}`, tomorrow.toISOString())
  }

  const snoozeBanner = (bannerId: string) => {
    dismissBanner(bannerId)
    
    // Store snooze until tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    localStorage.setItem(`banner-snoozed-${bannerId}`, tomorrow.toISOString())
  }

  const getBannerStyles = (type: Banner['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getBannerIconStyles = (type: Banner['type']) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className={`border rounded-lg p-4 ${getBannerStyles(banner.type)}`}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 mr-3 ${getBannerIconStyles(banner.type)}`}>
              {banner.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium mb-1">
                {banner.title}
              </h3>
              <p className="text-sm opacity-90 mb-3">
                {banner.message}
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={banner.onAction}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
                >
                  {banner.actionText}
                </button>
                
                <button
                  onClick={() => snoozeBanner(banner.id)}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
                >
                  {t.homeDashboard?.banners?.snooze || 'Snooze'}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => dismissBanner(banner.id)}
              className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HomeBanners
