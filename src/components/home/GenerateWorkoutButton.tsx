import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../stores/i18n.store'
import { useAIStore } from '../../stores/ai.store'
import { useProfileStore } from '../../stores/profile.store'
import { useWorkoutStore } from '../../stores/workout.store'
import { aiService } from '../../services/ai'
import { toastSuccess, toastError } from '../../lib/toast'
import { Sparkles, Loader } from 'lucide-react'
import GenerateWorkoutModal from '../GenerateWorkoutModal'

interface GenerateWorkoutButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  className?: string
  disabled?: boolean
  onPlanGenerated?: (plan: any) => void
}

const GenerateWorkoutButton: React.FC<GenerateWorkoutButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showIcon = true,
  showText = true,
  className = '',
  disabled = false,
  onPlanGenerated
}) => {
  const t = useTranslations()
  const navigate = useNavigate()
  const { isConfigured, hasKey } = useAIStore()
  const { profile } = useProfileStore()
  const { workouts } = useWorkoutStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleGeneratePlan = async () => {
    if (!profile) {
      toastError(t.error || 'Profile not found')
      return
    }

    setIsGenerating(true)
    try {
      const recentWorkouts = workouts.slice(0, 5) // Get last 5 workouts
      const plan = await aiService.generateNextWorkout(profile, recentWorkouts, 'en')
      
      toastSuccess((t.plan as any)?.planGenerated || 'Plan generated successfully')
      
      // Call custom handler if provided
      if (onPlanGenerated) {
        onPlanGenerated(plan)
      } else {
        // Default behavior: navigate to plan realization page
        setTimeout(() => {
          navigate(`/plan/${plan.id}`)
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
      toastError((t.plan as any)?.generateFailed || 'Failed to generate plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleModalPlanGenerated = (plan: any) => {
    toastSuccess((t.plan as any)?.planGenerated || 'Plan generated successfully')
    
    // Call custom handler if provided
    if (onPlanGenerated) {
      onPlanGenerated(plan)
    } else {
      // Default behavior: navigate to plan realization page
      setTimeout(() => {
        navigate(`/plan/${plan.id}`)
      }, 1000)
    }
  }

  // Don't render if AI is not configured
  if (!isConfigured || !hasKey()) {
    return null
  }

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg'
    }
    
    const sizeClasses = {
      sm: 'text-sm px-2 py-1',
      md: 'text-sm px-3 py-2',
      lg: 'text-base px-4 py-3'
    }
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14
      case 'lg': return 20
      default: return 16
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || isGenerating}
        className={getButtonClasses()}
        title={(t.homeDashboard as any)?.cta?.generateWorkout || 'Generate Workout'}
      >
        {isGenerating ? (
          <Loader size={getIconSize()} className="animate-spin" />
        ) : showIcon ? (
          <Sparkles size={getIconSize()} />
        ) : null}
        {showText && (
          <span>
            {isGenerating 
              ? ((t.homeDashboard as any)?.cta?.generating || 'Generating...')
              : ((t.homeDashboard as any)?.cta?.generateWorkout || 'Generate Workout')
            }
          </span>
        )}
      </button>

      {/* Generate Workout Modal */}
      <GenerateWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlanGenerated={handleModalPlanGenerated}
      />
    </>
  )
}

export default GenerateWorkoutButton
