import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { aiBodyService } from '@services/aiBody.service'
import { Sparkles, TrendingUp, TrendingDown, Minus, Eye, X } from 'lucide-react'
import { format } from 'date-fns'
import type { AiBodyEval } from '@types/body-metrics'

interface AiBodyEvalCardProps {
  weekStart?: Date
}

const AiBodyEvalCard: React.FC<AiBodyEvalCardProps> = () => {
  const t = useTranslations()
  const [evaluations, setEvaluations] = useState<AiBodyEval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadEvaluations()
  }, [])

  const loadEvaluations = async () => {
    try {
      setIsLoading(true)
      const evals = await aiBodyService.getEvaluations()
      setEvaluations(evals)
    } catch (error) {
      console.error('Failed to load AI evaluations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score?: number): string => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score?: number) => {
    if (!score) return <Minus className="w-4 h-4 text-gray-500" />
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (score >= 60) return <Minus className="w-4 h-4 text-yellow-600" />
    return <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getScoreLabel = (score?: number): string => {
    if (!score) return 'N/A'
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const latestEval = evaluations.length > 0 ? evaluations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (evaluations.length === 0) {
    return null // Don't show if no evaluations
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t.metrics?.ai?.summary || 'AI Assessment'}
          </h2>
        </div>
        {evaluations.length > 1 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Eye size={14} />
            <span>{t.metrics?.ai?.history || 'History'}</span>
          </button>
        )}
      </div>

      {/* Latest Assessment */}
      {latestEval && (
        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getScoreIcon(latestEval.score)}
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(latestEval.score)}`}>
                  {latestEval.score || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {getScoreLabel(latestEval.score)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {format(new Date(latestEval.weekStart), 'MMM d, yyyy')}
              </div>
              <div className="text-xs text-gray-400">
                {latestEval.model}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {t.metrics?.ai?.summary || 'Summary'}
            </h3>
            <p className="text-sm text-gray-700">
              {latestEval.summary}
            </p>
          </div>

          {/* Tips */}
          {latestEval.tips && latestEval.tips.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t.metrics?.ai?.tips || 'Recommendations'}
              </h3>
              <ul className="space-y-1">
                {latestEval.tips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {latestEval.tags && latestEval.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {latestEval.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comparison */}
          {latestEval.comparedTo && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Comparison
              </h3>
              <p className="text-sm text-blue-800">
                {latestEval.comparedTo.note}
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {t.metrics?.ai?.history || 'Assessment History'}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {evaluations
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((evaluation) => (
                  <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getScoreIcon(evaluation.score)}
                        <div>
                          <div className={`text-lg font-bold ${getScoreColor(evaluation.score)}`}>
                            {evaluation.score || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getScoreLabel(evaluation.score)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {format(new Date(evaluation.weekStart), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {evaluation.model}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {evaluation.summary}
                    </p>
                    
                    {evaluation.tips && evaluation.tips.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Tips:
                        </h4>
                        <ul className="space-y-1">
                          {evaluation.tips.map((tip: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.tags && evaluation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {evaluation.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {t.metrics?.ai?.disclaimer || 'AI assessment is for reference only and is not medical advice.'}
        </p>
      </div>
    </div>
  )
}

export default AiBodyEvalCard
