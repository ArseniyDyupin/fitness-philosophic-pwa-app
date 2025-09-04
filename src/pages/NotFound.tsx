import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'

const NotFound: React.FC = () => {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="btn-primary"
        >
          {t.home}
        </Link>
      </div>
    </div>
  )
}

export default NotFound
