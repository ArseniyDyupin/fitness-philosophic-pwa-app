import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import Header from '../components/Header'

const HomePage: React.FC = () => {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.welcome}
          </h2>
          <p className="text-lg text-gray-600">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/workouts"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🏃</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.workouts}
            </h3>
            <p className="text-gray-600">
              Track your workouts and get AI analysis
            </p>
          </Link>

          <Link
            to="/food"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🍎</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.food}
            </h3>
            <p className="text-gray-600">
              Log your nutrition and track calories
            </p>
          </Link>

          <Link
            to="/weekly"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.weekly}
            </h3>
            <p className="text-gray-600">
              Weekly check-ins and progress tracking
            </p>
          </Link>

          <Link
            to="/settings"
            className="card hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.settings}
            </h3>
            <p className="text-gray-600">
              Manage your profile and preferences
            </p>
          </Link>
        </div>

        {/* Add Workout Button */}
        <div className="text-center">
          <Link
            to="/workouts"
            className="btn-primary text-lg px-8 py-3"
          >
            {t.addWorkout}
          </Link>
        </div>
      </main>
    </div>
  )
}

export default HomePage
