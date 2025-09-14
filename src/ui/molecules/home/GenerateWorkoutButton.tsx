import React from 'react'
import Button from '@atoms/Button'
import { Sparkles } from 'lucide-react'
import { cn } from '@utils/cn'
import { useTranslations } from '@stores/i18n.store'

export interface GenerateWorkoutButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  className?: string
  disabled?: boolean
  title?: string
  onClick?: () => void
  children?: React.ReactNode
}

const GenerateWorkoutButton: React.FC<GenerateWorkoutButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showIcon = true,
  showText = true,
  className,
  disabled = false,
  title,
  onClick,
  children
}) => {
  const t = useTranslations()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={cn(className)}
      title={title}
    >
      {showIcon && <Sparkles size={16} className="mr-2" />}
      {children || (showText && t.homeDashboard?.cta?.generateWorkout)}
    </Button>
  )
}

export default GenerateWorkoutButton
