import React, { useState, useEffect } from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { getExerciseDailySeries, ExerciseDailyPoint } from '../../services/stats.week'
import { format } from 'date-fns'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { X } from 'lucide-react'

interface ExerciseProgressModalProps {
  isOpen: boolean
  onClose: () => void
  exerciseType: 'run' | 'pullups' | 'pushups' | 'plank'
  weekStart: Date
  weekEnd: Date
}

// Custom tooltip for exercise progress
const ExerciseTooltip: React.FC<any> = ({ active, payload, label }) => {
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const date = new Date(label)
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-2">
          {format(date, 'EEE, MMM d')}
        </div>
        
        <div className="space-y-1 text-sm">
          {data.valuePrimary > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>
                {data.valuePrimary.toFixed(1)} {getUnitForType(payload[0].dataKey)}
              </span>
            </div>
          )}
          
          {data.valueSecondary && data.valueSecondary > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>
                {data.valueSecondary.toFixed(1)} {getSecondaryUnitForType(payload[0].dataKey)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return null
}

const getUnitForType = (type: string): string => {
  switch (type) {
    case 'run':
      return 'км'
    case 'pullups':
    case 'pushups':
      return 'повторений'
    case 'plank':
      return 'сек'
    default:
      return ''
  }
}

const getSecondaryUnitForType = (type: string): string => {
  switch (type) {
    case 'run':
      return 'мин'
    default:
      return ''
  }
}

const ExerciseProgressModal: React.FC<ExerciseProgressModalProps> = ({
  isOpen,
  onClose,
  exerciseType,
  weekStart,
  weekEnd
}) => {
  const t = useTranslations()
  const [data, setData] = useState<ExerciseDailyPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, exerciseType, weekStart, weekEnd])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const seriesData = await getExerciseDailySeries(weekStart, weekEnd, exerciseType)
      setData(seriesData)
    } catch (error) {
      console.error('Failed to load exercise data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getExerciseTitle = () => {
    switch (exerciseType) {
      case 'run':
        return t.weeklyPage?.types?.run || 'Run'
      case 'pullups':
        return t.weeklyPage?.types?.pullups || 'Pull-ups'
      case 'pushups':
        return t.weeklyPage?.types?.pushups || 'Push-ups'
      case 'plank':
        return t.weeklyPage?.types?.plank || 'Plank'
      default:
        return 'Exercise'
    }
  }

  const getExerciseIcon = () => {
    switch (exerciseType) {
      case 'run':
        return '🏃'
      case 'pullups':
        return '💪'
      case 'pushups':
        return '🤸'
      case 'plank':
        return '🧘'
      default:
        return '💪'
    }
  }

  const getChartConfig = () => {
    switch (exerciseType) {
      case 'run':
        return {
          primaryKey: 'valuePrimary',
          secondaryKey: 'valueSecondary',
          primaryName: t.weeklyPage?.charts?.runKm || 'Distance (km)',
          secondaryName: t.weeklyPage?.charts?.runMin || 'Duration (min)',
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981'
        }
      case 'pullups':
      case 'pushups':
        return {
          primaryKey: 'valuePrimary',
          secondaryKey: undefined,
          primaryName: t.weeklyPage?.charts?.reps || 'Reps',
          secondaryName: undefined,
          primaryColor: '#3b82f6',
          secondaryColor: undefined
        }
      case 'plank':
        return {
          primaryKey: 'valuePrimary',
          secondaryKey: undefined,
          primaryName: t.weeklyPage?.charts?.seconds || 'Seconds',
          secondaryName: undefined,
          primaryColor: '#3b82f6',
          secondaryColor: undefined
        }
      default:
        return {
          primaryKey: 'valuePrimary',
          secondaryKey: undefined,
          primaryName: 'Value',
          secondaryName: undefined,
          primaryColor: '#3b82f6',
          secondaryColor: undefined
        }
    }
  }

  const config = getChartConfig()
  const totalPrimary = data.reduce((sum, point) => sum + point.valuePrimary, 0)
  const totalSecondary = data.reduce((sum, point) => sum + (point.valueSecondary || 0), 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getExerciseIcon()}</span>
            <h2 className="text-xl font-bold text-gray-900">
              {getExerciseTitle()} - {t.weeklyPage?.progress?.title || 'Progress'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t.weeklyPage?.progress?.noData || 'No data for this exercise type'}
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return format(date, 'EEE d')
                      }}
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      domain={[0, 'dataMax + 10']}
                    />
                    <Tooltip content={<ExerciseTooltip />} />
                    <Legend />
                    
                    {/* Primary metric (Bar) */}
                    <Bar 
                      dataKey={config.primaryKey} 
                      name={config.primaryName}
                      fill={config.primaryColor} 
                      radius={[4, 4, 0, 0]}
                    />
                    
                    {/* Secondary metric (Line) - only for run */}
                    {config.secondaryKey && (
                      <Line 
                        type="monotone" 
                        dataKey={config.secondaryKey} 
                        name={config.secondaryName}
                        stroke={config.secondaryColor} 
                        strokeWidth={2}
                        dot={{ fill: config.secondaryColor, strokeWidth: 2, r: 4 }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
                <div>
                  <span className="font-medium">{config.primaryName}: </span>
                  <span className="text-blue-600">
                    {totalPrimary.toFixed(1)} {getUnitForType(exerciseType)}
                  </span>
                </div>
                {config.secondaryKey && totalSecondary > 0 && (
                  <div>
                    <span className="font-medium">{config.secondaryName}: </span>
                    <span className="text-green-600">
                      {totalSecondary.toFixed(1)} {getSecondaryUnitForType(exerciseType)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExerciseProgressModal
