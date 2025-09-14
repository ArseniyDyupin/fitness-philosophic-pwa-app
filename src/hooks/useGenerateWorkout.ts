import { useState } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useWorkoutStore } from '@stores/workout.store'
import { useAIStore } from '@stores/ai.store'
import { toastSuccess, toastError } from '@lib/toast'
import { useTranslations } from '@stores/i18n.store'
import { aiService } from '@services/ai'

export interface GenerateWorkoutOptions {
  dateISO?: string
  focus?: string
  duration?: number
  equipment?: string[]
  preferences?: string
}

export function useGenerateWorkout() {
  const t = useTranslations()
  const profile = useProfileStore(s => s.profile)
  const { createWorkout } = useWorkoutStore()
  const { hasKey } = useAIStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const generate = async (options: GenerateWorkoutOptions = {}) => {
    if (!profile) {
      toastError(t.error || 'Profile not found')
      return { success: false, error: 'Profile not found' }
    }

    if (!hasKey) {
      toastError(t.aiSettings?.pleaseEnterKey || 'Please enter an API key')
      return { success: false, error: 'API key required' }
    }

    setIsGenerating(true)
    try {

      // Generate workout plan using AI
      const generatedWorkout = await aiService.generateNextWorkout(profile, [], 'en', options.preferences)
      
      if (!generatedWorkout) {
        throw new Error('Failed to generate workout')
      }

      // Save the generated workout
      const workoutData = {
        name: generatedWorkout.title || 'Generated Workout',
        description: generatedWorkout.description || '',
        date: options.dateISO || new Date().toISOString().split('T')[0],
        exercises: generatedWorkout.exercises || [],
        rpe: 0,
        notes: generatedWorkout.notes || '',
        isPlan: true
      }

      const workoutId = await createWorkout(workoutData)
      
      toastSuccess(t.plan?.generateSuccess || 'Workout generated successfully')
      
      return { 
        success: true, 
        workoutId,
        workout: generatedWorkout
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Failed to generate workout')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generate,
    isGenerating,
    canGenerate: !!profile && hasKey
  }
}
