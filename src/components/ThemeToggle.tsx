'use client'

import { useTheme } from '@/lib/ThemeProvider'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className="theme-toggle-pill"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      whileTap={{ scale: 0.9 }}
    >
      {/* Track */}
      <span className="theme-toggle-track">
        {/* Sliding knob */}
        <motion.span
          className="theme-toggle-knob"
          animate={{ x: isDark ? 0 : 20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {/* Sun icon */}
          <motion.svg
            className="theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? -90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.svg>
          {/* Moon icon */}
          <motion.svg
            className="theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : 90 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        </motion.span>
      </span>
    </motion.button>
  )
}
