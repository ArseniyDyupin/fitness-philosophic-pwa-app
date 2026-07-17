import { dbHelpers } from '@services/data'
import { aiKeyStore } from '@/services/ai/aiGateway'

const APP_STORAGE_KEYS = [
  'language',
  'error_logs'
]

export async function deleteAllLocalData(): Promise<void> {
  await dbHelpers.clearAllData()
  aiKeyStore.set('')

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('ai-trainer:') || APP_STORAGE_KEYS.includes(key)) {
      localStorage.removeItem(key)
    }
  })

  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('ai-trainer:') || APP_STORAGE_KEYS.includes(key)) {
      sessionStorage.removeItem(key)
    }
  })

  if ('caches' in globalThis) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
  }
}
