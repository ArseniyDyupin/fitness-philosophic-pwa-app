import { describe, expect, it } from 'vitest'
import {
  addLocalDays,
  localDateToDate,
  parseLocalDate,
  startOfLocalWeek,
  todayLocalDate,
  toLocalDate
} from './localDate'

describe('LocalDate', () => {
  it('preserves the calendar portion of legacy ISO values', () => {
    expect(toLocalDate('2026-07-17T00:00:00.000Z')).toBe('2026-07-17')
    expect(localDateToDate('2026-07-17').getDate()).toBe(17)
  })

  it('uses local date parts instead of UTC parts for today', () => {
    expect(todayLocalDate(new Date(2026, 6, 17, 0, 30))).toBe('2026-07-17')
  })

  it('calculates Monday week starts and local day arithmetic', () => {
    expect(startOfLocalWeek('2026-07-19')).toBe('2026-07-13')
    expect(addLocalDays('2026-07-31', 1)).toBe('2026-08-01')
  })

  it('rejects impossible calendar dates', () => {
    expect(() => parseLocalDate('2026-02-30')).toThrow('Invalid local date')
  })
})
