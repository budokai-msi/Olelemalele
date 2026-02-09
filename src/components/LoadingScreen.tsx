'use client'

import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: 'blur(10px)',
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center">
        {/* Logo entrance */}
        <motion.div
          className="text-5xl md:text-7xl font-black text-white mb-8"
          initial={{ y: 40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          OLELE<span className="text-white">MALELE</span>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="w-56 h-[2px] bg-white/10 mx-auto overflow-hidden rounded-full"
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-white/30 via-white/20 to-white/30"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-gray-500 mt-6 text-xs uppercase tracking-[0.3em] font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Art in motion
        </motion.p>
      </div>

      {/* Corner accents */}
      <motion.div
        className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      />
      <motion.div
        className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      />
    </motion.div>
  )
}
