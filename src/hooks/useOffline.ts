import { useState, useEffect } from 'react'

export interface OfflineStatus {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
}

export function useOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    wasOffline: false
  })

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        isOnline: true,
        isOffline: false,
        wasOffline: prev.isOffline
      }))
    }

    const handleOffline = () => {
      setStatus(prev => ({
        isOnline: false,
        isOffline: true,
        wasOffline: prev.isOffline
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return status
}
