export interface WeeklyRecommendation {
  summary: string
  focus: string
  adjustments: string[]
  suggestedFrequency: number
  suggestedDuration: number
  source: 'ai' | 'local'
  generatedAt: string
}

export interface WeeklyReview {
  id: string
  weekStart: string
  energy: number
  sleepQuality: number
  soreness: number
  mood: number
  adherence: number
  notes?: string
  recommendation?: WeeklyRecommendation
  decision?: 'accepted' | 'declined'
  decidedAt?: string
  createdAt: string
  updatedAt: string
}

export interface WeeklyPlanDiff {
  frequency: { before: number; after: number }
  duration: { before: number; after: number }
}
