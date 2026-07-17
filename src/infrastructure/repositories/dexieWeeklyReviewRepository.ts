import { db } from '@services/data'
import type { WeeklyReviewRepository } from '@/domain/weekly-review/WeeklyReviewRepository'

export const dexieWeeklyReviewRepository: WeeklyReviewRepository = {
  getByWeek: weekStart => db.weekly_reviews.where('weekStart').equals(weekStart).first(),
  put: async review => { await db.weekly_reviews.put(review) },
  putAccepted: async (review, profile) => {
    await db.transaction('rw', [db.weekly_reviews, db.profiles], async () => {
      await db.weekly_reviews.put(review)
      await db.profiles.put(profile)
    })
  }
}
