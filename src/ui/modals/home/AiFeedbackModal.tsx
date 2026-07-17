import React from 'react'
import { useTranslations } from '@stores/i18n.store'
import { X, TrendingUp, Target, Lightbulb, BarChart3 } from 'lucide-react'
import type { AiBodyEval } from '@/types/body-metrics'
import { useModalFocus } from '@/hooks/useModalFocus'

interface AiFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  aiEval: AiBodyEval | null
  previousEvals: AiBodyEval[]
}

const AiFeedbackModal: React.FC<AiFeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  aiEval, 
  previousEvals 
}) => {
  const t = useTranslations()
  const dialogRef = useModalFocus<HTMLDivElement>(isOpen && Boolean(aiEval), onClose)

  if (!isOpen || !aiEval) return null

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'text-gray-600 bg-gray-100'
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number | undefined) => {
    if (!score) return t.metrics?.ai?.poor || 'Poor'
    if (score >= 8) return t.metrics?.ai?.excellent || 'Excellent'
    if (score >= 6) return t.metrics?.ai?.good || 'Good'
    if (score >= 4) return t.metrics?.ai?.fair || 'Fair'
    return t.metrics?.ai?.poor || 'Poor'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ai-feedback-title" tabIndex={-1} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 id="ai-feedback-title" className="text-xl font-bold text-gray-900">
              {t.metrics?.ai?.feedbackTitle || 'AI Analysis Results'}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(aiEval.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t.close || 'Close'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.metrics?.ai?.overallScore || 'Overall Score'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t.metrics?.ai?.scoreDescription || 'Based on your metrics and progress'}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full ${getScoreColor(aiEval.score)}`}>
                <div className="text-2xl font-bold">{aiEval.score}/10</div>
                <div className="text-sm font-medium">{getScoreLabel(aiEval.score)}</div>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t.metrics?.ai?.summary || 'Summary'}
              </h3>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{aiEval.summary}</p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t.metrics?.ai?.recommendations || 'Recommendations'}
              </h3>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <ul className="space-y-2">
                {(aiEval.tips || []).map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trends Section */}
          {previousEvals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.metrics?.ai?.trends || 'Trends & Progress'}
                </h3>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t.metrics?.ai?.scoreTrend || 'Score Trend'}
                    </h4>
                    <div className="space-y-1">
                      {previousEvals.slice(-4).map((evaluation) => (
                        <div key={evaluation.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {new Date(evaluation.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded text-sm ${getScoreColor(evaluation.score)}`}>
                            {evaluation.score || 0}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t.metrics?.ai?.improvement || 'Improvement'}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {typeof aiEval.comparedTo === 'string' 
                        ? aiEval.comparedTo 
                        : t.metrics?.ai?.noPreviousData || 'No previous data available for comparison'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags Section */}
          {aiEval.tags && aiEval.tags.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.metrics?.ai?.keyAreas || 'Key Areas'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiEval.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            {t.metrics?.ai?.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiFeedbackModal
