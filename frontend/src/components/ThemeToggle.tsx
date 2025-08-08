import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <motion.button
      onClick={() => setIsDark(v => !v)}
      className="px-3 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </motion.button>
  )
}
