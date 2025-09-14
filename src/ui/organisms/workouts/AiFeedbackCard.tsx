import React from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import { format } from 'date-fns'
import type { AIWorkoutFeedback } from '@/types/models'

interface AiFeedbackCardProps {
  feedback: AIWorkoutFeedback | null
  isLoading: boolean
  isAnalyzing: boolean
  onUpdateAnalysis: () => void
}

const AiFeedbackCard: React.FC<AiFeedbackCardProps> = ({
  feedback,
  isLoading,
  isAnalyzing,
  onUpdateAnalysis
}) => {
  const t = useTranslations()

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-600 bg-green-100'
    if (rpe <= 7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRpeLabel = (rpe: number) => {
    if (rpe <= 3) return t.workoutForm?.easy || 'Easy'
    if (rpe <= 7) return t.workoutForm?.moderate || 'Moderate'
    return t.workoutForm?.hard || 'Hard'
  }

  const parseFeedbackText = (text: string) => {
    // Try to extract summary and bullet points
    const lines = text.split('\n').filter(line => line.trim())
    
    // First line is usually the summary
    const summary = lines[0] || ''
    
    // Look for bullet points (lines starting with -, *, •, or numbered)
    const bullets = lines.slice(1).filter(line => 
      line.trim().match(/^[-*•]\s/) || 
      line.trim().match(/^\d+\.\s/) ||
      line.trim().match(/^-\s/)
    )
    
    return { summary, bullets }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading AI feedback...</span>
        </div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span>{t.workoutDetailsPage?.ai?.feedback || 'AI Feedback'}</span>
          </h3>
          <button
            onClick={onUpdateAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t.workoutDetailsPage?.actions?.updateAnalysis || 'Update analysis'}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></div>
                <span className="text-sm">{t.workoutAnalysis?.starting || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span className="text-sm">{t.workoutDetailsPage?.actions?.updateAnalysis || 'Update Analysis'}</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🤖</div>
          <div className="text-lg font-medium mb-2">
            {t.workoutDetailsPage?.ai?.notRun || 'Analysis not performed yet. Click "Update Analysis".'}
          </div>
        </div>
      </div>
    )
  }

  const { summary, bullets } = parseFeedbackText(feedback.review)

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <span className="text-2xl">🤖</span>
          <span>{t.workoutDetailsPage?.ai?.feedback || 'AI Feedback'}</span>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
            {feedback.model}
          </span>
        </h3>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500">
            {t.workoutDetailsPage?.ai?.updated || 'updated'}: {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
          </div>
          <button
            onClick={onUpdateAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t.workoutDetailsPage?.actions?.updateAnalysis || 'Update analysis'}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></div>
                <span className="text-sm">{t.workoutAnalysis?.starting || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span className="text-sm">{t.workoutDetailsPage?.actions?.updateAnalysis || 'Update Analysis'}</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* RPE Badge */}
        {feedback.rpe && (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">
              {t.workoutAnalysis?.rpe || 'RPE'}: 
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRpeColor(feedback.rpe)}`}>
              {feedback.rpe} - {getRpeLabel(feedback.rpe)}
            </span>
          </div>
        )}
        
        {/* Summary */}
        {summary && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-800 font-medium leading-relaxed">
              {summary}
            </p>
          </div>
        )}
        
        {/* Bullet points */}
        {bullets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Key Recommendations:</h4>
            <ul className="space-y-2">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    {bullet.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Full text fallback if parsing didn't work well */}
        {!summary && bullets.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {feedback.review}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AiFeedbackCard
