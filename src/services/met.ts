// MET values for different activities
// Source: Compendium of Physical Activities
export const MET_VALUES: Record<string, number> = {
  // Running
  'run': 8.0, // Moderate pace (8 min/mile)
  'run_fast': 12.0, // Fast pace (6 min/mile)
  'run_slow': 6.0, // Slow pace (10 min/mile)
  
  // Strength training
  'pullups': 8.0,
  'pushups': 3.8,
  'plank': 4.0,
  'weightlifting': 6.0,
  
  // Cardio
  'walking': 3.5,
  'cycling': 6.0,
  'swimming': 8.0,
  
  // Custom exercises (default)
  'custom': 5.0
}

export function getMETValue(workoutType: string): number {
  return MET_VALUES[workoutType] || MET_VALUES['custom']
}

export function calculateCaloriesBurned(
  metValue: number,
  weightKg: number,
  durationMinutes: number
): number {
  // Formula: Calories = MET × Weight (kg) × Duration (hours)
  const durationHours = durationMinutes / 60
  return Math.round(metValue * weightKg * durationHours)
}

export function getWorkoutTypeMET(workoutType: string): number {
  switch (workoutType) {
    case 'run':
      return MET_VALUES['run']
    case 'pullups':
      return MET_VALUES['pullups']
    case 'pushups':
      return MET_VALUES['pushups']
    case 'plank':
      return MET_VALUES['plank']
    case 'custom':
      return MET_VALUES['custom']
    default:
      return MET_VALUES['custom']
  }
}
