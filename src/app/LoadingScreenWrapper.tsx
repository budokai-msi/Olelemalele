'use client'

import LoadingScreen from '@/components/LoadingScreen'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function LoadingScreenWrapper() {
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2200) // Slightly longer for smooth transition

    return () => clearTimeout(timer)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) return null

  return (
    <AnimatePresence mode="wait">
      {isLoading && <LoadingScreen key="loading" />}
    </AnimatePresence>
  )
}
