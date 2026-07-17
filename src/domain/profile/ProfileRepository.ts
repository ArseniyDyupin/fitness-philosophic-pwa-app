import type { Profile } from '@/types/models'

export interface ProfileRepository {
  get(): Promise<Profile | undefined>
  put(profile: Profile): Promise<void>
  delete(): Promise<void>
}
