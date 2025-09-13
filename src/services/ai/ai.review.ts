import { z } from 'zod'
import type { WorkoutExercise, AIWorkoutFeedback } from '@/types/models'
import { db, dbHelpers } from '../data/db'

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
  private apiKey: string = ''
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  constructor() {
    this.initializeApiKey()
  }

  private initializeApiKey() {
    // First, try to get API key from environment variables (for production)
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envApiKey && envApiKey !== 'your_openai_api_key_here') {
      this.apiKey = envApiKey
      return
    }

    // Fallback to localStorage (for development/user input)
    const storedApiKey = localStorage.getItem('ai-trainer:openai-api-key')
    if (storedApiKey) {
      this.apiKey = storedApiKey
    }
  }

  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_openai_api_key_here'
  }

  private async makeRequest(payload: AIReviewPayload, abortController?: AbortController): Promise<AIReviewResult> {
    if (!this.apiKey) {
      throw new Error('API key not set')
    }

    const systemPrompt = payload.language === 'ru' 
      ? 'Ты — спортивный тренер и аналитик. Верни ТОЛЬКО JSON.\nОцени интенсивность тренировки по шкале RPE (1–10) и дай краткий, конструктивный фидбэк.\nЯзык ответа = language из payload.\nФормат ответа строго:\n{"rpe": number, "review": string}'
      : 'You are a sports coach and analyst. Return ONLY JSON.\nRate the workout intensity on RPE scale (1-10) and give brief, constructive feedback.\nResponse language = language from payload.\nStrict response format:\n{"rpe": number, "review": string}'

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: JSON.stringify(payload)
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      }),
      signal: abortController?.signal
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else if (response.status >= 500) {
        throw new Error('AI service temporarily unavailable')
      } else {
        throw new Error(`AI request failed: ${response.status}`)
      }
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    if (!content) {
      throw new Error('No content in AI response')
    }

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
    const workout = await db.workouts.get(workoutId)
    if (!workout) {
      throw new Error('Workout not found')
    }

    // 2) Get profile data
    const profile = await dbHelpers.getProfile()
    if (!profile) {
      throw new Error('Profile not found')
    }

    // 3) Get recent workouts (last 3-5)
    const recentWorkouts = await dbHelpers.getWorkouts(5)
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

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), 15000) // 15 second timeout

        const result = await this.makeRequest(payload, abortController)
        clearTimeout(timeoutId)

        // 6) Save results to database
        const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const feedback: AIWorkoutFeedback = {
          id: feedbackId,
          workoutId: workoutId,
          language: profile.language,
          rpe: result.rpe,
          review: result.review,
          model: 'gpt-4o-mini',
          createdAt: new Date().toISOString()
        }

        // Save feedback
        await dbHelpers.saveAIFeedback(feedback)

        // Update workout with RPE and feedback ID
        const updatedWorkout = {
          ...workout,
          rpe: result.rpe,
          aiReviewId: feedbackId,
          updatedAt: new Date().toISOString()
        }

        await db.workouts.put(updatedWorkout)

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
      }
    }

    throw lastError || new Error('Failed to get AI review after retries')
  }
}

export const aiReviewService = new AIReviewService()
