import { AI_CONFIG } from '@/constants'
import { aiRateLimiter } from './rateLimiter'

const API_KEY_STORAGE = 'ai-trainer:openai-api-key'
const PLACEHOLDER_KEY = 'your_openai_api_key_here'

export type AIContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } }

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | AIContentPart[]
}

export type AIErrorCode = 'missing_key' | 'invalid_key' | 'rate_limit' | 'unavailable' | 'request_failed' | 'invalid_response'

export class AIGatewayError extends Error {
  constructor(public readonly code: AIErrorCode, message: string) {
    super(message)
    this.name = 'AIGatewayError'
  }
}

class AIKeyStore {
  private apiKey = this.load()

  private load(): string {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envApiKey && envApiKey !== PLACEHOLDER_KEY) return envApiKey
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem(API_KEY_STORAGE) || ''
  }

  get(): string {
    return this.apiKey
  }

  has(): boolean {
    return Boolean(this.apiKey && this.apiKey !== PLACEHOLDER_KEY)
  }

  set(key: string): void {
    this.apiKey = key.trim()
    if (typeof localStorage === 'undefined') return
    if (this.apiKey) localStorage.setItem(API_KEY_STORAGE, this.apiKey)
    else localStorage.removeItem(API_KEY_STORAGE)
  }
}

export const aiKeyStore = new AIKeyStore()

interface CompleteOptions {
  messages: AIChatMessage[]
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export class OpenAIGateway {
  private readonly baseUrl = 'https://api.openai.com/v1/chat/completions'

  async complete(options: CompleteOptions): Promise<string> {
    const apiKey = aiKeyStore.get()
    if (!apiKey) throw new AIGatewayError('missing_key', 'API key not set')

    const rateLimitKey = 'ai-request'
    if (!aiRateLimiter.isAllowed(rateLimitKey)) {
      const seconds = Math.ceil(aiRateLimiter.getTimeUntilReset(rateLimitKey) / 1000)
      throw new AIGatewayError('rate_limit', `Rate limit exceeded. Please wait ${seconds} seconds.`)
    }

    let response: Response
    try {
      response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.DEFAULT_MODEL,
          messages: options.messages,
          temperature: options.temperature ?? AI_CONFIG.TEMPERATURE,
          max_tokens: options.maxTokens ?? AI_CONFIG.MAX_TOKENS
        }),
        signal: options.signal
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new AIGatewayError('request_failed', 'Unable to reach the AI service')
    }

    if (!response.ok) {
      if (response.status === 401) throw new AIGatewayError('invalid_key', 'Invalid API key')
      if (response.status === 429) throw new AIGatewayError('rate_limit', 'Rate limit exceeded. Please try again later.')
      if (response.status >= 500) throw new AIGatewayError('unavailable', 'AI service temporarily unavailable')
      throw new AIGatewayError('request_failed', `AI request failed: ${response.status}`)
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new AIGatewayError('invalid_response', 'No content in AI response')
    return content
  }
}

export const aiGateway = new OpenAIGateway()
