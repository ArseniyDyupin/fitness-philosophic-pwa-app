import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'

const Header: React.FC = () => {
  const t = useTranslations()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
            {t.aiTrainer}
          </Link>
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
        </div>
      </div>
    </header>
  )
}

export default Header
