import React from 'react'
import Button from '@atoms/Button'
import { Sparkles } from 'lucide-react'
import { cn } from '@utils/cn'

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
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={cn(className)}
      title={title}
    >
      {showIcon && <Sparkles size={16} className="mr-2" />}
      {children || (showText && 'Generate Workout')}
    </Button>
  )
}

export default GenerateWorkoutButton
