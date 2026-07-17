// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { aiGateway, aiKeyStore } from './aiGateway'
import { aiRateLimiter } from './rateLimiter'

describe('OpenAIGateway', () => {
  beforeEach(() => {
    aiKeyStore.set('sk-test')
    aiRateLimiter.reset('ai-request')
  })

  afterEach(() => {
    aiKeyStore.set('')
    vi.unstubAllGlobals()
  })

  it('sends image content through the same configured transport', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      choices: [{ message: { content: '{"score":80}' } }]
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiGateway.complete({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze progress' },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,abc', detail: 'low' } }
        ]
      }]
    })).resolves.toBe('{"score":80}')

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    const payload = JSON.parse(request.body as string)
    expect(payload.messages[0].content[1]).toEqual({
      type: 'image_url',
      image_url: { url: 'data:image/jpeg;base64,abc', detail: 'low' }
    })
    expect((request.headers as Record<string, string>).Authorization).toBe('Bearer sk-test')
  })

  it('maps authentication errors to a stable error code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 401 })))

    await expect(aiGateway.complete({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toMatchObject({ code: 'invalid_key' })
  })

  it.each([
    [429, 'rate_limit'],
    [503, 'unavailable'],
    [400, 'request_failed']
  ])('maps HTTP %s to %s', async (status, code) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status })))

    await expect(aiGateway.complete({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toMatchObject({ code })
  })

  it('maps network failures and rejects empty provider responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    await expect(aiGateway.complete({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toMatchObject({ code: 'request_failed' })

    aiRateLimiter.reset('ai-request')
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices: [] }), { status: 200 })))
    await expect(aiGateway.complete({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toMatchObject({ code: 'invalid_response' })
  })

  it('preserves abort errors so callers can implement timeouts without retrying blindly', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new DOMException('aborted', 'AbortError')
    }))

    await expect(aiGateway.complete({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toMatchObject({ name: 'AbortError' })
  })
})
