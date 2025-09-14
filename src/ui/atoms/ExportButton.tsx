import React from 'react'
import Button from './Button'
import { Download } from 'lucide-react'

export interface ExportButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  children,
  className
}) => {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      className={className}
    >
      <Download size={16} className="mr-2" />
      {children || 'Export'}
    </Button>
  )
}

export default ExportButton
