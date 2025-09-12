import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import { metricsService } from '@services/fitness'
import { aiBodyService } from '@services/ai'
import { startOfWeek, format } from 'date-fns'
import { X, Camera, Save, Sparkles, Loader } from 'lucide-react'
import type { MetricDef, MetricEntry, PhotoAsset, AiBodyEval } from '@/types/body-metrics'

interface BodyMetricsModalProps {
  isOpen: boolean
  onClose: () => void
  weekStart?: Date
}

const BodyMetricsModal: React.FC<BodyMetricsModalProps> = ({ isOpen, onClose, weekStart }) => {
  const t = useTranslations()
  const { profile } = useProfileStore()
  const [activeDefs, setActiveDefs] = useState<MetricDef[]>([])
  const [entries, setEntries] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<PhotoAsset[]>([])
  const [allowPhotoAnalysis, setAllowPhotoAnalysis] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const targetDate = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })
  const dateStr = format(targetDate, 'yyyy-MM-dd')

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const defs = await metricsService.getActiveDefs()
      setActiveDefs(defs)
      
      // Load existing entries for this date
      const existingEntries = await metricsService.getEntriesByRange(dateStr, dateStr)
      const entriesMap: Record<string, number> = {}
      const notesMap: Record<string, string> = {}
      
      existingEntries.forEach(entry => {
        const def = defs.find(d => d.id === entry.defId)
        if (def) {
          entriesMap[def.key] = entry.value
          if (entry.note) {
            notesMap[def.key] = entry.note
          }
        }
      })
      
      setEntries(entriesMap)
      setNotes(notesMap)
      
      // Load existing photos for this date
      const existingPhotos = await metricsService.getPhotosByDate(dateStr)
      setPhotos(existingPhotos)
      
    } catch (error) {
      console.error('Failed to load metrics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = (def: MetricDef, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setEntries(prev => ({ ...prev, [def.key]: 0 }))
      return
    }

    // Validate value
    const validation = metricsService.validateEntry(def, numValue)
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, [def.key]: validation.error || 'Invalid value' }))
      return
    }

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[def.key]
      return newErrors
    })

    setEntries(prev => ({ ...prev, [def.key]: numValue }))
  }

  const handleNoteChange = (def: MetricDef, note: string) => {
    setNotes(prev => ({ ...prev, [def.key]: note }))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      const newPhotos: PhotoAsset[] = []
      
      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const file = files[i]
        const compressedDataUrl = await metricsService.compressPhoto(file)
        
        const photo: PhotoAsset = {
          id: `photo_${Date.now()}_${i}`,
          date: dateStr,
          kind: 'other', // Default kind, could be improved with UI selection
          mime: file.type,
          dataUrl: compressedDataUrl,
          createdAt: new Date().toISOString()
        }
        
        newPhotos.push(photo)
      }
      
      setPhotos(prev => [...prev, ...newPhotos])
    } catch (error) {
      console.error('Failed to process photos:', error)
    }
  }

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const handleSave = async (withAnalysis: boolean = false) => {
    try {
      setIsSaving(true)
      
      // Validate required fields
      const requiredDefs = activeDefs.filter(def => def.isRequired)
      const missingRequired = requiredDefs.filter(def => !entries[def.key] || entries[def.key] === 0)
      
      if (missingRequired.length > 0) {
        alert(t.metrics?.fillRequired || 'Please fill in all required fields')
        return
      }

      // Create metric entries
      const metricEntries: MetricEntry[] = activeDefs
        .filter(def => entries[def.key] !== undefined && entries[def.key] !== 0)
        .map(def => ({
          id: `entry_${Date.now()}_${def.key}`,
          defId: def.id,
          date: dateStr,
          value: entries[def.key],
          note: notes[def.key] || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))

      // Save entries and photos
      await Promise.all([
        metricsService.saveEntries(metricEntries),
        photos.length > 0 ? metricsService.savePhotos(photos) : Promise.resolve()
      ])

      // AI Analysis if requested
      if (withAnalysis && allowPhotoAnalysis && profile) {
        setIsAnalyzing(true)
        try {
          // Get metrics history for analysis
          const metricsHistory = await getMetricsHistory()
          
          const analysisInput = {
            profile: {
              gender: profile.gender,
              age: profile.age,
              height: profile.height,
              weight: profile.weight,
              goals: profile.goal,
              constraints: Array.isArray(profile.constraints) ? profile.constraints.join(', ') : profile.constraints
            },
            metricsHistory,
            photos: allowPhotoAnalysis ? photos : undefined,
            language: profile.language || 'en'
          }

          const analysisResult = await aiBodyService.evaluate(analysisInput)
          
          // Save AI evaluation
          const aiEval: AiBodyEval = {
            id: `eval_${Date.now()}`,
            weekStart: dateStr,
            model: 'gpt-4o-mini',
            language: profile.language || 'en',
            consent: allowPhotoAnalysis,
            score: analysisResult.score,
            summary: analysisResult.summary,
            tips: analysisResult.tips,
            tags: analysisResult.tags,
            comparedTo: analysisResult.comparedTo,
            photoIds: allowPhotoAnalysis ? photos.map(p => p.id) : undefined,
            createdAt: new Date().toISOString()
          }

          await aiBodyService.saveEvaluation(aiEval)
        } catch (error) {
          console.error('AI analysis failed:', error)
          // Don't fail the save if AI analysis fails
        } finally {
          setIsAnalyzing(false)
        }
      }

      onClose()
    } catch (error) {
      console.error('Failed to save metrics:', error)
      alert(t.error || 'Failed to save metrics')
    } finally {
      setIsSaving(false)
    }
  }

  const getMetricsHistory = async () => {
    // Get last 8 weeks of metrics for analysis
    const history = []
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 })
      const weekStr = format(weekStart, 'yyyy-MM-dd')
      const weekEntries = await metricsService.getEntriesByRange(weekStr, weekStr)
      
      const weekMetrics: Record<string, number> = {}
      weekEntries.forEach(entry => {
        const def = activeDefs.find(d => d.id === entry.defId)
        if (def) {
          weekMetrics[def.key] = entry.value
        }
      })
      
      if (Object.keys(weekMetrics).length > 0) {
        history.push({
          date: weekStr,
          metrics: weekMetrics
        })
      }
    }
    
    return history.reverse()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t.metrics?.modal?.title || 'Weekly Measurements'}
            </h2>
            <p className="text-sm text-gray-600">
              {format(targetDate, 'MMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin h-8 w-8 text-primary-600" />
            </div>
          ) : (
            <>
              {/* Metrics Form */}
              <div className="space-y-4">
                {activeDefs.map((def) => (
                  <div key={def.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t.metrics?.default?.[def.key as keyof typeof t.metrics.default] || def.label}
                      {def.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step={def.precision ? `0.${'0'.repeat(def.precision - 1)}1` : '0.1'}
                        value={entries[def.key] || ''}
                        onChange={(e) => handleValueChange(def, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                          errors[def.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={`${def.min || 0} - ${def.max || 1000}`}
                      />
                      <span className="text-sm text-gray-500 min-w-[3rem]">
                        {t.metrics?.units?.[def.unit as keyof typeof t.metrics.units] || def.unit}
                      </span>
                    </div>
                    {errors[def.key] && (
                      <p className="text-sm text-red-600">{errors[def.key]}</p>
                    )}
                    
                    <textarea
                      value={notes[def.key] || ''}
                      onChange={(e) => handleNoteChange(def, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t.metrics?.note || 'Add a note...'}
                    />
                  </div>
                ))}
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t.metrics?.modal?.addPhoto || 'Add Photos'}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {photos.length}/3
                  </span>
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <Camera className="w-6 h-6 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {t.metrics?.modal?.addPhoto || 'Add Photos'}
                  </span>
                </label>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.dataUrl}
                          alt="Uploaded photo"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Analysis Consent */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="photo-analysis"
                  checked={allowPhotoAnalysis}
                  onChange={(e) => setAllowPhotoAnalysis(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="photo-analysis" className="text-sm text-gray-700">
                  {t.metrics?.modal?.consent || 'Allow sending photos for AI analysis'}
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t.cancel || 'Cancel'}
          </button>
          
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSaving ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{t.metrics?.modal?.save || 'Save'}</span>
          </button>
          
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving || isLoading || isAnalyzing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{t.metrics?.modal?.saveAndAnalyze || 'Save and Analyze'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BodyMetricsModal
