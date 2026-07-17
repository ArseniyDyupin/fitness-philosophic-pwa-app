import type { BodyAnalysisInput, BodyAnalysisResult, AiBodyEval } from '@/types/body-metrics'
import { aiGateway, type AIContentPart } from './aiGateway'
import { db } from '@services/data'
import { toLocalDate } from '@/domain/date/localDate'

export const aiBodyService = {
  async evaluate(input: BodyAnalysisInput): Promise<BodyAnalysisResult> {
    try {
      const { profile, metricsHistory, photos, language } = input
      
      // Prepare the prompt
      const bodyPrompt = this.buildPrompt(profile, metricsHistory, language)
      
      const userContent: AIContentPart[] = [{ type: 'text', text: bodyPrompt }]
      photos?.forEach(photo => {
        userContent.push({
          type: 'image_url',
          image_url: { url: photo.dataUrl, detail: 'low' }
        })
      })

      const response = await aiGateway.complete({
        messages: [
          {
            role: 'system',
            content: language === 'ru'
              ? 'Ты — опытный фитнес-эксперт. Анализируй метрики и фото только в рамках фитнес-прогресса, не ставь диагнозы. Верни только JSON.'
              : 'You are an experienced fitness expert. Analyze metrics and photos only for fitness progress, do not diagnose. Return JSON only.'
          },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2,
        maxTokens: 1000
      })

      // Parse the response
      return this.parseResponse(response, language)
    } catch (error) {
      console.error('AI body analysis failed:', error)
      throw new Error('Failed to analyze body metrics with AI')
    }
  },

  buildPrompt(profile: any, metricsHistory: Array<{ date: string; metrics: Record<string, number> }>, language: 'ru' | 'en'): string {
    const isRussian = language === 'ru'
    
    let prompt = isRussian 
      ? `Проанализируй прогресс пользователя на основе следующих данных:

Профиль:
- Пол: ${profile.gender}
- Возраст: ${profile.age} лет
- Рост: ${profile.height} см
- Текущий вес: ${profile.weight} кг
- Цели: ${profile.goals}
${profile.constraints ? `- Ограничения: ${profile.constraints}` : ''}

История метрик за последние ${metricsHistory.length} недель:
`

      : `Analyze user progress based on the following data:

Profile:
- Gender: ${profile.gender}
- Age: ${profile.age} years
- Height: ${profile.height} cm
- Current weight: ${profile.weight} kg
- Goals: ${profile.goals}
${profile.constraints ? `- Constraints: ${profile.constraints}` : ''}

Metrics history for the last ${metricsHistory.length} weeks:
`

    // Add metrics history
    metricsHistory.forEach((week, index) => {
      prompt += `\nWeek ${index + 1} (${week.date}):\n`
      Object.entries(week.metrics).forEach(([key, value]) => {
        prompt += `  - ${key}: ${value}\n`
      })
    })

    prompt += isRussian 
      ? `

Проанализируй тенденции и дай мотивирующую оценку прогресса. Верни ответ в формате JSON:
{
  "score": число от 0 до 100 (общая оценка прогресса),
  "summary": "вдохновляющее резюме на 2-3 предложения, подчеркивающее достижения",
  "tips": ["мотивирующий совет 1", "практический совет 2", "вдохновляющий совет 3"],
  "tags": ["тег1", "тег2"],
  "comparedTo": {
    "weeks": количество недель для сравнения,
    "note": "позитивное сравнение с предыдущим периодом, подчеркивающее рост"
  }
}

Будь честным, но вдохновляющим. Подчеркивай прогресс и достижения, давай практические советы для дальнейшего развития.`
      : `

Analyze trends and provide a motivating progress assessment. Return response in JSON format:
{
  "score": number from 0 to 100 (overall progress score),
  "summary": "inspiring summary in 2-3 sentences, highlighting achievements",
  "tips": ["motivating tip 1", "practical tip 2", "inspiring tip 3"],
  "tags": ["tag1", "tag2"],
  "comparedTo": {
    "weeks": number of weeks for comparison,
    "note": "positive comparison with previous period, highlighting growth"
  }
}

Be honest but inspiring. Highlight progress and achievements, provide practical advice for further development.`

    return prompt
  },

  parseResponse(response: string, language: 'ru' | 'en'): BodyAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and clean the response
      return {
        score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : undefined,
        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : 'No summary available',
        tips: Array.isArray(parsed.tips) ? parsed.tips.filter((tip: unknown) => typeof tip === 'string') : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag: unknown) => typeof tag === 'string') : [],
        comparedTo: parsed.comparedTo && typeof parsed.comparedTo === 'object' 
          ? {
              weeks: typeof parsed.comparedTo.weeks === 'number' ? parsed.comparedTo.weeks : 0,
              note: typeof parsed.comparedTo.note === 'string' ? parsed.comparedTo.note.trim() : ''
            }
          : undefined
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      
      // Fallback response
      return {
        summary: language === 'ru' 
          ? 'Не удалось проанализировать данные. Попробуйте еще раз.'
          : 'Failed to analyze data. Please try again.',
        tips: [],
        tags: []
      }
    }
  },

  async saveEvaluation(evaluation: AiBodyEval): Promise<void> {
    try {
      await db.ai_body_evals.put({
        ...evaluation,
        weekStart: toLocalDate(evaluation.weekStart)
      })
    } catch (error) {
      console.error('Failed to save AI evaluation:', error)
      throw error
    }
  },

  async getEvaluations(): Promise<AiBodyEval[]> {
    try {
      return await db.ai_body_evals.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('Failed to get AI evaluations:', error)
      return []
    }
  },

  async getEvaluationsByDateRange(startDate: string, endDate: string): Promise<AiBodyEval[]> {
    try {
      const start = toLocalDate(startDate)
      const end = toLocalDate(endDate)
      const evaluations = await db.ai_body_evals.toArray()
      return evaluations.filter(evaluation => {
        const weekStart = toLocalDate(evaluation.weekStart)
        return weekStart >= start && weekStart <= end
      })
    } catch (error) {
      console.error('Failed to get AI evaluations by date range:', error)
      return []
    }
  },

  async importEvaluations(evaluations: AiBodyEval[]): Promise<void> {
    try {
      await db.ai_body_evals.bulkPut(evaluations.map(evaluation => ({
        ...evaluation,
        weekStart: toLocalDate(evaluation.weekStart)
      })))
    } catch (error) {
      console.error('Failed to import AI evaluations:', error)
      throw error
    }
  }
}
