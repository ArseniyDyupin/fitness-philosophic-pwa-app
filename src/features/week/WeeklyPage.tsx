import React, { useState, useEffect } from 'react'
import { useTranslations } from '../../stores/i18n.store'
import { useWeeklyStore } from '../../stores/weekly.store'
import { useWorkoutStore } from '../../stores/workout.store'
// Temporarily disabled - will be implemented later
// import { useFoodStore } from '../../stores/food.store'
import { useProfileStore } from '../../stores/profile.store'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { getWeekStats, getPreviousWeekStats, calculateDeltas, WeekStats } from '../../services/stats.week'
import WeeklyTopSummary from '../../components/weekly/WeeklyTopSummary'
import WeeklyActivityChart from '../../components/weekly/WeeklyActivityChart'
import WorkoutTypeDistribution from '../../components/weekly/WorkoutTypeDistribution'
import ExerciseProgressSection from '../../components/weekly/ExerciseProgressSection'
import WeeklyPRs from '../../components/weekly/WeeklyPRs'

const WeeklyPage: React.FC = () => {
  const t = useTranslations()
  const { checkins, loadCheckins, addCheckin, updateCheckin, getCurrentWeekCheckin } = useWeeklyStore()
  const { loadWorkouts, getWorkoutsByWeek } = useWorkoutStore()
  // Temporarily disabled - will be implemented later
  // const { foodLogs, loadFoodLogs } = useFoodStore()
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
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null)
  const [previousWeekStats, setPreviousWeekStats] = useState<WeekStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const loadWeekStats = async () => {
    setIsLoadingStats(true)
    try {
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })
      
      const [currentStats, prevStats] = await Promise.all([
        getWeekStats(weekStart, weekEnd, profile?.weight),
        getPreviousWeekStats(weekStart, weekEnd, profile?.weight)
      ])
      
      
      setWeekStats(currentStats)
      setPreviousWeekStats(prevStats)
    } catch (error) {
      console.error('Failed to load week stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    loadCheckins()
    loadWorkouts()
    // loadFoodLogs() // Temporarily disabled
  }, [loadCheckins, loadWorkouts]) // Removed loadFoodLogs from dependencies

  useEffect(() => {
    loadWeekStats()
  }, [selectedWeek, profile?.weight])

  const currentWeekCheckin = getCurrentWeekCheckin()
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }) // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const weekWorkouts = getWorkoutsByWeek(weekStart)

  // Calculate deltas for comparison with previous week
  const deltas = weekStats && previousWeekStats 
    ? calculateDeltas(weekStats, previousWeekStats)
    : undefined

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
      alert(t.weeklyPage?.pleaseEnterWeight || 'Please enter your weight')
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
      alert(t.weeklyPage?.failedToSaveCheckin || 'Failed to save checkin')
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
              {t.weeklyPage?.description || 'Weekly check-ins and progress tracking'}
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t.weeklyPage?.addCheckin || 'Add Check-in'}</span>
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleWeekChange('prev')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ChevronLeft size={16} />
            <span>{t.weeklyPage?.previousWeek || 'Previous Week'}</span>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          
          <button
            onClick={() => handleWeekChange('next')}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>{t.weeklyPage?.nextWeek || 'Next Week'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekly Analytics */}
        {isLoadingStats ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">{t.weeklyPage?.loading || 'Loading analytics...'}</span>
          </div>
        ) : weekStats ? (
          <>
            {/* Top Summary Cards */}
            <WeeklyTopSummary stats={weekStats} deltas={deltas} />
            
            {/* Activity Chart */}
            <WeeklyActivityChart workouts={weekWorkouts} weekStart={weekStart} />
            
            {/* Exercise Type Distribution */}
            <WorkoutTypeDistribution stats={weekStats} />
            
            {/* Exercise Progress */}
            <ExerciseProgressSection stats={weekStats} deltas={deltas} />
            
            {/* Personal Records */}
            <WeeklyPRs stats={weekStats} />
          </>
        ) : (
          <div className="card text-center py-12">
            <div className="text-gray-500">
              {t.weeklyPage?.noData || 'No data available for this week'}
            </div>
          </div>
        )}

        {/* Weekly Calendar */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.weeklyPage?.weeklyOverview || 'Weekly Overview'}</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayData = weekStats?.days.find(d => d.date === day.toISOString().split('T')[0])
              const isToday = day.toDateString() === new Date().toDateString()
              const hasActivity = dayData && (dayData.workouts > 0 || dayData.workoutKcal > 0 || dayData.foodKcal > 0)
              
              return (
                <div
                  key={index}
                  className={`p-3 text-center border rounded-lg ${
                    isToday ? 'bg-primary-50 border-primary-200' : 
                    hasActivity ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayData && dayData.workouts > 0 && (
                      <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                        {dayData.workouts} {dayData.workouts > 1 ? (t.weeklyPage?.workoutsCount || 'workouts') : (t.weeklyPage?.workout || 'workout')}
                      </div>
                    )}
                    {dayData && dayData.workoutKcal > 0 && (
                      <div className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                        {Math.round(dayData.workoutKcal)} kcal
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.weeklyPage?.thisWeekCheckin || 'This Week\'s Check-in'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">{t.weeklyPage?.weight || 'Weight'}:</span>
                    <span className="ml-2 font-semibold text-gray-900">{currentWeekCheckin.weight} kg</span>
                  </div>
                  {currentWeekCheckin.waist && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">{t.weeklyPage?.waist || 'Waist'}:</span>
                      <span className="ml-2 font-semibold text-gray-900">{currentWeekCheckin.waist} cm</span>
                    </div>
                  )}
                  {currentWeekCheckin.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">{t.weeklyPage?.notes || 'Notes'}:</span>
                      <p className="mt-1 text-gray-900">{currentWeekCheckin.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              {currentWeekCheckin.photo && (
                <div>
                  <img
                    src={currentWeekCheckin.photo}
                    alt={t.weeklyPage?.progressPhoto || 'Progress photo'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.weeklyPage?.previousCheckins || 'Previous Check-ins'}</h3>
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
                        {t.weeklyPage?.weight || 'Weight'}: {checkin.weight} kg
                        {checkin.waist && ` • ${t.weeklyPage?.waist || 'Waist'}: ${checkin.waist} cm`}
                      </div>
                    </div>
                    {checkin.photo && (
                      <div className="text-sm text-gray-500">
                        {t.weeklyPage?.photoAvailable || '📷 Photo available'}
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
                {currentWeekCheckin ? (t.weeklyPage?.updateCheckin || 'Update Check-in') : (t.weeklyPage?.addCheckinModal || 'Add Check-in')}
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
                  {t.weeklyPage?.weightRequired || 'Weight (kg) *'}
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t.weeklyPage?.weightPlaceholder || 'e.g., 70.5'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.weeklyPage?.waistOptional || 'Waist (cm) - Optional'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t.weeklyPage?.waistPlaceholder || 'e.g., 80'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.weeklyPage?.progressPhotoOptional || 'Progress Photo - Optional'}
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
                    alt={t.weeklyPage?.progressPhoto || 'Preview'}
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.weeklyPage?.notesOptional || 'Notes - Optional'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t.weeklyPage?.notesPlaceholder || 'How was your week? Any observations?'}
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
                  {t.weeklyPage?.allowPhotoInAI || 'Allow photo to be used in AI analysis'}
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
