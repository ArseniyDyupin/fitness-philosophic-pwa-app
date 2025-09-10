import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../stores/i18n.store'
import { useAIStore } from '../../stores/ai.store'
import { toastSuccess } from '../../lib/toast'
import { Sparkles } from 'lucide-react'
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
  
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        disabled={disabled}
        className={getButtonClasses()}
        title={(t.homeDashboard as any)?.cta?.generateWorkout || 'Generate Workout'}
      >
        {showIcon && <Sparkles size={getIconSize()} />}
        {showText && (
          <span>
            {(t.homeDashboard as any)?.cta?.generateWorkout || 'Generate Workout'}
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
