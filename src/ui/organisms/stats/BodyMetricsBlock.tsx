import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { metricsService } from '@services/metrics.service'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { format } from 'date-fns'
import type { MetricDef } from '@/types/body-metrics'

interface BodyMetricsBlockProps {
  weekStart?: Date
}

const BodyMetricsBlock: React.FC<BodyMetricsBlockProps> = () => {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)
  const [metricDefs, setMetricDefs] = useState<MetricDef[]>([])
  const [latestValues, setLatestValues] = useState<Record<string, number>>({})
  const [trends, setTrends] = useState<Record<string, Array<{ date: string; value: number }>>>({})
  const [deltas, setDeltas] = useState<Record<string, number>>({})
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Check if database is ready and has the required tables
      const db = (await import('@services/db')).db
      if (!db.isOpen()) {
        await db.open()
      }
      
      // Check if metric_defs table exists and has data
      const tableExists = db.tables.some((table: any) => table.name === 'metric_defs')
      if (!tableExists) {
        console.log('Body metrics tables not found - skipping body metrics block')
        setMetricDefs([])
        setLatestValues({})
        setTrends({})
        setDeltas({})
        setSelectedMetrics([])
        return
      }
      
      const [defs, values] = await Promise.all([
        metricsService.getActiveDefs(),
        metricsService.getLatestValues()
      ])
      
      setMetricDefs(defs)
      setLatestValues(values)
      
      // Load trends for all metrics
      const trendsData: Record<string, Array<{ date: string; value: number }>> = {}
      const deltasData: Record<string, number> = {}
      
      for (const def of defs) {
        try {
          const [trend, delta] = await Promise.all([
            metricsService.getTrends(def.id, 8),
            metricsService.getDelta(def.id, 30)
          ])
          
          trendsData[def.key] = trend
          deltasData[def.key] = delta || 0
        } catch (error) {
          console.warn(`Failed to load trends for metric ${def.key}:`, error)
          trendsData[def.key] = []
          deltasData[def.key] = 0
        }
      }
      
      setTrends(trendsData)
      setDeltas(deltasData)
      
      // Select first 3 metrics by default
      setSelectedMetrics(defs.slice(0, 3).map(d => d.key))
      
    } catch (error) {
      console.error('Failed to load body metrics data:', error)
      // Set empty state to prevent further errors
      setMetricDefs([])
      setLatestValues({})
      setTrends({})
      setDeltas({})
      setSelectedMetrics([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (def: MetricDef, value: number): string => {
    const precision = def.precision || 1
    const unit = t.metrics?.units?.[def.unit as keyof typeof t.metrics.units] || def.unit
    return `${value.toFixed(precision)} ${unit}`
  }

  const formatDelta = (def: MetricDef, delta: number): string => {
    const precision = def.precision || 1
    const unit = t.metrics?.units?.[def.unit as keyof typeof t.metrics.units] || def.unit
    const sign = delta >= 0 ? '+' : ''
    return `${sign}${delta.toFixed(precision)} ${unit}`
  }

  const getDeltaColor = (delta: number): string => {
    if (delta > 0) return 'text-green-600'
    if (delta < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return null
  }

  const prepareChartData = () => {
    if (selectedMetrics.length === 0) return []
    
    // Get all unique dates from trends
    const allDates = new Set<string>()
    selectedMetrics.forEach(key => {
      trends[key]?.forEach(point => allDates.add(point.date))
    })
    
    const sortedDates = Array.from(allDates).sort()
    
    return sortedDates.map(date => {
      const dataPoint: any = { date: format(new Date(date), 'MMM d') }
      
      selectedMetrics.forEach(key => {
        const trend = trends[key]
        const point = trend?.find(p => p.date === date)
        dataPoint[key] = point?.value || null
      })
      
      return dataPoint
    })
  }

  const handleMetricToggle = (key: string) => {
    setSelectedMetrics(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (metricDefs.length === 0) {
    return null // Don't show the block if no metrics are configured
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t.metrics?.title || 'Body Metrics'}
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {metricDefs.map((def) => {
          const value = latestValues[def.key]
          const delta = deltas[def.key]
          
          if (value === undefined) return null
          
          return (
            <div key={def.id} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: def.color }}
                />
                <span className="text-sm text-gray-600">
                  {t.metrics?.default?.[def.key as keyof typeof t.metrics.default] || def.label}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {formatValue(def, value)}
              </div>
              {delta !== 0 && (
                <div className={`text-sm flex items-center justify-center ${getDeltaColor(delta)}`}>
                  {getDeltaIcon(delta)}
                  <span className="ml-1">{formatDelta(def, delta)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Chart Controls */}
          <div className="flex flex-wrap gap-2">
            {metricDefs.map((def) => (
              <label key={def.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(def.key)}
                  onChange={() => handleMetricToggle(def.key)}
                  className="sr-only"
                />
                <span className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  selectedMetrics.includes(def.key)
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedMetrics.includes(def.key) ? def.color : undefined
                }}>
                  {t.metrics?.default?.[def.key as keyof typeof t.metrics.default] || def.label}
                </span>
              </label>
            ))}
          </div>

          {/* Chart */}
          {selectedMetrics.length > 0 && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedMetrics.map((key) => {
                    const def = metricDefs.find(d => d.key === key)
                    if (!def) return null
                    
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={def.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls={false}
                        name={t.metrics?.default?.[def.key as keyof typeof t.metrics.default] || def.label}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Entries Table */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">
              {t.metrics?.recentEntries || 'Recent Entries'}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {metricDefs.map((def) => (
                      <th key={def.id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.metrics?.default?.[def.key as keyof typeof t.metrics.default] || def.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* This would be populated with recent entries */}
                  <tr>
                    <td colSpan={metricDefs.length + 1} className="px-3 py-4 text-center text-gray-500">
                      {t.metrics?.noEntries || 'No recent entries'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BodyMetricsBlock
