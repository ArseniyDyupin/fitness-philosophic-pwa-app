import { getWorkoutTypeMET, calculateCaloriesBurned } from './met'
import type { WorkoutType } from '@/types/models'

export interface CalorieCalculation {
  calories: number
  metValue: number
  durationHours: number
}

export function calculateWorkoutCalories(
  workoutType: WorkoutType,
  weightKg: number,
  durationMinutes: number,
  additionalFactors?: {
    intensity?: 'low' | 'moderate' | 'high'
    distance?: number // for running
    reps?: number // for strength exercises
    sets?: number // for strength exercises
  }
): CalorieCalculation {
  let baseMET = getWorkoutTypeMET(workoutType)
  
  // Apply intensity modifiers
  if (additionalFactors?.intensity) {
    switch (additionalFactors.intensity) {
      case 'low':
        baseMET *= 0.8
        break
      case 'high':
        baseMET *= 1.2
        break
    }
  }
  
  // Apply exercise-specific modifiers
  if (workoutType === 'run' && additionalFactors?.distance) {
    // Adjust MET based on pace
    const paceMinutesPerKm = durationMinutes / additionalFactors.distance
    if (paceMinutesPerKm < 4) {
      baseMET = 12.0 // Fast pace
    } else if (paceMinutesPerKm > 6) {
      baseMET = 6.0 // Slow pace
    }
  }
  
  if (workoutType === 'pullups' || workoutType === 'pushups') {
    // Strength exercises: adjust based on volume
    if (additionalFactors?.reps && additionalFactors?.sets) {
      const totalReps = additionalFactors.reps * additionalFactors.sets
      if (totalReps > 50) {
        baseMET *= 1.1 // High volume
      } else if (totalReps < 20) {
        baseMET *= 0.9 // Low volume
      }
    }
  }
  
  const calories = calculateCaloriesBurned(baseMET, weightKg, durationMinutes)
  const durationHours = durationMinutes / 60
  
  return {
    calories,
    metValue: baseMET,
    durationHours
  }
}

export function calculateDailyCalorieBalance(
  foodCalories: number,
  workoutCalories: number
): number {
  return foodCalories - workoutCalories
}

export function calculateWeeklyCalorieBalance(
  weeklyFoodCalories: number,
  weeklyWorkoutCalories: number
): number {
  return weeklyFoodCalories - weeklyWorkoutCalories
}

export function getCalorieGoal(goal: string, weight: number, age: number, gender: string): number {
  // Basic BMR calculation using Mifflin-St Jeor Equation
  let bmr: number
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * 170 - 5 * age + 5 // Assuming average height of 170cm
  } else {
    bmr = 10 * weight + 6.25 * 160 - 5 * age - 161 // Assuming average height of 160cm
  }
  
  // Activity factor (moderate activity)
  const tdee = bmr * 1.55
  
  // Adjust based on goal
  switch (goal) {
    case 'weight_loss':
      return Math.round(tdee - 500) // 500 calorie deficit
    case 'muscle_gain':
      return Math.round(tdee + 300) // 300 calorie surplus
    default:
      return Math.round(tdee)
  }
}
