import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import Button from '@atoms/Button'
import { cn } from '@utils/cn'

export interface WeekNavigatorProps {
  selectedWeekStart: Date
  onWeekChange: (weekStart: Date) => void
  hasPreviousWeek: boolean
  hasNextWeek: boolean
  isCurrentWeek: boolean
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  selectedWeekStart,
  onWeekChange,
  hasPreviousWeek,
  hasNextWeek,
  isCurrentWeek
}) => {
  const t = useTranslations()
  const { language } = useTranslations()

  const locale = language === 'ru' ? ru : enUS

  const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 })

  const formatWeekRange = () => {
    const startStr = format(weekStart, 'MMM d', { locale })
    const endStr = format(weekEnd, 'MMM d, yyyy', { locale })
    return `${startStr} — ${endStr}`
  }

  const goToPreviousWeek = () => {
    if (hasPreviousWeek) {
      onWeekChange(addWeeks(selectedWeekStart, -1))
    }
  }

  const goToNextWeek = () => {
    if (hasNextWeek) {
      onWeekChange(addWeeks(selectedWeekStart, 1))
    }
  }

  const goToCurrentWeek = () => {
    onWeekChange(new Date())
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Previous Week Button */}
          <button
            onClick={goToPreviousWeek}
            disabled={!hasPreviousWeek}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            aria-label={t.workoutsPage?.weekNav?.prev || 'Previous week'}
          >
            <ChevronLeft size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t.workoutsPage?.weekNav?.prev || 'Previous'}</span>
          </button>

          {/* Week Range */}
          <div className="flex-1 text-center">
            <div className="text-sm sm:text-base font-medium text-gray-900">
              {formatWeekRange()}
            </div>
            {!isCurrentWeek && (
              <button
                onClick={goToCurrentWeek}
                className="text-xs text-primary-600 hover:text-primary-700 transition-colors touch-manipulation"
              >
                {t.workoutsPage?.weekNav?.current || 'Current Week'}
              </button>
            )}
          </div>

          {/* Next Week Button */}
          <button
            onClick={goToNextWeek}
            disabled={!hasNextWeek}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            aria-label={t.workoutsPage?.weekNav?.next || 'Next week'}
          >
            <span className="hidden sm:inline">{t.workoutsPage?.weekNav?.next || 'Next'}</span>
            <ChevronRight size={16} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WeekNavigator
