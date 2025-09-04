import React from 'react'
import { useTranslations } from '../../stores/i18n.store'

const WeeklyPage: React.FC = () => {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t.weekly}
          </h1>
          <p className="text-lg text-gray-600">
            Weekly check-ins page coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

export default WeeklyPage
