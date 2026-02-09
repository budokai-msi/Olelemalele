'use client'

import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import ARViewer from './ARViewer'

interface ARButtonProps {
  productImage: string
  productName: string
  frameStyle: 'black' | 'white' | 'natural' | 'walnut' | 'gold'
  size: string
}

export default function ARButton({
  productImage,
  productName,
  frameStyle,
  size
}: ARButtonProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'fallback'>('idle')

  // Auto-open AR if ?ar=true in URL (from QR code scan)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('ar') === 'true') {
        handleARClick()
        // Clean up URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleARClick = useCallback(async () => {
    // Check HTTPS requirement
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setMode('fallback')
      return
    }

    try {
      // Try to get camera immediately — skip the modal
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })
      // Camera granted — stop the test stream, ARViewer will start its own
      stream.getTracks().forEach(t => t.stop())
      setMode('camera')
    } catch {
      // Camera denied or unavailable — show fallback modal
      setMode('fallback')
    }
  }, [])

  return (
    <>
      <motion.button
        onClick={handleARClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] laser-btn"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        View in Your Space
      </motion.button>

      <ARViewer
        productImage={productImage}
        productName={productName}
        frameStyle={frameStyle}
        size={size}
        mode={mode}
        onClose={() => setMode('idle')}
        onRetryCamera={handleARClick}
      />
    </>
  )
}
