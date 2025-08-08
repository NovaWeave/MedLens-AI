import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FloatingActionButtonProps {
  icon: LucideIcon
  onClick: () => void
  className?: string
  tooltip?: string
}

export default function FloatingActionButton({ 
  icon: Icon, 
  onClick, 
  className = '', 
  tooltip 
}: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 text-white rounded-full flex items-center justify-center z-50 shadow-2xl backdrop-blur-xl bg-gradient-to-r from-blue-500/90 to-purple-600/90 border border-white/20 ${className}`}
      whileHover={{ 
        scale: 1.1, 
        rotateY: 10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      title={tooltip}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
    </motion.button>
  )
}
