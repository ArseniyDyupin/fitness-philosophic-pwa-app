import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import { useStatsStore } from '../stores/stats.store'
import { useProfileStore } from '../stores/profile.store'
import StatsHeader from '../components/stats/StatsHeader'
import KPIGrid from '../components/stats/KPIGrid'
import DisciplineBreakdown from '../components/stats/DisciplineBreakdown'
import Records from '../components/stats/Records'
import BodyMetricsBlock from '../components/stats/BodyMetricsBlock'
import AiBodyEvalCard from '../components/stats/AiBodyEvalCard'
import type { StatsRange } from '../types/stats'

const StatsPage: React.FC = () => {
  const t = useTranslations()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profile } = useProfileStore()
  const { data: statsData, isLoading, error, loadStats } = useStatsStore()
  
  const [selectedRange, setSelectedRange] = useState<StatsRange>('last30')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Initialize from URL params
  useEffect(() => {
    const range = searchParams.get('range') as StatsRange
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    
    if (range) {
      setSelectedRange(range)
    }
    if (startDate) {
      setCustomStartDate(startDate)
    }
    if (endDate) {
      setCustomEndDate(endDate)
    }
  }, [searchParams])

  // Load stats when range or dates change
  useEffect(() => {
    if (profile) {
      loadStats(selectedRange, customStartDate || undefined, customEndDate || undefined)
    }
  }, [selectedRange, customStartDate, customEndDate, profile, loadStats])

  const handleRangeChange = (range: StatsRange) => {
    setSelectedRange(range)
    updateURL(range, customStartDate, customEndDate)
  }

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
    updateURL('custom', startDate, endDate)
  }

  const updateURL = (range: StatsRange, startDate: string, endDate: string) => {
    const params = new URLSearchParams()
    params.set('range', range)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    setSearchParams(params)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.loading}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <StatsHeader
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomDateChange={handleCustomDateChange}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">{t.loading}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Stats Content */}
        {statsData && !isLoading && (
          <div className="space-y-6">
            {/* KPI Grid */}
            <KPIGrid kpi={statsData.kpi} />

            {/* Discipline Breakdown */}
            <DisciplineBreakdown discipline={statsData.discipline} />

            {/* Personal Records */}
            <Records records={statsData.records} />

            {/* Placeholder for other components */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trends</h2>
              <div className="text-center py-8 text-gray-500">
                Trends chart will be implemented here
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Calendar</h2>
              <div className="text-center py-8 text-gray-500">
                Activity heatmap will be implemented here
              </div>
            </div>

            {/* Body Metrics */}
            <BodyMetricsBlock weekStart={statsData.startDate ? new Date(statsData.startDate) : undefined} />

            {/* AI Body Evaluation */}
            <AiBodyEvalCard weekStart={statsData.startDate ? new Date(statsData.startDate) : undefined} />
          </div>
        )}

        {/* Empty State */}
        {!statsData && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Data Available
            </h2>
            <p className="text-lg text-gray-600">
              Start tracking your workouts to see your statistics here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default StatsPage
