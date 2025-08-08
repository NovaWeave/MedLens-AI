import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function AnimatedCard({ title, children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02, 
        rotateY: 2, 
        rotateX: 1,
        transition: { duration: 0.2 }
      }}
      className={`bg-white/25 dark:bg-gray-900/30 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu perspective-1000 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {title && (
        <motion.h3 
          className="font-semibold mb-4 text-lg text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          {title}
        </motion.h3>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
