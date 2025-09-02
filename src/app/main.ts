import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './tailwind.css'
import { useI18nStore } from '@/stores/i18n.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize i18n store
const i18nStore = useI18nStore()
i18nStore.initializeLanguage()

app.mount('#app')
