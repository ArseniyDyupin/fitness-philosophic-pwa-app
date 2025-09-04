import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import { downloadExport } from '../services/export'
import { Download, Check, X } from 'lucide-react'

const Header: React.FC = () => {
  const t = useTranslations()
  const [isExporting, setIsExporting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadExport()
      showToast(t.exportSuccess || 'Data exported successfully', 'success')
    } catch (error) {
      console.error('Export failed:', error)
      showToast(t.error || 'Export failed', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
            {t.aiTrainer}
          </Link>
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/workouts" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t.workouts}
              </Link>
              <Link to="/food" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t.food}
              </Link>
              <Link to="/weekly" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t.weekly}
              </Link>
              <Link to="/settings" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t.settings}
              </Link>
            </nav>
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              ) : (
                <Download size={16} />
              )}
              <span>{t.exportAll || 'Export Data'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <X size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
