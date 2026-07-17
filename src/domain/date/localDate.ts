export type LocalDate = string & { readonly __localDate: unique symbol }

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function fromParts(year: number, month: number, day: number): LocalDate {
  const candidate = new Date(year, month - 1, day)
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    throw new Error(`Invalid local date: ${year}-${pad(month)}-${pad(day)}`)
  }

  return `${year}-${pad(month)}-${pad(day)}` as LocalDate
}

export function localDateFromDate(date: Date): LocalDate {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }

  return fromParts(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function parseLocalDate(value: string): LocalDate {
  const match = LOCAL_DATE_PATTERN.exec(value.slice(0, 10))
  if (!match) {
    throw new Error(`Invalid local date: ${value}`)
  }

  return fromParts(Number(match[1]), Number(match[2]), Number(match[3]))
}

export function toLocalDate(value: string | Date): LocalDate {
  return value instanceof Date ? localDateFromDate(value) : parseLocalDate(value)
}

export function localDateToDate(value: string): Date {
  const localDate = parseLocalDate(value)
  const [year, month, day] = localDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayLocalDate(now = new Date()): LocalDate {
  return localDateFromDate(now)
}

export function addLocalDays(value: string, amount: number): LocalDate {
  const date = localDateToDate(value)
  date.setDate(date.getDate() + amount)
  return localDateFromDate(date)
}

export function startOfLocalWeek(value: string | Date): LocalDate {
  const date = value instanceof Date ? new Date(value) : localDateToDate(value)
  const day = date.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  date.setDate(date.getDate() - daysSinceMonday)
  return localDateFromDate(date)
}
