import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles, CheckCircle } from 'lucide-react'
import { useTranslations } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import { useWorkoutStore } from '@stores/workout.store'
import { toastError, toastSuccess } from '@lib/toast'
import { weeklyReviewService, type WeeklyReviewInput } from '@/application/weekly-review/weeklyReviewService'
import type { WeeklyPlanDiff, WeeklyReview } from '@/domain/weekly-review/types'
import { addLocalDays, startOfLocalWeek } from '@/domain/date/localDate'

interface ScoreFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
}

const ScoreField: React.FC<ScoreFieldProps> = ({ label, value, onChange }) => (
  <label className="block rounded-lg border border-gray-200 p-4">
    <span className="mb-3 flex items-center justify-between text-sm font-medium text-gray-800">
      <span>{label}</span>
      <span className="rounded-full bg-primary-50 px-2 py-1 text-primary-700">{value}/5</span>
    </span>
    <input
      type="range"
      min="1"
      max="5"
      value={value}
      onChange={event => onChange(Number(event.target.value))}
      className="w-full accent-primary-600"
      aria-label={label}
    />
  </label>
)

const WeeklyReviewPage: React.FC = () => {
  const t = useTranslations()
  const copy = t.weeklyReview
  const profile = useProfileStore(state => state.profile)
  const { workouts, loadWorkouts } = useWorkoutStore()
  const [review, setReview] = useState<WeeklyReview | null>(null)
  const [form, setForm] = useState<WeeklyReviewInput>({
    energy: 3,
    sleepQuality: 3,
    soreness: 3,
    mood: 3,
    adherence: 70,
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [diff, setDiff] = useState<WeeklyPlanDiff | null>(null)
  const weekSummary = useMemo(() => {
    const weekStart = review?.weekStart ?? startOfLocalWeek(new Date())
    const weekEnd = addLocalDays(weekStart, 6)
    const current = workouts.filter(workout => workout.date >= weekStart && workout.date <= weekEnd)
    const completed = current.filter(workout => workout.status === 'completed')
    const rpeValues = completed.map(workout => workout.rpe).filter((rpe): rpe is number => typeof rpe === 'number')
    return {
      total: current.length,
      completed: completed.length,
      averageRpe: rpeValues.length ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length : null
    }
  }, [review?.weekStart, workouts])

  useEffect(() => {
    loadWorkouts()
    weeklyReviewService.getCurrent().then(current => {
      if (!current) return
      setReview(current)
      setForm({
        energy: current.energy,
        sleepQuality: current.sleepQuality,
        soreness: current.soreness,
        mood: current.mood,
        adherence: current.adherence,
        notes: current.notes ?? ''
      })
      if (profile && current.recommendation) {
        setDiff(weeklyReviewService.getPlanDiff(profile, current.recommendation))
      }
    }).catch(() => toastError(t.error))
  }, [loadWorkouts, profile, t.error])

  const updateScore = (field: keyof WeeklyReviewInput, value: number | string) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile || isSaving) return
    setIsSaving(true)
    try {
      const saved = await weeklyReviewService.save(form)
      const withRecommendation = await weeklyReviewService.generateRecommendation(
        saved,
        profile,
        workouts,
        profile.language
      )
      setReview(withRecommendation)
      setDiff(weeklyReviewService.getPlanDiff(profile, withRecommendation.recommendation!))
      setShowDiff(false)
      toastSuccess(t.success)
    } catch {
      toastError(t.error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApply = async () => {
    if (!review?.recommendation || !profile || !window.confirm(copy.confirmApply)) return
    try {
      const updatedProfile = await weeklyReviewService.acceptRecommendation(review, profile)
      useProfileStore.setState({ profile: updatedProfile })
      setReview(current => current ? { ...current, decision: 'accepted' } : current)
      await useProfileStore.getState().loadProfile()
      toastSuccess(copy.applied)
    } catch {
      toastError(t.error)
    }
  }

  const handleDecline = async () => {
    if (!review?.recommendation) return
    try {
      const declined = await weeklyReviewService.declineRecommendation(review)
      setReview(declined)
      toastSuccess(copy.declined)
    } catch {
      toastError(t.error)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{copy.title}</h1>
        <p className="mt-2 text-gray-600">{copy.description}</p>
      </div>

      <section className="card mb-6" aria-labelledby="weekly-summary-title">
        <h2 id="weekly-summary-title" className="text-lg font-semibold text-gray-900">{copy.summaryTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p><strong>{weekSummary.completed}/{weekSummary.total}</strong> {copy.workoutsCompleted}</p>
          <p>{copy.averageRpe}: <strong>{weekSummary.averageRpe?.toFixed(1) ?? '—'}</strong></p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ScoreField label={copy.energy} value={form.energy} onChange={value => updateScore('energy', value)} />
          <ScoreField label={copy.sleep} value={form.sleepQuality} onChange={value => updateScore('sleepQuality', value)} />
          <ScoreField label={copy.soreness} value={form.soreness} onChange={value => updateScore('soreness', value)} />
          <ScoreField label={copy.mood} value={form.mood} onChange={value => updateScore('mood', value)} />
        </div>

        <label className="block">
          <span className="mb-2 flex justify-between text-sm font-medium text-gray-800">
            <span>{copy.adherence}</span><span>{form.adherence}%</span>
          </span>
          <input type="range" min="0" max="100" step="5" value={form.adherence}
            onChange={event => updateScore('adherence', Number(event.target.value))}
            className="w-full accent-primary-600" aria-label={copy.adherence} />
        </label>

        <label className="block text-sm font-medium text-gray-800">
          {copy.notes}
          <textarea value={form.notes} onChange={event => updateScore('notes', event.target.value)}
            placeholder={copy.notesPlaceholder} rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500" />
        </label>

        <button type="submit" disabled={isSaving || !profile} className="btn-primary w-full sm:w-auto disabled:opacity-50">
          {isSaving ? t.saving : copy.saveAndRecommend}
        </button>
      </form>

      {review?.recommendation && (
        <section className="card mt-6" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-purple-600" /> {copy.recommendation}
            </h2>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
              {review.recommendation.source === 'ai' ? copy.aiSource : copy.localSource}
            </span>
          </div>
          <p className="mt-4 text-gray-700">{review.recommendation.summary}</p>
          <p className="mt-3 text-sm"><strong>{copy.focus}:</strong> {review.recommendation.focus}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {review.recommendation.adjustments.map(adjustment => <li key={adjustment}>{adjustment}</li>)}
          </ul>

          <button type="button" onClick={() => setShowDiff(value => !value)} className="btn-secondary mt-5">
            {copy.preview}
          </button>

          {showDiff && diff && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <p>{diff.frequency.before} → <strong>{diff.frequency.after}</strong> {copy.workoutsPerWeek}</p>
                <p>{diff.duration.before} → <strong>{diff.duration.after}</strong> {copy.minutesPerWorkout}</p>
              </div>
              {review.decision ? (
                <p className="mt-4 font-medium text-gray-800" role="status">
                  {review.decision === 'accepted' ? copy.accepted : copy.declined}
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={handleApply} className="btn-primary inline-flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> {copy.apply}
                  </button>
                  <button type="button" onClick={handleDecline} className="btn-secondary">
                    {copy.decline}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default WeeklyReviewPage
