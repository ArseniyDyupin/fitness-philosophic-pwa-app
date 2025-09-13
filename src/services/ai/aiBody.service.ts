import { aiService } from './ai'
import type { BodyAnalysisInput, BodyAnalysisResult, AiBodyEval } from '@/types/body-metrics'

export const aiBodyService = {
  async evaluate(input: BodyAnalysisInput): Promise<BodyAnalysisResult> {
    try {
      const { profile, metricsHistory, photos, language } = input
      
      // Prepare the prompt
      const bodyPrompt = this.buildPrompt(profile, metricsHistory, language)
      
      // Prepare messages for OpenAI
      const messages: Array<{
        role: string;
        content: string | Array<{ type: string; text: string }>;
      }> = [
        {
          role: 'system',
          content: language === 'ru' 
            ? 'Ты - эксперт по фитнесу и анализу тела. Анализируй метрики и фото пользователя, дай краткую оценку прогресса.'
            : 'You are a fitness and body analysis expert. Analyze user metrics and photos, provide a brief progress assessment.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: bodyPrompt
            }
          ]
        }
      ]

      // Add photos if available
      if (photos && photos.length > 0) {
        for (const photo of photos) {
          if (Array.isArray(messages[1].content)) {
            (messages[1].content as Array<{ type: string; image_url: { url: string } }>).push({
              type: 'image_url',
              image_url: {
                url: photo.dataUrl,
                detail: 'low'
              }
            })
          }
        }
      }

      // Call OpenAI API using generateResponse method
      const prompt = messages.map(m => {
        if (typeof m.content === 'string') {
          return m.content
        } else if (Array.isArray(m.content)) {
          return m.content.map(c => c.type === 'text' ? c.text : '').join('\n')
        }
        return ''
      }).join('\n')
      
      const response = await aiService.generateResponse(prompt, language === 'ru' ? 'ru' : 'en')

      // Parse the response
      return this.parseResponse(response, language)
    } catch (error) {
      console.error('AI body analysis failed:', error)
      throw new Error('Failed to analyze body metrics with AI')
    }
  },

  buildPrompt(profile: { weight?: number; age?: number; gender?: string }, metricsHistory: Array<{ date: string; [key: string]: number }>, language: 'ru' | 'en'): string {
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

Проанализируй тенденции и дай оценку прогресса. Верни ответ в формате JSON:
{
  "score": число от 0 до 100 (общая оценка прогресса),
  "summary": "краткое резюме на 2-3 предложения",
  "tips": ["совет 1", "совет 2", "совет 3"],
  "tags": ["тег1", "тег2"],
  "comparedTo": {
    "weeks": количество недель для сравнения,
    "note": "краткое сравнение с предыдущим периодом"
  }
}

Будь объективным и конструктивным.`
      : `

Analyze trends and provide a progress assessment. Return response in JSON format:
{
  "score": number from 0 to 100 (overall progress score),
  "summary": "brief summary in 2-3 sentences",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "tags": ["tag1", "tag2"],
  "comparedTo": {
    "weeks": number of weeks for comparison,
    "note": "brief comparison with previous period"
  }
}

Be objective and constructive.`

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

  async saveEvaluation(_evaluation: AiBodyEval): Promise<void> {
    try {
      // This would save to the database
      // For now, we'll use a placeholder
    } catch (error) {
      console.error('Failed to save AI evaluation:', error)
      throw error
    }
  },

  async getEvaluations(): Promise<AiBodyEval[]> {
    try {
      // This would query the database
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get AI evaluations:', error)
      return []
    }
  },

  async getEvaluationsByDateRange(_startDate: string, _endDate: string): Promise<AiBodyEval[]> {
    try {
      // This would query the database for evaluations within date range
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get AI evaluations by date range:', error)
      return []
    }
  },

  async importEvaluations(_evaluations: AiBodyEval[]): Promise<void> {
    try {
      // This would import evaluations to the database
      // For now, just return success
    } catch (error) {
      console.error('Failed to import AI evaluations:', error)
      throw error
    }
  }
}
