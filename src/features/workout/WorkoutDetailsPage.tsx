import React from 'react'
import { useParams } from 'react-router-dom'

const WorkoutDetailsPage: React.FC = () => {
  const { id } = useParams()
  // const t = useTranslations() // Will be used later

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Workout Details
          </h1>
          <p className="text-lg text-gray-600">
            Details for workout {id}
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkoutDetailsPage
