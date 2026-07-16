import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { aiService } from '@services/ai'
import type { AIPlan } from '@/types/models'

interface AIState {
  apiKey: string
  isConfigured: boolean
  isTestingConnection: boolean
  lastConnectionTest: Date | null
  connectionTestResult: boolean | null
  plans: AIPlan[]
  
  // Actions
  setApiKey: (key: string) => void
  clearApiKey: () => void
  testConnection: () => Promise<boolean>
  checkConfiguration: () => void
  hasKey: () => boolean
  addPlan: (plan: AIPlan) => Promise<void>
  updatePlan: (id: string, plan: Partial<AIPlan>) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  loadPlans: () => Promise<void>
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: '',
      isConfigured: false,
      isTestingConnection: false,
      lastConnectionTest: null,
      connectionTestResult: null,
      plans: [],

      setApiKey: (key: string) => {
        aiService.setApiKey(key)
        set({
          apiKey: key,
          isConfigured: aiService.hasApiKey(),
          connectionTestResult: null, // Reset test result when key changes
          lastConnectionTest: null
        })
      },

      clearApiKey: () => {
        aiService.setApiKey('')
        set({
          apiKey: '',
          isConfigured: false,
          connectionTestResult: null,
          lastConnectionTest: null
        })
      },

      testConnection: async () => {
        set({ isTestingConnection: true })
        try {
          const result = await aiService.testConnection()
          const now = new Date()
          set({
            connectionTestResult: result,
            lastConnectionTest: now,
            isTestingConnection: false
          })
          return result
        } catch (error) {
          set({
            connectionTestResult: false,
            lastConnectionTest: new Date(),
            isTestingConnection: false
          })
          return false
        }
      },

      checkConfiguration: () => {
        const hasKey = aiService.hasApiKey()
        const currentKey = aiService.getApiKey()
        set({
          apiKey: currentKey,
          isConfigured: hasKey
        })
      },

      hasKey: () => {
        return aiService.hasApiKey()
      },

      addPlan: async (plan: AIPlan) => {
        set(state => ({
          plans: [...state.plans, plan]
        }))
      },

      updatePlan: async (id: string, planData: Partial<AIPlan>) => {
        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === id ? { ...plan, ...planData } : plan
          )
        }))
      },

      deletePlan: async (id: string) => {
        set(state => ({
          plans: state.plans.filter(plan => plan.id !== id)
        }))
      },

      loadPlans: async () => {
        // For now, just return empty array
        // In a real implementation, this would load from a database
        set({ plans: [] })
      }
    }),
    {
      name: 'ai-trainer:ai-config',
      partialize: (state) => ({
        // Don't persist sensitive data, only configuration state
        isConfigured: state.isConfigured,
        lastConnectionTest: state.lastConnectionTest,
        connectionTestResult: state.connectionTestResult
      }),
      // Custom serialization/deserialization for Date objects
      serialize: (state) => JSON.stringify({
        ...state.state,
        lastConnectionTest: state.state.lastConnectionTest?.toISOString() || null
      }),
      deserialize: (str) => {
        const parsed = JSON.parse(str)
        return {
          state: {
            ...parsed,
            lastConnectionTest: parsed.lastConnectionTest ? new Date(parsed.lastConnectionTest) : null
          },
          version: 0
        }
      }
    }
  )
)

// Initialize store on module load
useAIStore.getState().checkConfiguration()
