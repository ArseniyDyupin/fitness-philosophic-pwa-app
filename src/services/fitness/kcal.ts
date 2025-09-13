import type { WorkoutExercise, WorkoutType } from '@/types/models'

// MET values for different exercise types
const MET_VALUES: Record<WorkoutType, number> = {
  run: 8.0,        // Moderate running
  pullups: 3.8,    // Pull-ups
  pushups: 3.8,    // Push-ups
  plank: 4.0,      // Plank hold
  custom: 4.0      // Default for custom exercises
}

// MET adjustments based on intensity
const INTENSITY_ADJUSTMENTS = {
  low: 0.8,        // RPE 1-3
  medium: 1.0,     // RPE 4-7
  high: 1.3        // RPE 8-10
}

/**
 * Calculate calories burned for a single exercise
 */
export function calculateExerciseCalories(
  exercise: WorkoutExercise,
  userWeight: number, // in kg
  rpe?: number
): number {
  const baseMET = MET_VALUES[exercise.type]
  let totalCalories = 0

  switch (exercise.type) {
    case 'run':
      if (exercise.details.distanceKm && exercise.details.durationMin) {
        // Calculate calories based on distance and time
        const pace = exercise.details.distanceKm / (exercise.details.durationMin / 60) // km/h
        let adjustedMET = baseMET
        
        // Adjust MET based on pace
        if (pace > 12) adjustedMET = 12.0      // Fast running
        else if (pace > 8) adjustedMET = 10.0   // Moderate running
        else if (pace > 6) adjustedMET = 8.0    // Slow running
        else adjustedMET = 6.0                   // Jogging
        
        totalCalories = (adjustedMET * userWeight * exercise.details.durationMin * 3.5) / 200
      }
      break

    case 'pullups':
    case 'pushups':
      if (exercise.details.repsPerSet && exercise.details.sets) {
        const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
        const totalTime = totalReps * 2 // Estimate 2 seconds per rep
        const durationMinutes = totalTime / 60
        
        totalCalories = (baseMET * userWeight * durationMinutes * 3.5) / 200
      }
      break

    case 'plank':
      if (exercise.details.seconds) {
        const totalSeconds = exercise.details.seconds.reduce((sum, seconds) => sum + seconds, 0)
        const durationMinutes = totalSeconds / 60
        
        totalCalories = (baseMET * userWeight * durationMinutes * 3.5) / 200
      }
      break

    case 'custom':
      if (exercise.details.durationMin) {
        totalCalories = (baseMET * userWeight * exercise.details.durationMin * 3.5) / 200
      } else if (exercise.details.repsPerSet && exercise.details.sets) {
        const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
        const totalTime = totalReps * 2 // Estimate 2 seconds per rep
        const durationMinutes = totalTime / 60
        
        totalCalories = (baseMET * userWeight * durationMinutes * 3.5) / 200
      }
      break
  }

  // Apply RPE intensity adjustment if available
  if (rpe) {
    let intensity: keyof typeof INTENSITY_ADJUSTMENTS
    if (rpe <= 3) intensity = 'low'
    else if (rpe <= 7) intensity = 'medium'
    else intensity = 'high'
    
    totalCalories *= INTENSITY_ADJUSTMENTS[intensity]
  }

  return Math.round(totalCalories)
}

/**
 * Calculate total calories for a workout
 */
export function calculateWorkoutCalories(
  exercises: WorkoutExercise[],
  userWeight: number,
  rpe?: number
): number {
  return exercises.reduce((total, exercise) => {
    return total + calculateExerciseCalories(exercise, userWeight, rpe)
  }, 0)
}

/**
 * Calculate total duration of a workout in minutes
 */
export function calculateWorkoutDuration(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, exercise) => {
    switch (exercise.type) {
      case 'run':
        return total + (exercise.details.durationMin || 0)
      case 'pullups':
      case 'pushups':
        if (exercise.details.repsPerSet && exercise.details.sets) {
          const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
          return total + (totalReps * 2 / 60) // 2 seconds per rep
        }
        return total
      case 'plank':
        if (exercise.details.seconds) {
          const totalSeconds = exercise.details.seconds.reduce((sum, seconds) => sum + seconds, 0)
          return total + (totalSeconds / 60)
        }
        return total
      case 'custom':
        if (exercise.details.durationMin) {
          return total + exercise.details.durationMin
        } else if (exercise.details.repsPerSet && exercise.details.sets) {
          const totalReps = exercise.details.repsPerSet.reduce((sum, reps) => sum + reps, 0)
          return total + (totalReps * 2 / 60)
        }
        return total
      default:
        return total
    }
  }, 0)
}

/**
 * Sum calories for multiple workouts
 */
export function sumWorkoutKcal(workouts: Workout[], userWeight: number): number {
  return workouts.reduce((total, workout) => {
    if (workout.exercises) {
      return total + calculateWorkoutCalories(workout.exercises, userWeight, workout.rpe)
    }
    return total
  }, 0)
}

/**
 * Sum minutes for multiple workouts
 */
export function sumWorkoutMinutes(workouts: Workout[]): number {
  return workouts.reduce((total, workout) => {
    if (workout.exercises) {
      return total + (workout.durationOverrideMin || calculateWorkoutDuration(workout.exercises))
    }
    return total
  }, 0)
}

/**
 * Calculate total duration for a single workout (including override)
 */
export function getWorkoutTotalDuration(workout: Workout): number {
  if (!workout.exercises) return 0
  return workout.durationOverrideMin || calculateWorkoutDuration(workout.exercises)
}

/**
 * Calculate total calories for a single workout
 */
export function getWorkoutTotalCalories(workout: Workout, userWeight: number): number {
  if (!workout.exercises) return 0
  return calculateWorkoutCalories(workout.exercises, userWeight, workout.rpe)
}
