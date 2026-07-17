import type { WeeklyReview } from './types'
import type { Profile } from '@/types/models'

export interface WeeklyReviewRepository {
  getByWeek(weekStart: string): Promise<WeeklyReview | undefined>
  put(review: WeeklyReview): Promise<void>
  putAccepted(review: WeeklyReview, profile: Profile): Promise<void>
}
