import type { Profile } from '@/types/models'
import type { ProfileRepository } from '@/domain/profile/ProfileRepository'
import { dexieProfileRepository } from '@/infrastructure/repositories/dexieProfileRepository'

export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly now: () => Date = () => new Date()
  ) {}

  get(): Promise<Profile | undefined> {
    return this.repository.get()
  }

  async create(data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const timestamp = this.now().toISOString()
    const profile: Profile = {
      ...data,
      id: 'me',
      createdAt: timestamp,
      updatedAt: timestamp
    }
    await this.repository.put(profile)
    return profile
  }

  async update(updates: Partial<Profile>): Promise<Profile> {
    const current = await this.repository.get()
    if (!current) throw new Error('No profile to update')

    const profile: Profile = {
      ...current,
      ...updates,
      id: 'me',
      createdAt: current.createdAt,
      updatedAt: this.now().toISOString()
    }
    await this.repository.put(profile)
    return profile
  }

  async import(profileData: Profile): Promise<Profile> {
    const current = await this.repository.get()
    const timestamp = this.now().toISOString()
    const profile: Profile = {
      ...profileData,
      id: 'me',
      createdAt: current?.createdAt ?? profileData.createdAt ?? timestamp,
      updatedAt: timestamp
    }
    await this.repository.put(profile)
    return profile
  }

  delete(): Promise<void> {
    return this.repository.delete()
  }
}

export const profileService = new ProfileService(dexieProfileRepository)
