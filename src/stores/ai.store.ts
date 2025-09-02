import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { db, dbHelpers } from '@/services/db'
import { aiService } from '@/services/ai'
import { useProfileStore } from './profile.store'
import { useWorkoutsStore } from './workouts.store'
import type { AIPlan } from '@/types/models'
import type { AIWorkoutPayload, AIWeeklyAdvicePayload } from '@/types/ai'

export const useAIStore = defineStore('ai', () => {
  const aiPlans = ref<AIPlan[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const apiKey = ref<string>('')
  
  const profileStore = useProfileStore()
  const workoutsStore = useWorkoutsStore()

  // Computed properties
  const hasApiKey = computed(() => apiKey.value.length > 0)
  const latestPlan = computed(() => aiPlans.value[0])

  // Actions
  async function loadAIPlans() {
    isLoading.value = true
    error.value = null
    
    try {
      aiPlans.value = await db.aiPlans.orderBy('createdAt').reverse().toArray()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load AI plans'
    } finally {
      isLoading.value = false
    }
  }

  async function setApiKey(key: string) {
    apiKey.value = key
    aiService.setApiKey(key)
    
    // Store in localStorage for persistence
    localStorage.setItem('ai-api-key', key)
  }

  async function loadApiKey() {
    const storedKey = localStorage.getItem('ai-api-key')
    if (storedKey) {
      await setApiKey(storedKey)
    }
  }

  async function clearApiKey() {
    apiKey.value = ''
    aiService.setApiKey('')
    localStorage.removeItem('ai-api-key')
  }

  async function testConnection(): Promise<boolean> {
    if (!hasApiKey.value) {
      throw new Error('API key not set')
    }
    
    return await aiService.testConnection()
  }

  async function reviewWorkout(workoutId: string): Promise<AIPlan> {
    isLoading.value = true
    error.value = null
    
    try {
      if (!hasApiKey.value) {
        throw new Error('API key not set')
      }

      const workout = await workoutsStore.getWorkoutById(workoutId)
      if (!workout) {
        throw new Error('Workout not found')
      }

      const profile = profileStore.profile
      if (!profile) {
        throw new Error('Profile not found')
      }

      // Get recent workouts for context
      const recentWorkouts = workoutsStore.recentWorkouts
        .filter(w => w.id !== workoutId)
        .slice(0, 5)
        .map(w => ({
          type: w.type,
          durationMin: w.durationMin,
          calories: w.calories,
          date: w.date.toISOString()
        }))

      const payload: AIWorkoutPayload = {
        workout: {
          type: workout.type,
          durationMin: workout.durationMin,
          calories: workout.calories,
          date: workout.date.toISOString(),
          notes: workout.notes,
          distance: workout.distance,
          reps: workout.reps,
          sets: workout.sets,
          weight: workout.weight,
          customExercise: workout.customExercise
        },
        profile: {
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          goal: {
            type: profile.goal.type,
            description: profile.goal.description
          },
          constraints: [...profile.constraints],
          goalsDetailed: profile.goalsDetailed || ''
        },
        recentWorkouts
      }

      const review = await aiService.reviewWorkout(payload)
      
      const aiPlan: AIPlan = {
        id: crypto.randomUUID(),
        workoutId,
        analysis: review.analysis,
        nextWorkout: {
          type: review.nextWorkout.type as any,
          durationMin: review.nextWorkout.durationMin,
          description: review.nextWorkout.description,
          tips: review.nextWorkout.tips
        },
        createdAt: new Date()
      }

      await db.aiPlans.add(aiPlan)
      aiPlans.value.unshift(aiPlan)
      
      return aiPlan
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to review workout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getWeeklyAdvice(payload: AIWeeklyAdvicePayload): Promise<string> {
    if (!hasApiKey.value) {
      throw new Error('API key not set')
    }
    
    return await aiService.getWeeklyAdvice(payload)
  }

  async function getPlanByWorkout(workoutId: string): Promise<AIPlan | undefined> {
    return await dbHelpers.getAIPlanByWorkout(workoutId)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    aiPlans: readonly(aiPlans),
    isLoading: readonly(isLoading),
    error: readonly(error),
    apiKey: readonly(apiKey),
    
    // Computed
    hasApiKey,
    latestPlan,
    
    // Actions
    loadAIPlans,
    setApiKey,
    loadApiKey,
    clearApiKey,
    testConnection,
    reviewWorkout,
    getWeeklyAdvice,
    getPlanByWorkout,
    clearError
  }
})
