import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'
import type { Goal } from '../../types/models'

const OnboardingGoals: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile } = useProfileStore()
  const t = useTranslations()
  
  const [goals, setGoals] = useState<('weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness')[]>([])
  const [targetWeight, setTargetWeight] = useState('')
  const [targetEvent, setTargetEvent] = useState('')
  const [description, setDescription] = useState('')

  const goalOptions: Array<{ value: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness'; label: string }> = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'strength', label: 'Strength' },
    { value: 'general_fitness', label: 'General Fitness' }
  ]

  const handleGoalToggle = (goalValue: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness') => {
    setGoals(prev => 
      prev.includes(goalValue) 
        ? prev.filter(g => g !== goalValue)
        : [...prev, goalValue]
    )
  }

  const handleNext = async () => {
    if (goals.length === 0) {
      alert('Please select at least one goal')
      return
    }

    try {
      const goal: Goal = {
        types: goals,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        targetEvent: targetEvent || undefined,
        description: description || ''
      }

      // Update existing profile with goals
      await saveProfile({
        goal,
        goalsDetailed: description || ''
      })

      navigate('/onboarding/constraints')
    } catch (error) {
      console.error('Failed to save goals:', error)
      alert('Failed to save goals')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What are your fitness goals?
          </h1>
          <p className="text-gray-600">
            Select all that apply
          </p>
        </div>

        <div className="space-y-6">
          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Goals
            </label>
            <div className="space-y-2">
              {goalOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={goals.includes(option.value)}
                    onChange={() => handleGoalToggle(option.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weight (kg) - Optional
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 70"
            />
          </div>

          {/* Target Event */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Event - Optional
            </label>
            <input
              type="text"
              value={targetEvent}
              onChange={(e) => setTargetEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Marathon in 6 months"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Description - Optional
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe your fitness journey..."
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={handleNext}
              disabled={goals.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingGoals
