import { db } from '../data/db'
import type { WorkoutType, ExerciseEstimate, WorkoutExercise } from '@/types/models'

export interface EstimateInput {
  type: WorkoutType | "custom"
  details: {
    customExercise?: string
    sets?: number
    repsPerSet?: number[]
    seconds?: number[]
    distanceKm?: number
    durationMin?: number
    weightKg?: number
  }
  profile: { weightKg: number; age?: number; gender?: string }
}

export interface EstimateResult {
  kcal: number
  durationMin?: number
  unit: "per-session" | "per-set" | "per-rep" | "per-km" | "per-minute"
}

// System prompt for AI estimation
const SYSTEM_PROMPT = `Ты — спортивный физиолог и калькулятор. Возвращай ТОЛЬКО JSON.
Пол, возраст и вес могут влиять на оценку. Если данных не хватает, делай консервативную оценку.
Выбери корректную unit: "per-session" | "per-set" | "per-rep" | "per-km" | "per-minute".
Поле durationMin заполняй, если логично (планка, силовые подходы, бег).
Границы: kcal >= 0, durationMin >= 0.
Ответ строго в формате:
{"kcal": number, "durationMin": number|null, "unit": "per-session"|"per-set"|"per-rep"|"per-km"|"per-minute"}`

// Create signature for caching
function createSignature(input: EstimateInput): string {
  const { type, details } = input
  
  const parts = [`type=${type}`]
  
  if (details.customExercise) {
    parts.push(`name=${details.customExercise.toLowerCase().trim()}`)
  }
  if (details.sets) {
    parts.push(`sets=${details.sets}`)
  }
  if (details.repsPerSet && details.repsPerSet.length > 0) {
    const sortedReps = [...details.repsPerSet].sort((a, b) => a - b)
    parts.push(`reps=[${sortedReps.join(',')}]`)
  }
  if (details.seconds && details.seconds.length > 0) {
    const sortedSeconds = [...details.seconds].sort((a, b) => a - b)
    parts.push(`seconds=[${sortedSeconds.join(',')}]`)
  }
  if (details.distanceKm) {
    parts.push(`distanceKm=${details.distanceKm}`)
  }
  if (details.durationMin) {
    parts.push(`durationMin=${details.durationMin}`)
  }
  if (details.weightKg) {
    parts.push(`weightKg=${details.weightKg}`)
  }
  
  return parts.join('|')
}

// Generate hash from signature
async function generateHash(signature: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(signature)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Check cache for existing estimate
async function getCachedEstimate(signature: string): Promise<ExerciseEstimate | null> {
  try {
    const hash = await generateHash(signature)
    const estimate = await db.exercise_estimates.get(hash)
    return estimate || null
  } catch (error) {
    console.error('Failed to get cached estimate:', error)
    return null
  }
}

// Save estimate to cache
async function saveEstimateToCache(
  signature: string, 
  input: EstimateInput, 
  result: EstimateResult
): Promise<void> {
  try {
    const hash = await generateHash(signature)
    const now = new Date().toISOString()
    
    const estimate: ExerciseEstimate = {
      id: hash,
      signature,
      type: input.type,
      model: "gpt-4o-mini",
      kcal: result.kcal,
      durationMin: result.durationMin,
      unit: result.unit,
      meta: { source: "ai" },
      createdAt: now,
      updatedAt: now
    }
    
    await db.exercise_estimates.put(estimate)
  } catch (error) {
    console.error('Failed to save estimate to cache:', error)
  }
}

// Call OpenAI API for estimation
async function callOpenAI(input: EstimateInput): Promise<EstimateResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const aiPayload = {
    profile: {
      weightKg: input.profile.weightKg,
      age: input.profile.age,
      sex: input.profile.gender
    },
    exercise: {
      type: input.type,
      details: input.details
    },
    context: "Оцени калории и ориентировочную длительность для одной такой сессии."
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(aiPayload) }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const result = JSON.parse(content)
    
    // Validate and sanitize result
    const estimate: EstimateResult = {
      kcal: Math.max(0, Math.round(result.kcal || 0)),
      durationMin: result.durationMin ? Math.max(0, Math.round(result.durationMin)) : undefined,
      unit: result.unit || "per-session"
    }

    // Validate unit
    const validUnits = ["per-session", "per-set", "per-rep", "per-km", "per-minute"]
    if (!validUnits.includes(estimate.unit)) {
      estimate.unit = "per-session"
    }

    return estimate
  } catch (error) {
    throw new Error(`Failed to parse OpenAI response: ${error}`)
  }
}

// Main function to get exercise estimate
export async function getExerciseEstimate(
  input: EstimateInput, 
  opts?: { forceAI?: boolean }
): Promise<EstimateResult> {
  const signature = createSignature(input)
  
  // Try cache first (unless forceAI is true)
  if (!opts?.forceAI) {
    const cached = await getCachedEstimate(signature)
    if (cached) {
      return {
        kcal: cached.kcal,
        durationMin: cached.durationMin,
        unit: cached.unit
      }
    }
  }

  // Call AI with retries
  const maxRetries = 2

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await callOpenAI(input)
      
      // Save to cache
      await saveEstimateToCache(signature, input, result)
      
      return result
    } catch (error) {
      console.warn(`AI estimation attempt ${attempt + 1} failed:`, error)
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  // If all attempts failed, return fallback
  console.error('All AI estimation attempts failed, returning fallback')
  return {
    kcal: 0,
    durationMin: undefined,
    unit: "per-session"
  }
}

// Batch estimation for multiple exercises
export async function getBatchEstimates(
  inputs: EstimateInput[],
  opts?: { forceAI?: boolean }
): Promise<EstimateResult[]> {
  const results: EstimateResult[] = []
  
  // Process in parallel with rate limiting
  const batchSize = 3
  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = inputs.slice(i, i + batchSize)
    const batchPromises = batch.map(input => getExerciseEstimate(input, opts))
    
    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    } catch (error) {
      console.error('Batch estimation failed:', error)
      // Add fallback results for failed batch
      results.push(...batch.map(() => ({
        kcal: 0,
        durationMin: undefined,
        unit: "per-session" as const
      })))
    }
    
    // Rate limiting delay between batches
    if (i + batchSize < inputs.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

// Helper to check if exercise needs AI estimation
export function needsAIEstimation(exercise: WorkoutExercise): boolean {
  // If already has estimate, don't re-estimate
  if (exercise.kcalEstimated !== undefined) {
    return false
  }

  // For custom exercises, always need AI
  if (exercise.type === 'custom') {
    return true
  }

  // For standard exercises, check if we can calculate locally
  switch (exercise.type) {
    case 'run':
      // Can calculate locally if we have distance
      return !exercise.details.distanceKm
    case 'pullups':
    case 'pushups':
    case 'plank':
      // These can be estimated locally with basic formulas
      return false
    default:
      return true
  }
}

// Helper to create EstimateInput from WorkoutExercise
export function createEstimateInput(
  exercise: WorkoutExercise,
  profile: { weightKg: number; age?: number; gender?: string }
): EstimateInput {
  return {
    type: exercise.type,
    details: exercise.details,
    profile
  }
}
