export type ISO = string

import type { Profile } from './models'
import type { Workout } from './models'
import type { FoodLog } from './models'
import type { WeeklyCheckin } from './models'
import type { AiMessage } from './models'
import type { PlanSuggestion } from './models'

export interface ExportBundle {
  schemaVersion: 1
  exportedAt: ISO
  profile?: Profile
  workouts: Workout[]
  food: FoodLog[]
  checkins: WeeklyCheckin[]
  weeklyData: unknown[] // For compatibility
  ai: AiMessage[]
  plans: PlanSuggestion[]
  ai_feedback: unknown[]
  metric_defs: unknown[]
  metric_entries: unknown[]
  photo_assets: unknown[]
  ai_body_evals: unknown[]
  exercise_estimates: unknown[]
}

export interface ImportStats {
  profileReplaced: boolean
  workoutsUpserted: number
  foodUpserted: number
  checkinsUpserted: number
  aiUpserted: number
  plansUpserted: number
  mode: 'replace' | 'merge'
}

export interface ImportPreview {
  hasProfile: boolean
  workoutsCount: number
  foodCount: number
  checkinsCount: number
  aiCount: number
  plansCount: number
  exportedAt: string
  schemaVersion: number
}
