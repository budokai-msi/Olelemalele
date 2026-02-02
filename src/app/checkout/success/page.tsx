'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect } from 'react'

export default function SuccessPage() {
  const triggerHaptic = useHaptic()

  useEffect(() => {
    triggerHaptic()
    // Optional: Add confetti or specific WebGL effect here
  }, [triggerHaptic])

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Decorative Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="relative z-10 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-12 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic">
            OWNED.
          </h1>
          <p className="text-gray-500 uppercase tracking-[0.4em] text-xs">
            Order №{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')} Confirmed
          </p>
        </div>

        <p className="max-w-md mx-auto text-gray-400 leading-relaxed text-sm md:text-base">
          The statement is yours. We&apos;ve sent a confirmation to your email.
          Your piece will begin its archival printing process immediately.
        </p>

        <div className="pt-12 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/gallery"
            className="px-12 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
          >
            Back to Archive
          </Link>
          <Link
            href="/"
            className="px-12 py-4 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
          >
            Home
          </Link>
        </div>

        {/* Branding */}
        <div className="pt-24">
          <span className="text-[10px] text-gray-700 uppercase tracking-[1em] font-bold">Olelemalele Studio</span>
        </div>
      </motion.div>
    </main>
  )
}
