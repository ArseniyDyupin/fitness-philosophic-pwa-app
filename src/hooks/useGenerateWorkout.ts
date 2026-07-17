import { useState } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useAIStore } from '@stores/ai.store'
import { toastSuccess, toastError } from '@lib/toast'
import { useTranslations } from '@stores/i18n.store'
import { aiService } from '@services/ai'
import { todayLocalDate } from '@/domain/date/localDate'
import { planService } from '@/application/plans/planService'

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

      const workoutDate = options.dateISO || todayLocalDate()
      const plan = await planService.saveGeneratedPlan({
        ...generatedWorkout,
        forDate: workoutDate,
        workoutTemplate: generatedWorkout.workoutTemplate
          ? { ...generatedWorkout.workoutTemplate, date: workoutDate }
          : undefined
      })
      const workoutId = plan.workoutTemplate!.id
      
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
