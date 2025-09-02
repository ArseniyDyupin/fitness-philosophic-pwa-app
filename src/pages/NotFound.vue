<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 class="text-2xl font-semibold text-gray-900 mb-4">{{ t.pageNotFound }}</h1>
      <p class="text-gray-600 mb-8">
        {{ t.pageNotFoundDescription }}
      </p>
      <router-link 
        to="/" 
        class="btn-primary"
      >
        {{ t.goHome }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n.store'

const i18nStore = useI18nStore()
const { t } = i18nStore
</script>
