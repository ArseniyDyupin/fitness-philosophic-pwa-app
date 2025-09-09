export interface StatsKPI {
  totalWorkouts: number
  totalCalories: number
  totalMinutes: number
  avgRpe?: number
  workoutsPerWeek?: number
  lastWorkoutDate?: string
  activeDays?: number
}

export interface PersonalRecords {
  longestRunKm?: number
  bestPaceMinPerKm?: number
  maxPullups?: number
  maxPushups?: number
  longestPlankSec?: number
  dates: Record<string, string> // metric -> workoutId
}

export interface DisciplineStats {
  run: { calories: number; minutes: number; distance: number; sessions: number }
  pullups: { calories: number; minutes: number; reps: number; sessions: number }
  pushups: { calories: number; minutes: number; reps: number; sessions: number }
  plank: { calories: number; minutes: number; seconds: number; sessions: number }
  custom: { calories: number; minutes: number; sessions: number; exercises: Array<{ name: string; calories: number; minutes: number }> }
}

export interface TrendData {
  date: string
  calories: number
  minutes: number
  distance?: number
  pace?: number
}

export interface ConsistencyData {
  date: string
  calories: number
  minutes: number
  workouts: number
}

export interface MetricDef {
  id: string
  key: string // "weight" | "waist" | "bicep" | ... | custom
  label: string // i18n ключ
  unit?: "kg" | "cm" | "%" | "custom"
  color?: string
  isDefault?: boolean
  createdAt: string
}

export interface MetricEntry {
  id: string
  defId: string
  date: string // ISO day
  value: number
  note?: string
  createdAt: string
}

export interface BodyMetricsData {
  metrics: MetricDef[]
  entries: MetricEntry[]
  lastValues: Record<string, number>
  trends: Record<string, Array<{ date: string; value: number }>>
}

export interface AIInsights {
  summary: string
  recommendations: string[]
  trends: string[]
  warnings?: string[]
  generatedAt: string
}

export type StatsRange = 'all' | 'ytd' | 'last30' | 'last90' | 'custom'

export interface StatsData {
  range: StatsRange
  startDate?: string
  endDate?: string
  kpi: StatsKPI
  discipline: DisciplineStats
  trends: TrendData[]
  records: PersonalRecords
  consistency: ConsistencyData[]
  bodyMetrics: BodyMetricsData
  aiInsights?: AIInsights
}
