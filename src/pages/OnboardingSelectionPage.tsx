import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profile.store'
import { useTranslations } from '../stores/i18n.store'

const OnboardingSelectionPage: React.FC = () => {
  const navigate = useNavigate()
  const { importProfile } = useProfileStore()
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStartNewProfile = () => {
    navigate('/onboarding/goals')
  }

  const handleImportProfile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      await importProfile(jsonData)
      navigate('/')
    } catch (error) {
      console.error('Failed to import profile:', error)
      alert('Failed to import profile. Please check the file format.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.onboarding.title}
          </h1>
          <p className="text-gray-600 mb-8">
            Choose how you want to set up your profile
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleStartNewProfile}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create New Profile
            </button>
            
            <button
              onClick={handleImportProfile}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Import Existing Profile
            </button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default OnboardingSelectionPage
