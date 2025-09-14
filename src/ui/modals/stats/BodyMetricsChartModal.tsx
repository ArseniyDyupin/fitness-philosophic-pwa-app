import React from 'react'
import { useTranslations } from '@stores/i18n.store'
import { X, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { MetricDef } from '@/types/body-metrics'

interface BodyMetricsChartModalProps {
  isOpen: boolean
  onClose: () => void
  metricKey: string
  metricData: Array<{
    date: string
    value: number
  }>
  metricDef: MetricDef
}

const BodyMetricsChartModal: React.FC<BodyMetricsChartModalProps> = ({
  isOpen,
  onClose,
  metricData,
  metricDef
}) => {
  const t = useTranslations()

  if (!isOpen) return null

  const formatValue = (value: number): string => {
    const precision = metricDef.precision || 1
    const unit = t.metrics?.units?.[metricDef.unit as keyof typeof t.metrics.units] || metricDef.unit
    return `${value.toFixed(precision)} ${unit}`
  }

  const formatDate = (dateStr: string): string => {
    try {
      return format(parseISO(dateStr), 'MMM d')
    } catch {
      return dateStr
    }
  }

  const getYAxisLabel = (): string => {
    const unit = t.metrics?.units?.[metricDef.unit as keyof typeof t.metrics.units] || metricDef.unit
    return `${metricDef.label} (${unit})`
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }> }) => {
    if (active && payload && payload.length) {
      const data = (payload[0] as any).payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDate(data.date)}</p>
          <p className="text-sm text-gray-600">
            {metricDef.label}: {formatValue(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  const chartData = metricData.map(item => ({
    ...item,
    formattedDate: formatDate(item.date),
    formattedValue: formatValue(item.value)
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {metricDef.label} - {t.statsPage?.chart?.progress || 'Progress'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
            aria-label={t.statsPage?.chart?.close || 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chart Content */}
        <div className="p-4 sm:p-6">
          {chartData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                {t.statsPage?.chart?.noData || 'No data available'}
              </div>
              <div className="text-sm text-gray-500">
                {t.statsPage?.chart?.noDataMessage || 'No progress data for this metric'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {chartData.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.statsPage?.chart?.dataPoints || 'Data Points'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatValue(Math.max(...chartData.map(d => d.value)))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.statsPage?.chart?.highest || 'Highest'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatValue(Math.min(...chartData.map(d => d.value)))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.statsPage?.chart?.lowest || 'Lowest'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatValue(chartData[chartData.length - 1]?.value || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.statsPage?.chart?.latest || 'Latest'}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="formattedDate" 
                      stroke="#666"
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={metricDef.color || '#3B82F6'}
                      strokeWidth={3}
                      dot={{ r: 6, fill: metricDef.color || '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, stroke: metricDef.color || '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors touch-manipulation"
          >
            {t.statsPage?.chart?.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BodyMetricsChartModal
