import type { AIWorkoutReview, AIWorkoutPayload } from '@/types/ai'
import type { Profile, Workout, PlanSuggestion } from '@/types/models'
import { z } from 'zod'
import { todayLocalDate, toLocalDate } from '@/domain/date/localDate'
import { aiGateway, aiKeyStore } from './aiGateway'

export class AIService {
  setApiKey(key: string) {
    aiKeyStore.set(key)
  }

  getApiKey(): string {
    return aiKeyStore.get()
  }

  hasApiKey(): boolean {
    return aiKeyStore.has()
  }

  async generateResponse(prompt: string, language: 'en' | 'ru' = 'en', abortController?: AbortController): Promise<string> {
    return this.makeRequest(prompt, language, abortController)
  }

  private async makeRequest(prompt: string, language: 'en' | 'ru' = 'en', abortController?: AbortController): Promise<string> {
    const systemPrompt = language === 'ru' 
      ? 'Ты — опытный ИИ-тренер по фитнесу с позитивным подходом. Твоя задача — мотивировать и вдохновлять пользователей, помогая им достигать своих целей. Всегда отвечай только валидным JSON. Никакого дополнительного текста.'
      : 'You are an experienced AI fitness coach with a positive approach. Your goal is to motivate and inspire users, helping them achieve their goals. Always respond with valid JSON only. No additional text.'

    return aiGateway.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1000,
      signal: abortController?.signal
    })
  }

  async reviewWorkout(payload: AIWorkoutPayload, language: 'en' | 'ru' = 'en', abortController?: AbortController): Promise<AIWorkoutReview> {
    const prompt = language === 'ru' 
      ? `Проанализируйте эту тренировку и предоставьте JSON-ответ с анализом и рекомендацией следующей тренировки.

Тренировка: ${JSON.stringify(payload.workout)}
Профиль: ${JSON.stringify(payload.profile)}
Недавние тренировки: ${JSON.stringify(payload.recentWorkouts)}

Ответьте JSON в точном формате:
{
  "analysis": "Краткий анализ производительности тренировки",
  "nextWorkout": {
    "type": "тип_тренировки",
    "durationMin": 30,
    "description": "Подробное описание следующей тренировки",
    "tips": ["совет1", "совет2", "совет3"]
  }
}`
      : `Analyze this workout and provide a JSON response with analysis and next workout recommendation.

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
      const response = await this.makeRequest(prompt, language, abortController)
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


  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Respond with "OK"')
      return true
    } catch {
      return false
    }
  }

  async parseWorkoutText(workoutText: string, language: 'en' | 'ru' = 'ru', abortController?: AbortController): Promise<Array<{ type: string; details: Record<string, unknown> }>> {
    const exerciseSchema = {
      type: "string (run|pullups|pushups|plank|custom)",
      details: {
        // For run
        distanceKm: "number (optional)",
        durationMin: "number (optional)",
        // For pullups/pushups
        sets: "number (optional)",
        repsPerSet: "number[] (optional)",
        // For plank
        seconds: "number[] (optional)",
        // For custom
        customExercise: "string (optional)",
        // Common
        notes: "string (optional)"
      },
      kcalEstimated: "number (always 0 - will be calculated later)"
    }

    const prompt = language === 'ru'
      ? `Ты — опытный фитнес-тренер, который помогает пользователям структурировать их тренировки. Проанализируй описание тренировки и верни JSON массив упражнений в точном формате.

Текст тренировки: "${workoutText}"

Верни JSON массив объектов, где каждый объект имеет структуру:
${JSON.stringify(exerciseSchema, null, 2)}

Правила парсинга:
1. Тип упражнения (type):
   - "run" для бега/пробежки
   - "pullups" для подтягиваний
   - "pushups" для отжиманий
   - "plank" для планки
   - "custom" для других упражнений

2. Детали (details):
   - Для бега: distanceKm (расстояние в км), durationMin (время в минутах)
   - Для подтягиваний/отжиманий: sets (количество подходов), repsPerSet (массив повторений)
   - Для планки: seconds (массив времени удержания в секундах)
   - Для custom: customExercise (название упражнения), durationMin или repsPerSet

3. kcalEstimated всегда равно 0

Примеры:
- "пробежал 5 км" → [{"type": "run", "details": {"distanceKm": 5}, "kcalEstimated": 0}]
- "подтягивания 10-8-6" → [{"type": "pullups", "details": {"sets": 3, "repsPerSet": [10, 8, 6]}, "kcalEstimated": 0}]
- "планка 60 секунд" → [{"type": "plank", "details": {"seconds": [60]}, "kcalEstimated": 0}]

Верни ТОЛЬКО валидный JSON массив, никакого дополнительного текста. Помни: каждая тренировка — это шаг к цели!`
      : `You are an experienced fitness trainer helping users structure their workouts. Analyze the workout description and return a JSON array of exercises in the exact format.

Workout text: "${workoutText}"

Return a JSON array of objects where each object has the structure:
${JSON.stringify(exerciseSchema, null, 2)}

Parsing rules:
1. Exercise type (type):
   - "run" for running/jogging
   - "pullups" for pull-ups
   - "pushups" for push-ups
   - "plank" for plank holds
   - "custom" for other exercises

2. Details (details):
   - For running: distanceKm (distance in km), durationMin (time in minutes)
   - For pullups/pushups: sets (number of sets), repsPerSet (array of repetitions)
   - For plank: seconds (array of hold times in seconds)
   - For custom: customExercise (exercise name), durationMin or repsPerSet

3. kcalEstimated is always 0

Examples:
- "ran 5 km" → [{"type": "run", "details": {"distanceKm": 5}, "kcalEstimated": 0}]
- "pull-ups 10-8-6" → [{"type": "pullups", "details": {"sets": 3, "repsPerSet": [10, 8, 6]}, "kcalEstimated": 0}]
- "plank 60 seconds" → [{"type": "plank", "details": {"seconds": [60]}, "kcalEstimated": 0}]

Return ONLY valid JSON array, no additional text. Remember: every workout is a step towards your goal!`

    try {
      const response = await this.makeRequest(prompt, language, abortController)
      const parsed = JSON.parse(response)
      
      // Validate response structure
      if (!Array.isArray(parsed)) {
        throw new Error('AI returned invalid response format - expected array')
      }

      // Validate each exercise object
      for (const exercise of parsed) {
        if (!exercise.type || typeof exercise.type !== 'string') {
          throw new Error('Invalid exercise format - missing or invalid type')
        }
        if (!exercise.details || typeof exercise.details !== 'object') {
          throw new Error('Invalid exercise format - missing or invalid details')
        }
        if (typeof exercise.kcalEstimated !== 'number') {
          exercise.kcalEstimated = 0 // Fix if missing
        }
      }
      
      return parsed
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('AI returned invalid JSON response')
      }
      throw error
    }
  }

  // Generate next workout plan
  async generateNextWorkout(profile: Profile, recentWorkouts: Workout[], language: string = 'ru', additionalPrompt?: string): Promise<PlanSuggestion> {
    if (!this.hasApiKey()) {
      throw new Error('API key not configured')
    }

    const systemPrompt = language === 'ru' 
      ? `Ты — опытный персональный тренер с позитивным подходом. Твоя задача — мотивировать и вдохновлять, давая конструктивные советы. Будь поддерживающим, но честным. Верни ТОЛЬКО JSON без текста.

Формат:
{
  "review": string,
  "next_workout": {
    "date": "YYYY-MM-DD" | null,
    "rpe": number | null,
    "exercises": WorkoutExercise[]
  },
  "tips": string[]
}

Где WorkoutExercise:
{ "type":"run"|"pullups"|"pushups"|"plank"|"custom",
  "details":{ "distanceKm"?:number, "durationMin"?:number, "sets"?:number, "repsPerSet"?:number[], "seconds"?:number[], "customExercise"?:string, "notes"?:string }
}

В review и tips используй вдохновляющий, но не льстивый тон. Подчеркивай прогресс и давай практические советы.`
      : `You are an experienced personal trainer with a positive approach. Your goal is to motivate and inspire while giving constructive advice. Be supportive but honest. Return ONLY JSON without any text.

Format:
{
  "review": string,
  "next_workout": {
    "date": "YYYY-MM-DD" | null,
    "rpe": number | null,
    "exercises": WorkoutExercise[]
  },
  "tips": string[]
}

Where WorkoutExercise:
{ "type":"run"|"pullups"|"pushups"|"plank"|"custom",
  "details":{ "distanceKm"?:number, "durationMin"?:number, "sets"?:number, "repsPerSet"?:number[], "seconds"?:number[], "customExercise"?:string, "notes"?:string }
}

In review and tips, use an inspiring but not overly flattering tone. Highlight progress and give practical advice.`

    const userPrompt = language === 'ru'
      ? `Создай вдохновляющий план тренировки для пользователя, который стремится к своим целям:
- Возраст: ${profile.age} лет
- Пол: ${profile.gender}
- Рост: ${profile.height} см
- Вес: ${profile.weight} кг
- Цели: ${profile.goal}
- Ограничения: ${profile.constraints?.join(', ') || 'нет'}
- Оборудование: ${profile.equipment?.join(', ') || 'нет'}
- Предпочтения в спорте: ${(profile as any).sportsPreferences || 'не указаны'}

Последние тренировки (${recentWorkouts.length}): ${recentWorkouts.slice(0, 3).map(w => 
  `${w.exercises.map(e => e.type).join(', ')} (RPE ${w.rpe || 'не указан'})`
).join('; ')}

Создай разнообразную, мотивирующую тренировку с учетом прогресса и целей. В review подчеркни достижения и дай вдохновляющие советы.${additionalPrompt ? `\n\nДополнительные требования:\n${additionalPrompt}` : ''}`
      : `Create an inspiring workout plan for a user who is committed to achieving their goals:
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Goals: ${profile.goal}
- Constraints: ${profile.constraints?.join(', ') || 'none'}
- Equipment: ${profile.equipment?.join(', ') || 'none'}
- Sports preferences: ${(profile as any).sportsPreferences || 'not specified'}

Recent workouts (${recentWorkouts.length}): ${recentWorkouts.slice(0, 3).map(w => 
  `${w.exercises.map(e => e.type).join(', ')} (RPE ${w.rpe || 'not specified'})`
).join('; ')}

Create a varied, motivating workout considering progress and goals. In review, highlight achievements and provide inspiring advice.${additionalPrompt ? `\n\nAdditional requirements:\n${additionalPrompt}` : ''}`

    try {
      const content = await aiGateway.complete({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 3000
      })

      // Try to extract JSON from response
      let jsonContent = content.trim()
      
      // If response contains text with JSON, extract the JSON part
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonContent = jsonMatch[0]
      }

      // Validate JSON structure
      const aiResponseSchema = z.object({
        review: z.string(),
        next_workout: z.object({
          date: z.string().nullable(),
          rpe: z.number().nullable(),
          exercises: z.array(z.object({
            type: z.enum(['run', 'pullups', 'pushups', 'plank', 'custom']),
            details: z.object({
              distanceKm: z.number().optional(),
              durationMin: z.number().optional(),
              sets: z.number().optional(),
              repsPerSet: z.array(z.number()).optional(),
              seconds: z.array(z.number()).optional(),
              customExercise: z.string().optional(),
              notes: z.string().optional()
            })
          }))
        }),
        tips: z.array(z.string())
      })

      const parsedResponse = aiResponseSchema.parse(JSON.parse(jsonContent))

      // Create PlanSuggestion
      const today = todayLocalDate()
      const planDate = parsedResponse.next_workout.date
        ? toLocalDate(parsedResponse.next_workout.date)
        : today
      const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const workoutTemplate: Workout = {
        id: `template_${planId}`,
        date: planDate,
        exercises: parsedResponse.next_workout.exercises,
        rpe: parsedResponse.next_workout.rpe || undefined,
        status: 'planned', // Mark as planned when generated by AI
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const plan: PlanSuggestion = {
        id: planId,
        type: 'workout',
        title: language === 'ru' ? 'План тренировки' : 'Workout Plan',
        description: parsedResponse.review,
        forDate: planDate,
        workoutTemplate,
        notes: `${parsedResponse.review}\n\nСоветы:\n${parsedResponse.tips.join('\n')}`,
        createdAt: new Date().toISOString()
      }

      return plan

    } catch (error) {
      console.error('Failed to generate workout plan:', error)
      throw new Error('Failed to generate workout plan')
    }
  }
}

export const aiService = new AIService()
