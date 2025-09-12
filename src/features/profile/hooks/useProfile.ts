import { useMemo } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useI18nStore } from '@stores/i18n.store'

export interface ProfileData {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  goal: string
  constraints: string[]
  equipment: string[]
  frequency: number
  duration: number
  language: 'en' | 'ru'
  goalsDetailed: string
  createdAt: string
  updatedAt: string
}

export function useProfile() {
  const profile = useProfileStore(s => s.profile)
  const { setLanguage } = useI18nStore()

  const updateLanguage = (language: 'en' | 'ru') => {
    setLanguage(language)
  }

  const isComplete = useMemo(() => {
    if (!profile) return false
    
    const requiredFields = ['name', 'age', 'height', 'weight', 'gender', 'goal', 'frequency', 'duration']
    return requiredFields.every(field => {
      const value = profile[field as keyof typeof profile]
      return value !== undefined && value !== null && value !== ''
    })
  }, [profile])

  const bmi = useMemo(() => {
    if (!profile || !profile.height || !profile.weight) return null
    
    const heightInMeters = profile.height / 100
    return Math.round((profile.weight / (heightInMeters * heightInMeters)) * 10) / 10
  }, [profile])

  const bmiCategory = useMemo(() => {
    if (!bmi) return null
    
    if (bmi < 18.5) return 'underweight'
    if (bmi < 25) return 'normal'
    if (bmi < 30) return 'overweight'
    return 'obese'
  }, [bmi])

  return {
    profile,
    isComplete,
    bmi,
    bmiCategory,
    updateLanguage
  }
}
