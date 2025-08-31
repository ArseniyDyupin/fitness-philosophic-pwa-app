import type { AIWorkoutReview, AIWorkoutPayload, AIWeeklyAdvicePayload } from '@/types/ai'

export class AIService {
  private apiKey: string = ''
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  setApiKey(key: string) {
    this.apiKey = key
  }

  private async makeRequest(prompt: string, abortController?: AbortController): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a fitness coach AI. Always respond with valid JSON only. No additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
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
    return data.choices[0]?.message?.content || ''
  }

  async reviewWorkout(payload: AIWorkoutPayload, abortController?: AbortController): Promise<AIWorkoutReview> {
    const prompt = `Analyze this workout and provide a JSON response with analysis and next workout recommendation.

Workout: ${JSON.stringify(payload.workout)}
Profile: ${JSON.stringify(payload.profile)}
Recent workouts: ${JSON.stringify(payload.recentWorkouts)}

Respond with JSON in this exact format:
{
  "analysis": "Brief analysis of the workout performance",
  "nextWorkout": {
    "type": "workout_type",
    "durationMin": 30,
    "description": "Detailed description of the next workout",
    "tips": ["tip1", "tip2", "tip3"]
  }
}`

    try {
      const response = await this.makeRequest(prompt, abortController)
      const parsed = JSON.parse(response)
      
      // Validate response structure
      if (!parsed.analysis || !parsed.nextWorkout) {
        throw new Error('Invalid AI response format')
      }
      
      return parsed as AIWorkoutReview
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('AI returned invalid JSON response')
      }
      throw error
    }
  }

  async getWeeklyAdvice(payload: AIWeeklyAdvicePayload, abortController?: AbortController): Promise<string> {
    const prompt = `Provide weekly fitness advice based on this data. Respond with a brief, actionable advice paragraph.

Week data: ${JSON.stringify(payload)}

Keep the response concise and practical. Focus on one main recommendation.`

    return await this.makeRequest(prompt, abortController)
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Respond with "OK"')
      return true
    } catch {
      return false
    }
  }
}

export const aiService = new AIService()
