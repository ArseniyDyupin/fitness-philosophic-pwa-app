import { registerSW } from 'virtual:pwa-register'
import { toast } from 'react-hot-toast'
import { translations } from '@stores/i18n.store'

// Функция для получения текущего языка
const getCurrentLanguage = () => {
  const saved = localStorage.getItem('language')
  return (saved && ['en', 'ru'].includes(saved)) ? saved as 'en' | 'ru' : 'ru'
}

// Функция для показа toast с кнопкой обновления
const showUpdateToast = () => {
  const currentLang = getCurrentLanguage()
  const t = translations[currentLang]
  
  // Создаем HTML элементы для toast
  const toastElement = document.createElement('div')
  toastElement.className = 'flex items-center justify-between gap-3'
  toastElement.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span class="text-sm font-medium text-gray-900">
        ${t.pwa?.updateAvailable || 'Доступно обновление'}
      </span>
    </div>
    <div class="flex gap-2">
      <button id="update-btn" class="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus-visible-ring">
        ${t.pwa?.update || 'Обновить'}
      </button>
      <button id="later-btn" class="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors focus-visible-ring rounded-md">
        ${t.pwa?.later || 'Позже'}
      </button>
    </div>
  `
  
  // Добавляем обработчики событий
  const updateBtn = toastElement.querySelector('#update-btn')
  const laterBtn = toastElement.querySelector('#later-btn')
  
  updateBtn?.addEventListener('click', () => {
    toast.dismiss(toastId)
    updateSW(true)
  })
  
  laterBtn?.addEventListener('click', () => {
    toast.dismiss(toastId)
  })
  
  const toastId = toast(toastElement, {
    duration: Infinity,
    position: 'top-center',
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '12px 16px',
      maxWidth: '400px',
      width: '100%'
    }
  })
}

// Функция для показа toast офлайн готовности
const showOfflineToast = () => {
  const currentLang = getCurrentLanguage()
  const t = translations[currentLang]
  
  toast.success(
    t.pwa?.offlineReady || 'Приложение доступно офлайн',
    {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: 'white',
        borderRadius: '0.5rem',
        padding: '12px 16px',
        maxWidth: '300px'
      }
    }
  )
}

// Регистрация Service Worker
export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA: Update available')
    showUpdateToast()
  },
  onOfflineReady() {
    console.log('PWA: App ready to work offline')
    showOfflineToast()
  },
  onRegistered(registration) {
    console.log('PWA: Service Worker registered', registration)
  },
  onRegisterError(error) {
    console.error('PWA: Service Worker registration failed', error)
  }
})

// Функция для ручной проверки обновлений
export const checkForUpdates = () => {
  if (updateSW) {
    updateSW(true)
  }
}

// Функция для получения статуса PWA
export const getPWAStatus = () => {
  return {
    isOnline: navigator.onLine,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true,
    hasServiceWorker: 'serviceWorker' in navigator
  }
}
