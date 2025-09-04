import React, { useState, useEffect } from 'react'
import { useTranslations } from '../stores/i18n.store'
import { useAIStore } from '../stores/ai.store'
import { Eye, EyeOff, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react'

const AISettings: React.FC = () => {
  const t = useTranslations()
  const {
    apiKey,
    isConfigured,
    isTestingConnection,
    lastConnectionTest,
    connectionTestResult,
    setApiKey,
    clearApiKey,
    testConnection
  } = useAIStore()

  const [inputKey, setInputKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Initialize input with masked key if exists
    if (apiKey) {
      setInputKey(apiKey.length > 8 ? `${apiKey.slice(0, 8)}${'*'.repeat(apiKey.length - 8)}` : apiKey)
    }
  }, [apiKey])

  const handleSaveKey = () => {
    if (!inputKey.trim()) {
      setMessage({ type: 'error', text: t.aiSettings?.pleaseEnterKey || 'Please enter an API key' })
      return
    }

    // Don't save if it's a masked key
    if (inputKey.includes('*')) {
      setMessage({ type: 'error', text: t.aiSettings?.keyNotChanged || 'Key was not changed' })
      return
    }

    setApiKey(inputKey.trim())
    setMessage({ type: 'success', text: t.aiSettings?.keySaved || 'API key saved successfully' })
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleClearKey = () => {
    if (confirm(t.aiSettings?.confirmClear || 'Are you sure you want to clear the API key?')) {
      clearApiKey()
      setInputKey('')
      setMessage({ type: 'success', text: t.aiSettings?.keyCleared || 'API key cleared' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleTestConnection = async () => {
    if (!isConfigured) {
      setMessage({ type: 'error', text: t.aiSettings?.configureFirst || 'Please configure API key first' })
      return
    }

    const success = await testConnection()
    setMessage({
      type: success ? 'success' : 'error',
      text: success 
        ? (t.aiSettings?.connectionSuccess || 'Connection successful!')
        : (t.aiSettings?.connectionFailed || 'Connection failed. Please check your API key.')
    })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleInputChange = (value: string) => {
    setInputKey(value)
    // Clear any existing messages when user starts typing
    if (message) setMessage(null)
  }

  const getConnectionStatus = () => {
    if (!lastConnectionTest) return null
    
    // Handle both Date object and string (from localStorage deserialization)
    const testTime = lastConnectionTest instanceof Date 
      ? lastConnectionTest.getTime() 
      : new Date(lastConnectionTest).getTime()
    
    const isRecent = Date.now() - testTime < 5 * 60 * 1000 // 5 minutes
    if (!isRecent) return null

    return connectionTestResult
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t.aiSettings?.title || 'AI Configuration'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.aiSettings?.description || 'Configure your OpenAI API key to enable AI features like workout analysis and recommendations.'}
        </p>
      </div>

      {/* API Key Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.aiSettings?.apiKeyLabel || 'OpenAI API Key'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t.aiSettings?.apiKeyPlaceholder || 'sk-...'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSaveKey}
            className="btn-primary"
          >
            {t.aiSettings?.saveKey || 'Save Key'}
          </button>
          
          {isConfigured && (
            <>
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="btn-secondary flex items-center space-x-2"
              >
                {isTestingConnection ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                <span>
                  {isTestingConnection 
                    ? (t.aiSettings?.testing || 'Testing...') 
                    : (t.aiSettings?.testConnection || 'Test Connection')
                  }
                </span>
              </button>
              
              <button
                onClick={handleClearKey}
                className="btn-secondary text-red-600 hover:text-red-700"
              >
                {t.aiSettings?.clearKey || 'Clear Key'}
              </button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Connection Status */}
        {connectionStatus !== null && !message && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            connectionStatus 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {connectionStatus ? (
              <CheckCircle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            <span className="text-sm">
              {connectionStatus 
                ? (t.aiSettings?.lastTestSuccess || 'Last connection test: Success')
                : (t.aiSettings?.lastTestFailed || 'Last connection test: Failed')
              }
            </span>
          </div>
        )}

        {/* Configuration Status */}
        <div className={`p-3 rounded-lg flex items-center space-x-2 ${
          isConfigured 
            ? 'bg-blue-50 border border-blue-200 text-blue-800' 
            : 'bg-gray-50 border border-gray-200 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm">
            {isConfigured 
              ? (t.aiSettings?.configured || 'AI features are enabled')
              : (t.aiSettings?.notConfigured || 'AI features are disabled - API key required')
            }
          </span>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          {t.aiSettings?.helpTitle || 'How to get an OpenAI API key:'}
        </h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>{t.aiSettings?.helpStep1 || 'Visit OpenAI Platform (platform.openai.com)'}</li>
          <li>{t.aiSettings?.helpStep2 || 'Sign up or log in to your account'}</li>
          <li>{t.aiSettings?.helpStep3 || 'Go to API Keys section'}</li>
          <li>{t.aiSettings?.helpStep4 || 'Create a new secret key'}</li>
          <li>{t.aiSettings?.helpStep5 || 'Copy the key and paste it above'}</li>
        </ol>
      </div>
    </div>
  )
}

export default AISettings
