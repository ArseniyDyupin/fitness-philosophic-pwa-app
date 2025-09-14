import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@stores/theme.store'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {theme === 'light' ? (
          <Sun className="w-3 h-3 text-yellow-500 m-0.5" />
        ) : (
          <Moon className="w-3 h-3 text-blue-500 m-0.5" />
        )}
      </span>
    </button>
  )
}

export default ThemeToggle
