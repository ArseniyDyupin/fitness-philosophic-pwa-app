import { z } from 'zod'
import type { WorkoutExercise, AIWorkoutFeedback } from '@/types/models'
import { dbHelpers } from '../data/db'
import { aiGateway } from './aiGateway'
import { workoutService } from '@/application/workouts/workoutService'
import { profileService } from '@/application/profile/profileService'

export interface AIReviewPayload {
  language: "ru" | "en"
  profile: {
    sex?: string
    age?: number
    heightCm?: number
    weightKg?: number
    goal?: { types: string[]; description?: string }
  }
  workout: { date: string; exercises: WorkoutExercise[] }
  recentWorkouts?: Array<{ date: string; exercises: WorkoutExercise[]; rpe?: number }> // можно 3–5 последних
}

export interface AIReviewResult {
  rpe: number        // 1..10
  review: string     // 2–6 абзацев краткого анализа
}

const AIReviewResponseSchema = z.object({
  rpe: z.number().min(1).max(10),
  review: z.string().min(50).max(1200)
})

export class AIReviewService {
  private async makeRequest(payload: AIReviewPayload, abortController?: AbortController): Promise<AIReviewResult> {
    const systemPrompt = payload.language === 'ru' 
      ? 'Ты — опытный спортивный тренер с позитивным подходом. Твоя задача — мотивировать и вдохновлять, давая конструктивную обратную связь. Оцени интенсивность тренировки по шкале RPE (1–10) и дай вдохновляющий, но честный фидбэк. Верни ТОЛЬКО JSON.\nЯзык ответа = language из payload.\nФормат ответа строго:\n{"rpe": number, "review": string}\nВ review подчеркивай достижения и давай мотивирующие советы.'
      : 'You are an experienced sports coach with a positive approach. Your goal is to motivate and inspire while giving constructive feedback. Rate the workout intensity on RPE scale (1-10) and give inspiring but honest feedback. Return ONLY JSON.\nResponse language = language from payload.\nStrict response format:\n{"rpe": number, "review": string}\nIn review, highlight achievements and provide motivating advice.'

    const content = await aiGateway.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      temperature: 0.2,
      maxTokens: 300,
      signal: abortController?.signal
    })

    try {
      // Try to extract JSON from response
      let jsonContent = content.trim()
      
      // If response contains text with JSON, extract the JSON part
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonContent = jsonMatch[0]
      }

      const parsed = JSON.parse(jsonContent)
      const validated = AIReviewResponseSchema.parse(parsed)
      
      // Ensure RPE is in valid range
      validated.rpe = Math.max(1, Math.min(10, Math.round(validated.rpe)))
      
      return validated
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('AI returned invalid JSON response')
      }
      throw error
    }
  }

  async reviewWorkout(workoutId: string): Promise<AIReviewResult> {
    // 1) Get workout data
    const workout = await workoutService.getById(workoutId)
    if (!workout) {
      throw new Error('Workout not found')
    }

    // 2) Get profile data
    const profile = await profileService.get()
    if (!profile) {
      throw new Error('Profile not found')
    }

    // 3) Get recent workouts (last 3-5)
    const recentWorkouts = (await workoutService.list()).slice(0, 5)
    const recentWorkoutsForAI = recentWorkouts
      .filter(w => w.id !== workoutId)
      .slice(0, 3)
      .map(w => ({
        date: w.date,
        exercises: w.exercises,
        rpe: w.rpe
      }))

    // 4) Prepare payload
    const payload: AIReviewPayload = {
      language: profile.language,
      profile: {
        sex: profile.gender,
        age: profile.age,
        heightCm: profile.height,
        weightKg: profile.weight,
        goal: {
          types: [profile.goal],
          description: profile.goalsDetailed
        }
      },
      workout: {
        date: workout.date,
        exercises: workout.exercises
      },
      recentWorkouts: recentWorkoutsForAI
    }

    // 5) Call AI with timeout and retries
    const maxRetries = 2
    let lastError: Error | null = null
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    const feedbackCreatedAt = new Date().toISOString()

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 15000) // 15 second timeout
      try {
        const result = await this.makeRequest(payload, abortController)

        // 6) Save results to database
        const feedback: AIWorkoutFeedback = {
          id: feedbackId,
          workoutId: workoutId,
          language: profile.language,
          rpe: result.rpe,
          review: result.review,
          model: 'gpt-4o-mini',
          createdAt: feedbackCreatedAt
        }

        // Save feedback
        await dbHelpers.saveAIFeedback(feedback)

        // Update workout with RPE and feedback ID
        await workoutService.update(workout.id, {
          rpe: result.rpe,
          aiReviewId: feedbackId
        })

        return result
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (error instanceof Error && (
          error.message.includes('Invalid API key') ||
          error.message.includes('Rate limit exceeded') ||
          error.message.includes('temporarily unavailable')
        )) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    throw lastError || new Error('Failed to get AI review after retries')
  }
}

export const aiReviewService = new AIReviewService()
