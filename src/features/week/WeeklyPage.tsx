import React, { useState, useEffect } from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useWeeklyStore } from '../../stores/weekly.store'
import { useWorkoutStore } from '../../stores/workout.store'
import { useFoodStore } from '../../stores/food.store'
import { useProfileStore } from '../../stores/profile.store'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

const WeeklyPage: React.FC = () => {
  const t = useTranslations()
  const { checkins, loadCheckins, addCheckin, updateCheckin, getCurrentWeekCheckin } = useWeeklyStore()
  const { workouts, loadWorkouts } = useWorkoutStore()
  const { foodLogs, loadFoodLogs } = useFoodStore()
  const { profile } = useProfileStore()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [formData, setFormData] = useState({
    weight: '',
    waist: '',
    notes: '',
    allowPhotoInAI: false
  })
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    loadCheckins()
    loadWorkouts()
    loadFoodLogs()
  }, [loadCheckins, loadWorkouts, loadFoodLogs])

  const currentWeekCheckin = getCurrentWeekCheckin()
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }) // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weekWorkouts = workouts.filter(w => 
    new Date(w.date) >= weekStart && new Date(w.date) <= weekEnd
  )

  const weekFoodLogs = foodLogs.filter(f => 
    new Date(f.date) >= weekStart && new Date(f.date) <= weekEnd
  )

  const totalWorkoutCalories = weekWorkouts.reduce((total, workout) => {
    if (profile?.weight) {
      return total + workout.exercises.reduce((sum, exercise) => {
        return sum + (exercise.kcalEstimated || 0)
      }, 0)
    }
    return total
  }, 0)

  const totalFoodCalories = weekFoodLogs.reduce((total, log) => total + log.calories, 0)
  const weeklyBalance = totalFoodCalories - totalWorkoutCalories

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.weight) {
      alert('Please enter your weight')
      return
    }

    try {
      if (currentWeekCheckin) {
        // Update existing checkin
        await updateCheckin(currentWeekCheckin.id, {
          weight: parseFloat(formData.weight),
          waist: formData.waist ? parseFloat(formData.waist) : undefined,
          notes: formData.notes || undefined,
          photo: photo || undefined,
          allowPhotoInAI: formData.allowPhotoInAI
        })
      } else {
        // Create new checkin
        await addCheckin({
          weekStart: weekStart.toISOString(),
          weight: parseFloat(formData.weight),
          waist: formData.waist ? parseFloat(formData.waist) : undefined,
          notes: formData.notes || undefined,
          photo: photo || undefined,
          allowPhotoInAI: formData.allowPhotoInAI
        })
      }

      // Reset form
      setFormData({
        weight: '',
        waist: '',
        notes: '',
        allowPhotoInAI: false
      })
      setPhoto(null)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to save checkin:', error)
      alert('Failed to save checkin')
    }
  }

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setSelectedWeek(newDate)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.weekly}</h1>
            <p className="text-lg text-gray-600 mt-2">
              Weekly check-ins and progress tracking
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Check-in</span>
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleWeekChange('prev')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ChevronLeft size={16} />
            <span>Previous Week</span>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          
          <button
            onClick={() => handleWeekChange('next')}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>Next Week</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{weekWorkouts.length}</div>
            <div className="text-sm text-gray-600">Workouts</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{totalWorkoutCalories}</div>
            <div className="text-sm text-gray-600">Workout Calories</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">{totalFoodCalories}</div>
            <div className="text-sm text-gray-600">Food Calories</div>
          </div>
          <div className="card text-center">
            <div className={`text-2xl font-bold ${weeklyBalance >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {weeklyBalance}
            </div>
            <div className="text-sm text-gray-600">Weekly Balance</div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayWorkouts = workouts.filter(w => 
                new Date(w.date).toDateString() === day.toDateString()
              )
              const dayFoodLogs = foodLogs.filter(f => 
                new Date(f.date).toDateString() === day.toDateString()
              )
              const isToday = day.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={index}
                  className={`p-3 text-center border rounded-lg ${
                    isToday ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayWorkouts.length > 0 && (
                      <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                        {dayWorkouts.length} workout{dayWorkouts.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {dayFoodLogs.length > 0 && (
                      <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                        {dayFoodLogs.length} food log{dayFoodLogs.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Week Check-in */}
        {currentWeekCheckin && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Check-in</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Weight:</span>
                    <span className="ml-2 font-semibold text-gray-900">{currentWeekCheckin.weight} kg</span>
                  </div>
                  {currentWeekCheckin.waist && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Waist:</span>
                      <span className="ml-2 font-semibold text-gray-900">{currentWeekCheckin.waist} cm</span>
                    </div>
                  )}
                  {currentWeekCheckin.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Notes:</span>
                      <p className="mt-1 text-gray-900">{currentWeekCheckin.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              {currentWeekCheckin.photo && (
                <div>
                  <img
                    src={currentWeekCheckin.photo}
                    alt="Progress photo"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Previous Check-ins */}
        {checkins.length > 1 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Check-ins</h3>
            <div className="space-y-3">
              {checkins
                .filter(c => new Date(c.weekStart).getTime() !== weekStart.getTime())
                .slice(0, 5)
                .map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(checkin.weekStart), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Weight: {checkin.weight} kg
                        {checkin.waist && ` • Waist: ${checkin.waist} cm`}
                      </div>
                    </div>
                    {checkin.photo && (
                      <div className="text-sm text-gray-500">
                        📷 Photo available
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Check-in Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {currentWeekCheckin ? 'Update Check-in' : 'Add Check-in'}
              </h2>
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
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waist (cm) - Optional
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Photo - Optional
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                {photo && (
                  <img
                    src={photo}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes - Optional
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="How was your week? Any observations?"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowPhotoInAI"
                  checked={formData.allowPhotoInAI}
                  onChange={(e) => setFormData({ ...formData, allowPhotoInAI: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="allowPhotoInAI" className="ml-2 text-sm text-gray-700">
                  Allow photo to be used in AI analysis
                </label>
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

export default WeeklyPage
