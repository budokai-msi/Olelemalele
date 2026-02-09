'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user already consented
    const consent = localStorage.getItem('olelemalele-cookie-consent')
    if (!consent) {
      // Small delay for UX
      const timer = setTimeout(() => setShowConsent(true), 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('olelemalele-cookie-consent', 'accepted')
    localStorage.setItem('olelemalele-consent-date', new Date().toISOString())
    setShowConsent(false)
  }

  const handleDecline = () => {
    localStorage.setItem('olelemalele-cookie-consent', 'declined')
    localStorage.setItem('olelemalele-consent-date', new Date().toISOString())
    setShowConsent(false)
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
                      Your Privacy Matters
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                      By clicking &quot;Accept&quot;, you consent to our use of cookies.
                      <a href="/privacy" className="text-white/70 hover:text-white/60 ml-1 underline underline-offset-2">
                        Learn more
                      </a>
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDecline}
                      className="px-6 py-3 rounded-full border border-white/20 text-white/70 text-sm font-bold uppercase tracking-wider hover:bg-white/5 hover:border-white/40 transition-all"
                    >
                      Decline
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAccept}
                      className="px-6 py-3 rounded-full bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-white transition-all"
                    >
                      Accept All
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
