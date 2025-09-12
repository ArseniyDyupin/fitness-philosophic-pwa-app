import React, { useState } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { Calendar, ChevronDown } from 'lucide-react'
import type { StatsRange } from '../../types/stats'

interface StatsHeaderProps {
  selectedRange: StatsRange
  onRangeChange: (range: StatsRange) => void
  customStartDate?: string
  customEndDate?: string
  onCustomDateChange?: (startDate: string, endDate: string) => void
}

const StatsHeader: React.FC<StatsHeaderProps> = ({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange
}) => {
  const t = useTranslations()
  const [isCustomOpen, setIsCustomOpen] = useState(false)

  const rangeOptions: { value: StatsRange; label: string }[] = [
    { value: 'all', label: t.statsPage?.range?.all || 'All Time' },
    { value: 'ytd', label: t.statsPage?.range?.ytd || 'Year to Date' },
    { value: 'last30', label: t.statsPage?.range?.last30 || 'Last 30 Days' },
    { value: 'last90', label: t.statsPage?.range?.last90 || 'Last 90 Days' },
    { value: 'custom', label: t.statsPage?.range?.custom || 'Custom Period' }
  ]

  const handleRangeChange = (range: StatsRange) => {
    onRangeChange(range)
    if (range === 'custom') {
      setIsCustomOpen(true)
    } else {
      setIsCustomOpen(false)
    }
  }

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customStartDate && customEndDate && onCustomDateChange) {
      onCustomDateChange(customStartDate, customEndDate)
      setIsCustomOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t.statsPage?.title || 'Statistics'}
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 mt-1 sm:mt-2">
            {t.statsPage?.subtitle || 'Track your fitness progress and trends'}
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Quick Range Buttons */}
          <div className="flex flex-wrap gap-2">
            {rangeOptions.slice(0, -1).map((option) => (
              <button
                key={option.value}
                onClick={() => handleRangeChange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors touch-manipulation ${
                  selectedRange === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom Range Button */}
          <div className="relative">
            <button
              onClick={() => handleRangeChange('custom')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors touch-manipulation ${
                selectedRange === 'custom'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar size={16} />
              <span>{rangeOptions[4].label}</span>
              <ChevronDown size={14} />
            </button>

            {/* Custom Date Picker */}
            {isCustomOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-80">
                <form onSubmit={handleCustomDateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.statsPage?.customDate?.startDate || 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={customStartDate || ''}
                      onChange={(e) => {
                        if (onCustomDateChange && customEndDate) {
                          onCustomDateChange(e.target.value, customEndDate)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.statsPage?.customDate?.endDate || 'End Date'}
                    </label>
                    <input
                      type="date"
                      value={customEndDate || ''}
                      onChange={(e) => {
                        if (onCustomDateChange && customStartDate) {
                          onCustomDateChange(customStartDate, e.target.value)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomOpen(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {t.statsPage?.customDate?.cancel || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      {t.statsPage?.customDate?.apply || 'Apply'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsHeader
