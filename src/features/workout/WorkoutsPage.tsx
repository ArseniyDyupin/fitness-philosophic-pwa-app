import React from 'react'
import { useTranslations } from '../../stores/i18n.store'

const WorkoutsPage: React.FC = () => {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">{t.workouts}</h1>
            <button className="btn-primary">
              {t.addWorkout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Workouts Page
          </h2>
          <p className="text-lg text-gray-600">
            This page will show the list of workouts
          </p>
        </div>
      </main>
    </div>
  )
}

export default WorkoutsPage
