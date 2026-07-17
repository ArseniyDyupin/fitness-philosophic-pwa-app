import { db } from '@services/data'
import type { PlanRepository } from '@/domain/plan/PlanRepository'

export const dexiePlanRepository: PlanRepository = {
  getById: id => db.plans.get(id),
  put: async plan => { await db.plans.put(plan) },
  putWithWorkout: async (plan, workout) => {
    await db.transaction('rw', [db.plans, db.workouts], async () => {
      await db.plans.put(plan)
      await db.workouts.put(workout)
    })
  },
  delete: async id => { await db.plans.delete(id) }
}
