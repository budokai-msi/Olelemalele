'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
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
  const [isAROpen, setIsAROpen] = useState(false)

  // Auto-open AR if ?ar=true in URL (from QR code scan)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('ar') === 'true') {
        setIsAROpen(true)
        // Clean up URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  return (
    <>
      <motion.button
        onClick={() => setIsAROpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold uppercase tracking-wider hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25"
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
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
      />
    </>
  )
}
