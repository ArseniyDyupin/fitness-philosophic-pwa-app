import { useProfileStore } from '@/stores/profile.store'
import type { WorkoutType } from '@/types/models'

export function requireOnboarding(to: any, from: any, next: any) {
  const profileStore = useProfileStore()
  
  if (!profileStore.hasCompletedOnboarding) {
    next({ name: 'onboarding-goals' })
  } else {
    next()
  }
}

export function requireNoOnboarding(to: any, from: any, next: any) {
  const profileStore = useProfileStore()
  
  if (profileStore.hasCompletedOnboarding) {
    next({ name: 'home' })
  } else {
    next()
  }
}

export function validateWorkoutType(type: string): type is WorkoutType {
  return ['run', 'pullups', 'pushups', 'plank', 'custom'].includes(type)
}

export function validateAge(age: number): boolean {
  return age >= 12 && age <= 90
}

export function validateWeight(weight: number): boolean {
  return weight >= 30 && weight <= 250
}

export function validateHeight(height: number): boolean {
  return height >= 100 && height <= 250
}

export function validateCalories(calories: number): boolean {
  return calories >= 0 && calories <= 10000
}

export function validateDuration(duration: number): boolean {
  return duration >= 1 && duration <= 480
}

export function validateFrequency(frequency: number): boolean {
  return frequency >= 1 && frequency <= 7
}

export function validateWorkoutDuration(duration: number): boolean {
  return duration >= 1 && duration <= 480
}

export function validateDistance(distance: number): boolean {
  return distance >= 0.1 && distance <= 100
}

export function validateReps(reps: number): boolean {
  return reps >= 1 && reps <= 1000
}

export function validateSets(sets: number): boolean {
  return sets >= 1 && sets <= 100
}

export function validateWeightLifting(weight: number): boolean {
  return weight >= 0 && weight <= 500
}

export function isOnline(): boolean {
  return navigator.onLine
}

export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

export function canInstallPWA(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}
