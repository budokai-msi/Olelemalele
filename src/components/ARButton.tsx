'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import ARViewer from './ARViewer'

interface ARButtonProps {
  productImage: string
  productName: string
  frameStyle: 'white' | 'black' | 'natural' | 'darkbrown'
  size: string
}

export default function ARButton({
  productImage,
  productName,
  frameStyle,
  size
}: ARButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Auto-open AR if ?ar=true in URL (from QR code scan)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('ar') === 'true') {
        setIsOpen(true)
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
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

      {isOpen && (
        <ARViewer
          productImage={productImage}
          productName={productName}
          frameStyle={frameStyle}
          size={size}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
