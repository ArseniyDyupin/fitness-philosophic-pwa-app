import React, { useState, useEffect } from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useProfileStore } from '../../stores/profile.store'
import { metricsService } from '../../services/metrics.service'
import { Plus, Trash2, Edit, Save, X, TestTube } from 'lucide-react'
import type { MetricDef, BodyMetricsSettings } from '../../types/body-metrics'

const SettingsBodyMetrics: React.FC = () => {
  const t = useTranslations()
  const { profile } = useProfileStore()
  const [metricDefs, setMetricDefs] = useState<MetricDef[]>([])
  const [settings, setSettings] = useState<BodyMetricsSettings>({
    allowPhotoAnalysis: false,
    collectionFrequency: 'weekly',
    weekStartsOn: 1,
    reminderEnabled: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMetric, setEditingMetric] = useState<MetricDef | null>(null)
  const [newMetric, setNewMetric] = useState<Partial<MetricDef>>({
    key: '',
    label: '',
    unit: 'cm',
    precision: 1,
    min: 0,
    max: 1000,
    color: '#3B82F6',
    isActive: true,
    isRequired: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [defs, settingsData] = await Promise.all([
        metricsService.getAllDefs(),
        metricsService.getSettings()
      ])
      setMetricDefs(defs)
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to load metrics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (metric: MetricDef) => {
    try {
      const updated = { ...metric, isActive: !metric.isActive, updatedAt: new Date().toISOString() }
      await metricsService.saveDef(updated)
      setMetricDefs(prev => prev.map(m => m.id === metric.id ? updated : m))
    } catch (error) {
      console.error('Failed to toggle metric:', error)
    }
  }

  const handleDeleteMetric = async (metric: MetricDef) => {
    if (!confirm(t.metrics?.confirmDelete || 'Are you sure you want to delete this metric?')) {
      return
    }

    try {
      await metricsService.deleteDef(metric.id)
      setMetricDefs(prev => prev.filter(m => m.id !== metric.id))
    } catch (error) {
      console.error('Failed to delete metric:', error)
    }
  }

  const handleSaveMetric = async () => {
    if (!newMetric.key || !newMetric.label) {
      alert(t.metrics?.fillRequired || 'Please fill in required fields')
      return
    }

    try {
      const metric: MetricDef = {
        id: editingMetric?.id || `custom_${Date.now()}`,
        key: newMetric.key,
        label: newMetric.label,
        unit: newMetric.unit || 'cm',
        precision: newMetric.precision || 1,
        min: newMetric.min,
        max: newMetric.max,
        color: newMetric.color || '#3B82F6',
        isActive: newMetric.isActive ?? true,
        isRequired: newMetric.isRequired ?? false,
        createdAt: editingMetric?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await metricsService.saveDef(metric)
      
      if (editingMetric) {
        setMetricDefs(prev => prev.map(m => m.id === metric.id ? metric : m))
      } else {
        setMetricDefs(prev => [...prev, metric])
      }

      setShowAddForm(false)
      setEditingMetric(null)
      setNewMetric({
        key: '',
        label: '',
        unit: 'cm',
        precision: 1,
        min: 0,
        max: 1000,
        color: '#3B82F6',
        isActive: true,
        isRequired: false
      })
    } catch (error) {
      console.error('Failed to save metric:', error)
    }
  }

  const handleEditMetric = (metric: MetricDef) => {
    setEditingMetric(metric)
    setNewMetric(metric)
    setShowAddForm(true)
  }

  const handleCancelEdit = () => {
    setShowAddForm(false)
    setEditingMetric(null)
    setNewMetric({
      key: '',
      label: '',
      unit: 'cm',
      precision: 1,
      min: 0,
      max: 1000,
      color: '#3B82F6',
      isActive: true,
      isRequired: false
    })
  }

  const handleTestEntry = () => {
    // This would open the metrics modal for testing
    console.log('Opening test metrics entry modal')
  }

  const handleSettingsChange = async (key: keyof BodyMetricsSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      await metricsService.updateSettings(newSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t.metrics?.settings || 'Settings'}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t.metrics?.allowPhotoAnalysis || 'Allow photo analysis'}
              </label>
              <p className="text-xs text-gray-500">
                {t.metrics?.photoAnalysisDesc || 'Allow sending photos to AI for analysis'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowPhotoAnalysis}
              onChange={(e) => handleSettingsChange('allowPhotoAnalysis', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t.metrics?.reminderEnabled || 'Enable reminders'}
              </label>
              <p className="text-xs text-gray-500">
                {t.metrics?.reminderDesc || 'Show weekly reminder to fill metrics'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => handleSettingsChange('reminderEnabled', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Default Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.metrics?.defaultMetrics || 'Default Metrics'}
          </h3>
          <button
            onClick={handleTestEntry}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <TestTube size={16} />
            <span>{t.metrics?.testEntry || 'Test Entry'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {metricDefs.map((metric) => (
            <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {t.metrics?.default?.[metric.key as keyof typeof t.metrics.default] || metric.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {metric.unit} • {metric.isRequired ? 'Required' : 'Optional'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={metric.isActive}
                  onChange={() => handleToggleActive(metric)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {metric.key.startsWith('custom_') && (
                  <>
                    <button
                      onClick={() => handleEditMetric(metric)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteMetric(metric)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Metric */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.metrics?.customMetrics || 'Custom Metrics'}
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus size={16} />
            <span>{t.metrics?.addCustom || 'Add Custom'}</span>
          </button>
        </div>

        {showAddForm && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metrics?.metricKey || 'Metric Key'} *
                </label>
                <input
                  type="text"
                  value={newMetric.key || ''}
                  onChange={(e) => setNewMetric({ ...newMetric, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., custom_metric"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metrics?.metricLabel || 'Metric Label'} *
                </label>
                <input
                  type="text"
                  value={newMetric.label || ''}
                  onChange={(e) => setNewMetric({ ...newMetric, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Custom Measurement"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metrics?.unit || 'Unit'}
                </label>
                <select
                  value={newMetric.unit || 'cm'}
                  onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="kg">kg</option>
                  <option value="cm">cm</option>
                  <option value="%">%</option>
                  <option value="count">count</option>
                  <option value="custom">custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metrics?.precision || 'Precision'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={newMetric.precision || 1}
                  onChange={(e) => setNewMetric({ ...newMetric, precision: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metrics?.minValue || 'Min Value'}
                </label>
                <input
                  type="number"
                  value={newMetric.min || 0}
                  onChange={(e) => setNewMetric({ ...newMetric, min: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metrics?.maxValue || 'Max Value'}
                </label>
                <input
                  type="number"
                  value={newMetric.max || 1000}
                  onChange={(e) => setNewMetric({ ...newMetric, max: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMetric.isActive ?? true}
                  onChange={(e) => setNewMetric({ ...newMetric, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  {t.metrics?.isActive || 'Active'}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMetric.isRequired ?? false}
                  onChange={(e) => setNewMetric({ ...newMetric, isRequired: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  {t.metrics?.isRequired || 'Required'}
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <X size={16} />
                <span>{t.cancel || 'Cancel'}</span>
              </button>
              <button
                onClick={handleSaveMetric}
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{t.save || 'Save'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsBodyMetrics
