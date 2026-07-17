import { db } from '@services/data'
import type { Profile } from '@/types/models'
import type { ProfileRepository } from '@/domain/profile/ProfileRepository'

export const dexieProfileRepository: ProfileRepository = {
  get: () => db.profiles.get('me'),
  put: async (profile: Profile) => { await db.profiles.put({ ...profile, id: 'me' }) },
  delete: async () => { await db.profiles.delete('me') }
}
