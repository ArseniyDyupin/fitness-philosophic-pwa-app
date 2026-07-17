// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { aiBodyService } from './aiBody.service'
import { aiGateway } from './aiGateway'

const baseInput = {
  profile: { gender: 'other', age: 30, height: 175, weight: 75, goals: 'Health', constraints: '' },
  metricsHistory: [],
  language: 'en' as const
}

describe('aiBodyService photo boundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('omits image content when the caller has not provided consented photos', async () => {
    const complete = vi.spyOn(aiGateway, 'complete').mockResolvedValue('{"summary":"OK","tips":[],"tags":[]}')

    await aiBodyService.evaluate(baseInput)

    expect(complete).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: [expect.objectContaining({ type: 'text' })] })
      ])
    }))
  })

  it('includes provided consented photos as image parts', async () => {
    const complete = vi.spyOn(aiGateway, 'complete').mockResolvedValue('{"summary":"OK","tips":[],"tags":[]}')

    await aiBodyService.evaluate({
      ...baseInput,
      photos: [{
        id: 'photo-1', date: '2026-07-17', kind: 'front', mime: 'image/jpeg',
        dataUrl: 'data:image/jpeg;base64,abc', createdAt: '2026-07-17T00:00:00.000Z'
      }]
    })

    expect(complete).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.arrayContaining([
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,abc', detail: 'low' } }
          ])
        })
      ])
    }))
  })
})
