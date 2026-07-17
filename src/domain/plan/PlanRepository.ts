import type { PlanSuggestion, Workout } from '@/types/models'

export interface PlanRepository {
  getById(id: string): Promise<PlanSuggestion | undefined>
  put(plan: PlanSuggestion): Promise<void>
  putWithWorkout(plan: PlanSuggestion, workout: Workout): Promise<void>
  delete(id: string): Promise<void>
}
