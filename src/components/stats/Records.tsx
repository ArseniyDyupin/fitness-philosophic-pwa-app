import React, { useState } from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { Trophy, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { PersonalRecords } from '../../types/stats'

interface RecordsProps {
  records: PersonalRecords
}

const Records: React.FC<RecordsProps> = ({ records }) => {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)

  const formatPace = (pace?: number): string => {
    if (!pace) return 'N/A'
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const recordItems = [
    {
      key: 'longestRunKm',
      label: t.statsPage?.records?.longestRun || 'Longest Run',
      value: records.longestRunKm ? `${records.longestRunKm.toFixed(1)} km` : 'N/A',
      icon: '🏃',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      key: 'bestPaceMinPerKm',
      label: t.statsPage?.records?.bestPace || 'Best Pace',
      value: formatPace(records.bestPaceMinPerKm),
      icon: '⚡',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'maxPullups',
      label: t.statsPage?.records?.maxPullups || 'Max Pull-ups',
      value: records.maxPullups ? `${records.maxPullups} reps` : 'N/A',
      icon: '💪',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      key: 'maxPushups',
      label: t.statsPage?.records?.maxPushups || 'Max Push-ups',
      value: records.maxPushups ? `${records.maxPushups} reps` : 'N/A',
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      key: 'longestPlankSec',
      label: t.statsPage?.records?.longestPlank || 'Longest Plank',
      value: formatTime(records.longestPlankSec),
      icon: '⏱️',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  const hasRecords = recordItems.some(item => {
    const key = item.key as keyof PersonalRecords
    return records[key] !== undefined && records[key] !== null
  })

  if (!hasRecords) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t.statsPage?.records?.title || 'Personal Records'}
        </h2>
        <div className="text-center py-8 text-gray-500">
          No personal records yet. Keep training to set your first records!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t.statsPage?.records?.title || 'Personal Records'}
          </h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordItems.map((item) => {
          const key = item.key as keyof PersonalRecords
          const hasRecord = records[key] !== undefined && records[key] !== null
          
          if (!hasRecord) return null

          return (
            <div key={item.key} className="relative">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bgColor} mb-3`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className={`text-xl font-bold ${item.color} mb-1`}>
                  {item.value}
                </div>
                <div className="text-sm text-gray-600">
                  {item.label}
                </div>
              </div>
              
              {/* View Chart Button */}
              {records.dates[key] && (
                <button
                  onClick={() => {
                    // TODO: Open chart modal
                    console.log('View chart for', key, records.dates[key])
                  }}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                  title={t.statsPage?.records?.viewChart || 'View Chart'}
                >
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-4">
            {recordItems.map((item) => {
              const key = item.key as keyof PersonalRecords
              const hasRecord = records[key] !== undefined && records[key] !== null
              
              if (!hasRecord) return null

              return (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                    </div>
                  </div>
                  {records.dates[key] && (
                    <button
                      onClick={() => {
                        // TODO: Open chart modal
                        console.log('View chart for', key, records.dates[key])
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                      <ExternalLink size={14} />
                      <span>{t.statsPage?.records?.viewChart || 'View Chart'}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Records
