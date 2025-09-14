import React, { useState, useEffect } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useFoodStore } from '@stores/food.store'
import { useWorkoutStore } from '@stores/workout.store'
import { useProfileStore } from '@stores/profile.store'
import { Plus, Trash2 } from 'lucide-react'

const FoodPage: React.FC = () => {
  const t = useTranslations()
  const { foodLogs, loadFoodLogs, addFoodLog, deleteFoodLog, getDailyCalories, getDailyMacros } = useFoodStore()
  const { workouts, loadWorkouts } = useWorkoutStore()
  const { profile } = useProfileStore()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  })

  useEffect(() => {
    loadFoodLogs()
    loadWorkouts()
  }, [loadFoodLogs, loadWorkouts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.calories) {
      alert('Please enter calories')
      return
    }

    try {
      await addFoodLog({
        calories: parseInt(formData.calories),
        protein: formData.protein ? parseFloat(formData.protein) : undefined,
        carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
        fat: formData.fat ? parseFloat(formData.fat) : undefined,
        notes: formData.notes || undefined,
        date: new Date(selectedDate).toISOString()
      })

      // Reset form
      setFormData({
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        notes: ''
      })
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to add food log:', error)
      alert('Failed to add food log')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteFoodLog(id)
      } catch (error) {
        console.error('Failed to delete food log:', error)
        alert('Failed to delete food log')
      }
    }
  }

  const dailyCalories = getDailyCalories(selectedDate)
  const dailyMacros = getDailyMacros(selectedDate)
  
  // Get workout calories for the selected date
  const workoutCalories = workouts
    .filter(w => new Date(w.date).toDateString() === new Date(selectedDate).toDateString())
    .reduce((total, workout) => {
      if (profile?.weight) {
        return total + workout.exercises.reduce((sum, exercise) => {
          return sum + (exercise.kcalEstimated || 0)
        }, 0)
      }
      return total
    }, 0)

  const dailyBalance = dailyCalories - workoutCalories

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.food}</h1>
            <p className="text-lg text-gray-600 mt-2">
              Track your nutrition and calories
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t.addFoodLog}</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{dailyCalories}</div>
            <div className="text-sm text-gray-600">Food Calories</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{workoutCalories}</div>
            <div className="text-sm text-gray-600">Workout Calories</div>
          </div>
          <div className="card text-center">
            <div className={`text-2xl font-bold ${dailyBalance >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {dailyBalance}
            </div>
            <div className="text-sm text-gray-600">Daily Balance</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">{dailyMacros.protein}g</div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrients</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{dailyMacros.protein}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{dailyMacros.carbs}g</div>
              <div className="text-sm text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{dailyMacros.fat}g</div>
              <div className="text-sm text-gray-600">Fat</div>
            </div>
          </div>
        </div>

        {/* Food Logs */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Log</h3>
          
          {foodLogs.filter(log => 
            new Date(log.date).toDateString() === new Date(selectedDate).toDateString()
          ).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t.foodPage?.noEntries || 'No food entries for this date. Click "Add Food Log" to get started.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {foodLogs
                .filter(log => new Date(log.date).toDateString() === new Date(selectedDate).toDateString())
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="font-medium text-gray-900">{log.calories} kcal</div>
                        {(log.protein || log.carbs || log.fat) && (
                          <div className="text-sm text-gray-600">
                            {log.protein && `P: ${log.protein}g`}
                            {log.carbs && ` C: ${log.carbs}g`}
                            {log.fat && ` F: ${log.fat}g`}
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <div className="text-sm text-gray-600 mt-1">{log.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="hit-44 focus-visible-ring text-red-400 hover:text-red-600 transition-colors rounded-lg"
                      title={t.foodPage?.deleteEntry || "Delete entry"}
                      aria-label={t.foodPage?.deleteEntry || "Delete entry"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Food Log Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t.addFoodLog}</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories *
                </label>
                <input
                  type="number"
                  required
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="What did you eat?"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodPage
