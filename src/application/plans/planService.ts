import type { PlanSuggestion } from '@/types/models'
import type { PlanRepository } from '@/domain/plan/PlanRepository'
import { dexiePlanRepository } from '@/infrastructure/repositories/dexiePlanRepository'
import { toLocalDate } from '@/domain/date/localDate'

export class PlanService {
  constructor(private readonly repository: PlanRepository) {}

  getById(id: string): Promise<PlanSuggestion | undefined> {
    return this.repository.getById(id)
  }

  async save(plan: PlanSuggestion): Promise<PlanSuggestion> {
    const normalized = this.normalize(plan)
    await this.repository.put(normalized)
    return normalized
  }

  async saveGeneratedPlan(plan: PlanSuggestion): Promise<PlanSuggestion> {
    const normalized = this.normalize(plan)
    if (!normalized.workoutTemplate) throw new Error('Generated plan has no workout template')
    await this.repository.putWithWorkout(normalized, normalized.workoutTemplate)
    return normalized
  }

  private normalize(plan: PlanSuggestion): PlanSuggestion {
    return {
      ...plan,
      forDate: toLocalDate(plan.forDate),
      workoutTemplate: plan.workoutTemplate
        ? {
            ...plan.workoutTemplate,
            date: toLocalDate(plan.workoutTemplate.date),
            status: 'planned',
            isPlan: true
          }
        : undefined
    }
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

export const planService = new PlanService(dexiePlanRepository)
