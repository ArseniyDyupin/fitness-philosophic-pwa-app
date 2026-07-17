import { format, parseISO, isValid } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { useI18nStore } from '@stores/i18n.store'

// Типы для локализации
type Locale = 'ru' | 'en'

// Получение текущей локали из store
export const getCurrentLocale = (): Locale => {
  return useI18nStore.getState().currentLanguage
}

// Получение объекта локали для date-fns
export const getDateFnsLocale = (locale: Locale) => {
  switch (locale) {
    case 'ru':
      return ru
    case 'en':
    default:
      return enUS
  }
}

// Форматирование даты с локализацией
export const formatLocalizedDate = (
  date: Date | string | number,
  formatStr: string,
  locale?: Locale
): string => {
  try {
    const currentLocale = locale || getCurrentLocale()
    const dateFnsLocale = getDateFnsLocale(currentLocale)
    
    let dateObj: Date
    
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatLocalizedDate:', date)
      return 'Invalid Date'
    }
    
    return format(dateObj, formatStr, { locale: dateFnsLocale })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

// Предустановленные форматы
export const dateFormats = {
  // Короткая дата: 15 янв 2024 / Jan 15, 2024
  short: 'd MMM yyyy',
  // Длинная дата: 15 января 2024 / January 15, 2024
  long: 'd MMMM yyyy',
  // Только месяц и год: янв 2024 / Jan 2024
  monthYear: 'MMM yyyy',
  // День недели и дата: Пн, 15 янв / Mon, Jan 15
  weekdayShort: 'EEE, d MMM',
  // Полный день недели и дата: Понедельник, 15 января / Monday, January 15
  weekdayLong: 'EEEE, d MMMM',
  // Только день недели: Понедельник / Monday
  weekdayOnly: 'EEEE',
  // Короткий день недели: Пн / Mon
  weekdayShortOnly: 'EEE',
  // Время: 14:30
  time: 'HH:mm',
  // Дата и время: 15 янв 2024, 14:30 / Jan 15, 2024, 2:30 PM
  dateTime: 'd MMM yyyy, HH:mm',
  // Относительная дата (сегодня, вчера, завтра)
  relative: (date: Date | string | number, locale?: Locale): string => {
    const currentLocale = locale || getCurrentLocale()
    const dateObj = typeof date === 'string' ? parseISO(date) : 
                   typeof date === 'number' ? new Date(date) : date
    
    if (!isValid(dateObj)) return 'Invalid Date'
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Сравниваем только дату, без времени
    const dateStr = format(dateObj, 'yyyy-MM-dd')
    const todayStr = format(today, 'yyyy-MM-dd')
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd')
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')
    
    if (dateStr === todayStr) {
      return currentLocale === 'ru' ? 'Сегодня' : 'Today'
    } else if (dateStr === yesterdayStr) {
      return currentLocale === 'ru' ? 'Вчера' : 'Yesterday'
    } else if (dateStr === tomorrowStr) {
      return currentLocale === 'ru' ? 'Завтра' : 'Tomorrow'
    } else {
      return formatLocalizedDate(dateObj, 'd MMM yyyy', currentLocale)
    }
  }
}

// Хук для использования в React компонентах
export const useLocalizedDate = () => {
  const locale = useI18nStore(state => state.currentLanguage)
  
  return {
    format: (date: Date | string | number, formatStr: string) => 
      formatLocalizedDate(date, formatStr, locale),
    formats: dateFormats,
    locale
  }
}

// Утилиты для работы с днями недели
export const weekdays = {
  ru: {
    short: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    long: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  },
  en: {
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }
}

// Получение названий дней недели
export const getWeekdayNames = (locale: Locale = getCurrentLocale(), type: 'short' | 'long' = 'short') => {
  return weekdays[locale][type]
}

// Утилиты для работы с месяцами
export const months = {
  ru: {
    short: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    long: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  },
  en: {
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }
}

// Получение названий месяцев
export const getMonthNames = (locale: Locale = getCurrentLocale(), type: 'short' | 'long' = 'short') => {
  return months[locale][type]
}
