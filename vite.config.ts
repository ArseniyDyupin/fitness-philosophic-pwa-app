import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'AI Тренер',
        short_name: 'AI Тренер',
        description: 'ИИ-тренер по фитнесу с отслеживанием тренировок и аналитикой',
        theme_color: '#2563eb',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/maskable-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@app': '/src/app',
      '@pages': '/src/ui/pages',
      '@templates': '/src/templates',
      '@atoms': '/src/ui/atoms',
      '@molecules': '/src/ui/molecules',
      '@organisms': '/src/ui/organisms',
      '@modals': '/src/ui/modals',
      '@hooks': '/src/hooks',
      '@stores': '/src/stores',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@i18n': '/src/i18n',
      '@types': '/src/types',
      '@lib': '/src/lib',
      '@navigation': '/src/navigation',
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'zod'],
          'state-vendor': ['zustand'],
          'db-vendor': ['dexie'],
          'toast-vendor': ['react-hot-toast'],
          
          // App chunks
          'pages': [
            './src/ui/pages/HomePage.tsx',
            './src/ui/pages/WorkoutsPage.tsx',
            './src/ui/pages/StatsPage.tsx',
            './src/ui/pages/SettingsPage.tsx'
          ],
          'organisms': [
            './src/ui/organisms/home',
            './src/ui/organisms/stats',
            './src/ui/organisms/workouts'
          ],
          'services': [
            './src/services/ai',
            './src/services/data',
            './src/services/fitness'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
