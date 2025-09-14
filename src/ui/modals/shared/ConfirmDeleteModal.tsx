/**
 * Confirmation modal for delete actions
 */

import { AlertTriangle, X } from 'lucide-react'
import Button from '@/ui/atoms/Button'
import Modal from '@/ui/atoms/Modal'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  type?: 'danger' | 'warning'
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'danger'
}: ConfirmDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="focus-visible-ring"
    >
      <div 
        className="p-6 focus-visible-ring"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              type === 'danger' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hit-44-sm focus-visible-ring rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть модальное окно"
            title="Закрыть модальное окно"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="focus-visible-ring"
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={isLoading}
            className="focus-visible-ring"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
