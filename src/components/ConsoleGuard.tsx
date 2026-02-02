'use client'

import { useEffect } from 'react'

export default function ConsoleGuard() {
  useEffect(() => {
    // Only run in production or if you want to silence the noise everywhere
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      const msg = args[0]?.toString() || ''
      // Silence Microsoft Editor extension noise
      if (msg.includes('mce-autosize-textarea')) return
      // Silence SES/MetaMask noise
      if (msg.includes('SES Removing unpermitted intrinsics')) return
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const msg = args[0]?.toString() || ''
      // Silence Chrome/Edge Intervention logs (usually about large images on slow networks)
      if (msg.includes('[Intervention]')) return
      originalWarn.apply(console, args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return null
}
