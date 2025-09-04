import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import OnboardingLayout from '../../components/OnboardingLayout'

const OnboardingEquipment: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  
  const [equipment, setEquipment] = useState<string[]>(draft.equipment || [])

  const equipmentOptions = [
    'dumbbells',
    'barbell',
    'kettlebell',
    'resistance_bands',
    'pull_up_bar',
    'bench',
    'treadmill',
    'bicycle',
    'yoga_mat',
    'none'
  ]

  const equipmentLabels: Record<string, string> = {
    dumbbells: 'Dumbbells',
    barbell: 'Barbell',
    kettlebell: 'Kettlebell',
    resistance_bands: 'Resistance Bands',
    pull_up_bar: 'Pull-up Bar',
    bench: 'Bench',
    treadmill: 'Treadmill',
    bicycle: 'Bicycle',
    yoga_mat: 'Yoga Mat',
    none: 'No equipment'
  }

  useEffect(() => {
    updateDraft({ equipment })
  }, [equipment, updateDraft])

  const handleEquipmentToggle = (equipmentItem: string) => {
    if (equipmentItem === 'none') {
      setEquipment([])
    } else {
      setEquipment(prev => 
        prev.includes(equipmentItem) 
          ? prev.filter(e => e !== equipmentItem)
          : [...prev.filter(e => e !== 'none'), equipmentItem]
      )
    }
  }

  return (
    <OnboardingLayout
      stepNumber={2}
      stepTitle="Available Equipment"
      stepDescription="What fitness equipment do you have access to?"
      canProceed={true}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select all the equipment you have available for workouts
          </label>
          <div className="space-y-3">
            {equipmentOptions.map(equipmentItem => (
              <label key={equipmentItem} className="flex items-center">
                <input
                  type="checkbox"
                  checked={equipment.includes(equipmentItem)}
                  onChange={() => handleEquipmentToggle(equipmentItem)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">{equipmentLabels[equipmentItem]}</span>
              </label>
            ))}
          </div>
        </div>

        {equipment.length > 0 && equipment.filter(e => e !== 'none').length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Great! We'll create workouts that make the most of your available equipment.
            </p>
          </div>
        )}

        {equipment.includes('none') && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              No problem! We'll focus on bodyweight exercises and minimal equipment workouts.
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingEquipment
