import React from 'react'
import { cn } from '@utils/cn'
import { useModalFocus } from '@/hooks/useModalFocus'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className
}) => {
  const dialogRef = useModalFocus<HTMLDivElement>(isOpen, onClose)

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-sm sm:max-w-lg',
    lg: 'max-w-sm sm:max-w-2xl',
    xl: 'max-w-sm sm:max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'shared-modal-title' : undefined}
          tabIndex={-1}
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full',
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 id="shared-modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="hit-44 focus-visible-ring text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
