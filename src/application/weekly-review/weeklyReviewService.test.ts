import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from '@/types/models'
import type { WeeklyReviewRepository } from '@/domain/weekly-review/WeeklyReviewRepository'
import type { WeeklyReview } from '@/domain/weekly-review/types'
import { aiGateway, aiKeyStore } from '@/services/ai/aiGateway'
import { WeeklyReviewService } from './weeklyReviewService'

const profile: Profile = {
  id: 'me', name: 'Alex', age: 30, gender: 'other', height: 175, weight: 75,
  goal: 'Feel better', constraints: [], equipment: [], frequency: 4, duration: 45,
  language: 'en', goalsDetailed: '', createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

function repository(): WeeklyReviewRepository {
  let stored: WeeklyReview | undefined
  return {
    getByWeek: vi.fn(async () => stored),
    put: vi.fn(async review => { stored = review }),
    putAccepted: vi.fn(async review => { stored = review })
  }
}

describe('WeeklyReviewService', () => {
  beforeEach(() => {
    aiKeyStore.set('')
    vi.restoreAllMocks()
  })

  it('keeps one review per local week and recommends recovery after poor recovery scores', async () => {
    const service = new WeeklyReviewService(repository(), () => new Date('2026-07-17T12:00:00.000Z'))
    const saved = await service.save({
      energy: 2, sleepQuality: 2, soreness: 5, mood: 3, adherence: 70, notes: 'Tired'
    })
    const reviewed = await service.generateRecommendation(saved, profile, [], 'en')

    expect(reviewed.weekStart).toBe('2026-07-13')
    expect(reviewed.recommendation).toMatchObject({
      source: 'local',
      suggestedFrequency: 3,
      suggestedDuration: 35
    })
    expect(service.getPlanDiff(profile, reviewed.recommendation!)).toEqual({
      frequency: { before: 4, after: 3 },
      duration: { before: 45, after: 35 }
    })
  })

  it('records accepted and declined decisions and only changes the accepted profile', async () => {
    const repo = repository()
    const service = new WeeklyReviewService(repo, () => new Date('2026-07-17T12:00:00.000Z'))
    const saved = await service.save({
      energy: 2, sleepQuality: 2, soreness: 4, mood: 3, adherence: 70
    })
    const reviewed = await service.generateRecommendation(saved, profile, [], 'en')

    const acceptedProfile = await service.acceptRecommendation(reviewed, profile)
    expect(acceptedProfile).toMatchObject({ frequency: 3, duration: 35 })
    expect(repo.putAccepted).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'accepted' }),
      expect.objectContaining({ frequency: 3, duration: 35 })
    )

    const declined = await service.declineRecommendation(reviewed)
    expect(declined.decision).toBe('declined')
    expect(repo.put).toHaveBeenLastCalledWith(expect.objectContaining({ decision: 'declined' }))
  })

  it('falls back to a validated local recommendation when AI returns invalid data', async () => {
    aiKeyStore.set('sk-test')
    vi.spyOn(aiGateway, 'complete').mockResolvedValue('not-json')
    const service = new WeeklyReviewService(repository(), () => new Date('2026-07-17T12:00:00.000Z'))
    const saved = await service.save({
      energy: 3, sleepQuality: 3, soreness: 3, mood: 3, adherence: 70
    })

    const reviewed = await service.generateRecommendation(saved, profile, [], 'en')
    expect(reviewed.recommendation?.source).toBe('local')
  })
})
