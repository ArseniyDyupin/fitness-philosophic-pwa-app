<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.welcomeToOnboarding }}</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.selectLanguageTitle }}</h2>
        <p class="text-sm text-gray-600 mb-6">
                      {{ t.selectLanguageDescription }}<br>
            {{ t.selectLanguageDescriptionRu }}
        </p>
        
        <div class="space-y-4">
          <!-- English Option -->
          <button
            @click="selectLanguage('en')"
            class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            :class="selectedLanguage === 'en' ? 'border-primary-500 bg-primary-50' : ''"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-bold text-blue-600">EN</span>
              </div>
              <div>
                <div class="font-medium text-gray-900">English</div>
                <div class="text-sm text-gray-500">{{ t.continueInEnglish }}</div>
              </div>
            </div>
          </button>

          <!-- Russian Option -->
          <button
            @click="selectLanguage('ru')"
            class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            :class="selectedLanguage === 'ru' ? 'border-primary-500 bg-primary-50' : ''"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-bold text-red-600">RU</span>
              </div>
              <div>
                <div class="font-medium text-gray-900">Русский</div>
                <div class="text-sm text-gray-500">{{ t.continueInRussian }}</div>
              </div>
            </div>
          </button>
        </div>

        <div class="mt-6">
          <button
            @click="continueToOnboarding"
            :disabled="!selectedLanguage"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ selectedLanguage === 'ru' ? t.continueInRussian : t.continueInEnglish }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n.store'
import type { Language } from '@/stores/i18n.store'

const router = useRouter()
const i18nStore = useI18nStore()

const { t } = i18nStore

const selectedLanguage = ref<Language | null>(null)

function selectLanguage(lang: Language) {
  selectedLanguage.value = lang
  i18nStore.setLanguage(lang)
}

function continueToOnboarding() {
  if (!selectedLanguage.value) return
  
  // Store language preference
  localStorage.setItem('selectedLanguage', selectedLanguage.value)
  
  // Navigate to onboarding selection
  router.push('/onboarding')
}
</script>
