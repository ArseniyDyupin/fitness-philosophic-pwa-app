import React, { useState } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { Plus, BarChart3 } from 'lucide-react'
import BodyMetricsModal from '@modals/home/BodyMetricsModal'

const BodyMetricsActionBlock: React.FC = () => {
  const t = useTranslations()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t.metrics?.addMetrics || 'Add Body Metrics'}
              </h3>
              <p className="text-sm text-gray-600">
                {t.metrics?.addMetricsDescription || 'Track your body measurements and progress'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.metrics?.addMetrics || 'Add Metrics'}
          </button>
        </div>
      </div>

      <BodyMetricsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default BodyMetricsActionBlock
