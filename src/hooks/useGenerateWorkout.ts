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
      // Build payload for AI generation
      const payload = {
        profile: {
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          goal: profile.goal,
          constraints: profile.constraints || [],
          equipment: profile.equipment || [],
          frequency: profile.frequency,
          duration: options.duration || profile.duration
        },
        preferences: {
          focus: options.focus,
          equipment: options.equipment || profile.equipment || [],
          date: options.dateISO
        }
      }

      // Generate workout plan using AI
      const generatedWorkout = await aiService.generateWorkout(payload)
      
      if (!generatedWorkout) {
        throw new Error('Failed to generate workout')
      }

      // Save the generated workout
      const workoutData = {
        name: generatedWorkout.name || 'Generated Workout',
        description: generatedWorkout.description || '',
        date: options.dateISO || new Date().toISOString().split('T')[0],
        exercises: generatedWorkout.exercises || [],
        rpe: generatedWorkout.rpe || 0,
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
