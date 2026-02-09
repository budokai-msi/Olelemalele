'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import GeminiSparkle from './GeminiSparkle'

const STORAGE_KEY = 'olelemalele_newsletter_dismissed'
const SHOW_DELAY = 5000 // 5 seconds

export default function NewsletterPopup() {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if already dismissed
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (dismissed) return
    } catch {
      return
    }

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, SHOW_DELAY)

    return () => clearTimeout(timer)
  }, [mounted])

  const handleDismiss = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Ignore localStorage errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Success state
    setStatus('success')

    // Auto-dismiss after showing success
    setTimeout(() => {
      handleDismiss()
    }, 2500)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] max-w-lg w-full"
          >
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4L4 12M4 4l8 8" />
                </svg>
              </button>

              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-indigo-500/20 blur-[80px] pointer-events-none" />

              {/* Content */}
              <div className="relative p-8 md:p-10">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="flex justify-center mb-6">
                      <GeminiSparkle size={64} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">You&apos;re In!</h3>
                    <p className="text-gray-400">Welcome to the Olelemalele inner circle.</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                      <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs uppercase tracking-widest font-bold">
                        Exclusive Access
                      </span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl font-black text-center tracking-tight mb-4">
                      Join the <span className="text-gradient">Inner Circle</span>
                    </h2>

                    {/* Description */}
                    <p className="text-gray-400 text-center mb-8 max-w-sm mx-auto">
                      Get early access to new drops, exclusive discounts, and behind-the-scenes content delivered to your inbox.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {status === 'loading' ? (
                          <>
                            <GeminiSparkle size={20} />
                            <span>Joining...</span>
                          </>
                        ) : (
                          'Get Exclusive Access'
                        )}
                      </button>
                    </form>

                    {/* Privacy Note */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                      No spam, ever. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
