import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'

const OnboardingEquipment: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile } = useProfileStore()
  const t = useTranslations()
  
  const [equipment, setEquipment] = useState<string[]>([])

  const equipmentOptions = [
    { value: 'none', label: 'No equipment (bodyweight only)' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'resistance_bands', label: 'Resistance bands' },
    { value: 'pullup_bar', label: 'Pull-up bar' },
    { value: 'yoga_mat', label: 'Yoga mat' },
    { value: 'treadmill', label: 'Treadmill' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'gym_access', label: 'Gym access' }
  ]

  const handleEquipmentToggle = (equipmentValue: string) => {
    if (equipmentValue === 'none') {
      setEquipment([])
    } else {
      setEquipment(prev => 
        prev.includes(equipmentValue) 
          ? prev.filter(e => e !== equipmentValue)
          : [...prev, equipmentValue]
      )
    }
  }

  const handleNext = async () => {
    try {
      await saveProfile({ equipment })
      navigate('/onboarding/metrics')
    } catch (error) {
      console.error('Failed to save equipment:', error)
      alert('Failed to save equipment')
    }
  }

  const handleBack = () => {
    navigate('/onboarding/detailed-goals')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What equipment do you have?
          </h1>
          <p className="text-gray-600">
            Select all that apply
          </p>
        </div>

        <div className="space-y-6">
          {/* Equipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available equipment
            </label>
            <div className="space-y-2">
              {equipmentOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={equipment.includes(option.value)}
                    onChange={() => handleEquipmentToggle(option.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between space-x-4 pt-4">
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              {t.previous}
            </button>
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingEquipment
