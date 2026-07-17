import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readdir, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'

const runtimeIcons = new Set([
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'maskable-icon-192.png',
  'maskable-icon-512.png'
])

function pruneUnusedPublicIcons() {
  return {
    name: 'prune-unused-public-icons',
    apply: 'build' as const,
    enforce: 'post' as const,
    async closeBundle() {
      const iconsDirectory = resolve('dist/icons')
      const files = await readdir(iconsDirectory)
      await Promise.all(files
        .filter(file => !runtimeIcons.has(file))
        .map(file => unlink(resolve(iconsDirectory, file))))
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        skipWaiting: false,
        clientsClaim: false,
        globPatterns: ['**/*.{js,css,html,ico,webmanifest,woff2}']
      },
      includeAssets: [
        'icons/favicon.ico',
        'icons/favicon-16x16.png',
        'icons/favicon-32x32.png',
        'icons/apple-touch-icon.png',
        'icons/android-chrome-192x192.png',
        'icons/android-chrome-512x512.png',
        'icons/maskable-icon-192.png',
        'icons/maskable-icon-512.png'
      ],
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
    }),
    pruneUnusedPublicIcons()
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
          'toast-vendor': ['react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
})
