// Определение метрик (настраивается в Settings)
export interface MetricDef {
  id: string
  key: string                // "weight", "waist", "bicep", "custom_X"
  label: string              // i18n ключ или пользовательская строка
  unit: "kg" | "cm" | "%" | "count" | "custom"
  precision?: number         // кол-во знаков после запятой (UI)
  min?: number
  max?: number              // валидация
  color?: string            // цвет серии на графике
  isActive: boolean         // включена ли метрика
  isRequired?: boolean      // обязательна при еженедельном вводе
  createdAt: string
  updatedAt: string
}

// Измерения конкретной метрики
export interface MetricEntry {
  id: string
  defId: string              // FK -> MetricDef.id
  date: string              // ISO day (локаль пользователя)
  value: number
  note?: string
  createdAt: string
  updatedAt: string
}

// Фото-ассет (хранение локально; в экспорт/импорт включаем ссылку/базу64)
export interface PhotoAsset {
  id: string
  date: string              // ISO day (дата загрузки)
  kind: "front" | "side" | "back" | "other"
  mime: string
  dataUrl: string           // base64 (сжатая версия)
  createdAt: string
}

// ИИ-оценка состояния (по неделе)
export interface AiBodyEval {
  id: string
  weekStart: string         // ISO Monday (startOfWeek)
  model: string             // gpt-4o-mini (vision)
  language: "ru" | "en"
  consent: boolean          // согласие на отправку фото
  score?: number            // 0–100 (общая субъективная оценка прогресса)
  summary: string           // краткое резюме
  tips?: string[]           // рекомендации
  tags?: string[]           // например: "plateau","progress"
  comparedTo?: { weeks: number; note: string } // сравнение с прошлым периодом
  photoIds?: string[]       // связка с PhotoAsset (если были)
  createdAt: string
}

// Данные для ИИ-анализа
export interface BodyAnalysisInput {
  profile: {
    gender: string
    age: number
    height: number
    weight: number
    goals: string
    constraints?: string
  }
  metricsHistory: Array<{
    date: string
    metrics: Record<string, number>
  }>
  photos?: PhotoAsset[]
  language: "ru" | "en"
}

// Результат ИИ-анализа
export interface BodyAnalysisResult {
  score?: number
  summary: string
  tips?: string[]
  tags?: string[]
  comparedTo?: { weeks: number; note: string }
}

// Настройки метрик в профиле
export interface BodyMetricsSettings {
  allowPhotoAnalysis: boolean
  collectionFrequency: 'weekly' | 'daily' | 'manual'
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
  reminderEnabled: boolean
}

// Стандартные метрики
export const DEFAULT_METRICS: Omit<MetricDef, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    key: 'weight',
    label: 'metrics.default.weight',
    unit: 'kg',
    precision: 1,
    min: 30,
    max: 200,
    color: '#3B82F6',
    isActive: true,
    isRequired: true
  },
  {
    key: 'waist',
    label: 'metrics.default.waist',
    unit: 'cm',
    precision: 1,
    min: 50,
    max: 150,
    color: '#10B981',
    isActive: false,
    isRequired: false
  },
  {
    key: 'chest',
    label: 'metrics.default.chest',
    unit: 'cm',
    precision: 1,
    min: 70,
    max: 150,
    color: '#F59E0B',
    isActive: false,
    isRequired: false
  },
  {
    key: 'bicep',
    label: 'metrics.default.bicep',
    unit: 'cm',
    precision: 1,
    min: 20,
    max: 60,
    color: '#8B5CF6',
    isActive: false,
    isRequired: false
  },
  {
    key: 'thigh',
    label: 'metrics.default.thigh',
    unit: 'cm',
    precision: 1,
    min: 40,
    max: 100,
    color: '#EF4444',
    isActive: false,
    isRequired: false
  },
  {
    key: 'bodyFat',
    label: 'metrics.default.bodyFat',
    unit: '%',
    precision: 1,
    min: 3,
    max: 50,
    color: '#6B7280',
    isActive: false,
    isRequired: false
  }
]
