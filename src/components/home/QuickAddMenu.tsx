import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Type, X } from 'lucide-react'

interface QuickAddMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenTextParser?: () => void
}

const QuickAddMenu: React.FC<QuickAddMenuProps> = ({
  isOpen,
  onClose,
  onOpenTextParser
}) => {
  const navigate = useNavigate()

  const handleFormWorkout = () => {
    navigate('/workouts')
    onClose()
  }

  const handleTextWorkout = () => {
    onOpenTextParser?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]">
        <div className="flex items-center justify-between mb-2 px-2 py-1">
          <span className="text-sm font-medium text-gray-700">Add Workout</span>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-1">
          <button
            onClick={handleFormWorkout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Form Entry</span>
          </button>
          
          <button
            onClick={handleTextWorkout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Type className="w-4 h-4 text-green-500" />
            <span>Text Parser</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default QuickAddMenu
