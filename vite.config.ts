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
        name: 'AI Trainer',
        short_name: 'AI Trainer',
        description: 'AI-powered fitness trainer',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@app': '/src/app',
      '@pages': '/src/pages',
      '@templates': '/src/templates',
      '@atoms': '/src/ui/atoms',
      '@molecules': '/src/ui/molecules',
      '@organisms': '/src/ui/organisms',
      '@modals': '/src/ui/modals',
      '@features': '/src/features',
      '@hooks': '/src/hooks',
      '@stores': '/src/stores',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@i18n': '/src/i18n',
      '@types': '/src/types',
      '@lib': '/src/lib',
      '@': '/src'
    }
  }
})
