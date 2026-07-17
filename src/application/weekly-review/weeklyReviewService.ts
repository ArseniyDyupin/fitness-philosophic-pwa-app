import { z } from 'zod'
import type { Profile, Workout } from '@/types/models'
import type { WeeklyReviewRepository } from '@/domain/weekly-review/WeeklyReviewRepository'
import type { WeeklyPlanDiff, WeeklyRecommendation, WeeklyReview } from '@/domain/weekly-review/types'
import { dexieWeeklyReviewRepository } from '@/infrastructure/repositories/dexieWeeklyReviewRepository'
import { startOfLocalWeek } from '@/domain/date/localDate'
import { aiGateway, aiKeyStore } from '@/services/ai/aiGateway'

export type WeeklyReviewInput = Pick<WeeklyReview, 'energy' | 'sleepQuality' | 'soreness' | 'mood' | 'adherence' | 'notes'>

const RecommendationSchema = z.object({
  summary: z.string().min(1).max(600),
  focus: z.string().min(1).max(160),
  adjustments: z.array(z.string().min(1).max(200)).max(5),
  suggestedFrequency: z.number().int().min(1).max(7),
  suggestedDuration: z.number().int().min(10).max(180)
})

export class WeeklyReviewService {
  constructor(
    private readonly repository: WeeklyReviewRepository,
    private readonly now: () => Date = () => new Date()
  ) {}

  getCurrent(): Promise<WeeklyReview | undefined> {
    return this.repository.getByWeek(startOfLocalWeek(this.now()))
  }

  async save(input: WeeklyReviewInput): Promise<WeeklyReview> {
    const weekStart = startOfLocalWeek(this.now())
    const current = await this.repository.getByWeek(weekStart)
    const timestamp = this.now().toISOString()
    const review: WeeklyReview = {
      ...input,
      id: current?.id ?? `weekly-review:${weekStart}`,
      weekStart,
      recommendation: current?.recommendation,
      createdAt: current?.createdAt ?? timestamp,
      updatedAt: timestamp
    }
    await this.repository.put(review)
    return review
  }

  async generateRecommendation(
    review: WeeklyReview,
    profile: Profile,
    workouts: Workout[],
    language: 'en' | 'ru'
  ): Promise<WeeklyReview> {
    let recommendation = this.createLocalRecommendation(review, profile, language)

    if (aiKeyStore.has()) {
      try {
        const content = await aiGateway.complete({
          messages: [
            {
              role: 'system',
              content: language === 'ru'
                ? 'Ты фитнес-тренер. Не ставь диагнозы. Предложи безопасную адаптацию следующей недели и верни только JSON.'
                : 'You are a fitness coach. Do not diagnose. Suggest a safe next-week adaptation and return JSON only.'
            },
            {
              role: 'user',
              content: JSON.stringify({
                review,
                profile: {
                  age: profile.age,
                  goal: profile.goal,
                  constraints: profile.constraints,
                  frequency: profile.frequency,
                  duration: profile.duration
                },
                completedWorkouts: workouts.filter(workout => workout.status === 'completed').length,
                responseShape: {
                  summary: 'string',
                  focus: 'string',
                  adjustments: ['string'],
                  suggestedFrequency: 'integer 1..7',
                  suggestedDuration: 'integer 10..180'
                }
              })
            }
          ],
          temperature: 0.2,
          maxTokens: 600
        })
        const json = content.match(/\{[\s\S]*\}/)?.[0] ?? content
        recommendation = {
          ...RecommendationSchema.parse(JSON.parse(json)),
          source: 'ai',
          generatedAt: this.now().toISOString()
        }
      } catch {
        // A deterministic local recommendation remains available when AI fails.
      }
    }

    const updated = {
      ...review,
      recommendation,
      decision: undefined,
      decidedAt: undefined,
      updatedAt: this.now().toISOString()
    }
    await this.repository.put(updated)
    return updated
  }

  getPlanDiff(profile: Profile, recommendation: WeeklyRecommendation): WeeklyPlanDiff {
    return {
      frequency: { before: profile.frequency, after: recommendation.suggestedFrequency },
      duration: { before: profile.duration, after: recommendation.suggestedDuration }
    }
  }

  async acceptRecommendation(review: WeeklyReview, profile: Profile): Promise<Profile> {
    if (!review.recommendation) throw new Error('Review has no recommendation')
    const timestamp = this.now().toISOString()
    const updatedProfile: Profile = {
      ...profile,
      frequency: review.recommendation.suggestedFrequency,
      duration: review.recommendation.suggestedDuration,
      updatedAt: timestamp
    }
    const acceptedReview: WeeklyReview = {
      ...review,
      decision: 'accepted',
      decidedAt: timestamp,
      updatedAt: timestamp
    }
    await this.repository.putAccepted(acceptedReview, updatedProfile)
    return updatedProfile
  }

  async declineRecommendation(review: WeeklyReview): Promise<WeeklyReview> {
    const timestamp = this.now().toISOString()
    const declinedReview: WeeklyReview = {
      ...review,
      decision: 'declined',
      decidedAt: timestamp,
      updatedAt: timestamp
    }
    await this.repository.put(declinedReview)
    return declinedReview
  }

  private createLocalRecommendation(
    review: WeeklyReview,
    profile: Profile,
    language: 'en' | 'ru'
  ): WeeklyRecommendation {
    const needsRecovery = review.energy <= 2 || review.sleepQuality <= 2 || review.soreness >= 4
    const needsConsistency = review.adherence < 60
    const canProgress = review.energy >= 4 && review.sleepQuality >= 4 && review.soreness <= 2 && review.adherence >= 80

    const suggestedFrequency = needsRecovery
      ? Math.max(1, profile.frequency - 1)
      : canProgress ? Math.min(7, profile.frequency + 1) : profile.frequency
    const suggestedDuration = needsRecovery || needsConsistency
      ? Math.max(15, profile.duration - 10)
      : canProgress ? Math.min(180, profile.duration + 5) : profile.duration

    return {
      summary: language === 'ru'
        ? needsRecovery ? 'На следующей неделе снизьте нагрузку и восстановитесь.' : 'Сохраните устойчивый темп и корректируйте нагрузку по самочувствию.'
        : needsRecovery ? 'Reduce next week’s load and prioritize recovery.' : 'Keep a sustainable pace and adjust load to how you feel.',
      focus: language === 'ru'
        ? needsConsistency ? 'Регулярность коротких тренировок' : needsRecovery ? 'Сон и восстановление' : 'Постепенный прогресс'
        : needsConsistency ? 'Consistent short sessions' : needsRecovery ? 'Sleep and recovery' : 'Gradual progress',
      adjustments: language === 'ru'
        ? [`${suggestedFrequency} тренировок в неделю`, `${suggestedDuration} минут на тренировку`]
        : [`${suggestedFrequency} workouts per week`, `${suggestedDuration} minutes per workout`],
      suggestedFrequency,
      suggestedDuration,
      source: 'local',
      generatedAt: this.now().toISOString()
    }
  }
}

export const weeklyReviewService = new WeeklyReviewService(dexieWeeklyReviewRepository)
