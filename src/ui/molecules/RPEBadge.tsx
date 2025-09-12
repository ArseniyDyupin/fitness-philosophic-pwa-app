import React from 'react'
import { Badge } from '@atoms'
import { cn } from '@utils/cn'

export interface RPEBadgeProps {
  rpe: number
  className?: string
}

const RPEBadge: React.FC<RPEBadgeProps> = ({ rpe, className }) => {
  const getRPEInfo = (rpe: number) => {
    if (rpe <= 3) return { label: 'Easy', variant: 'success' as const }
    if (rpe <= 5) return { label: 'Light', variant: 'success' as const }
    if (rpe <= 7) return { label: 'Moderate', variant: 'warning' as const }
    if (rpe <= 9) return { label: 'Hard', variant: 'danger' as const }
    return { label: 'Max', variant: 'danger' as const }
  }

  const { label, variant } = getRPEInfo(rpe)

  return (
    <Badge
      variant={variant}
      size="sm"
      className={cn('font-mono', className)}
    >
      RPE {rpe} - {label}
    </Badge>
  )
}

export default RPEBadge
