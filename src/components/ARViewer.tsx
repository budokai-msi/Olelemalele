'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ARViewerProps {
  productImage: string
  productName: string
  frameStyle: 'black' | 'white' | 'natural' | 'walnut' | 'gold'
  size: string
  isOpen: boolean
  onClose: () => void
}

const checkIsIOS = () => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

const checkIsAndroid = () => {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export default function ARViewer({
  productImage,
  productName,
  frameStyle,
  size,
  isOpen,
  onClose
}: ARViewerProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [isLoading, setIsLoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isOpen) return
    if (checkIsIOS()) setDeviceType('ios')
    else if (checkIsAndroid()) setDeviceType('android')
    else setDeviceType('desktop')
  }, [isOpen])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    const videoEl = videoRef.current
    return () => {
      if (videoEl?.srcObject) {
        const tracks = (videoEl.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen && cameraActive) stopCamera()
  }, [isOpen, cameraActive, stopCamera])

  const startCameraAR = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    // Check if HTTPS (required for camera)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera requires HTTPS. Please use a secure connection.')
      setIsLoading(false)
      return
    }

    try {
      // Stop any existing streams
      if (videoRef.current?.srcObject) {
        const existing = videoRef.current.srcObject as MediaStream
        existing.getTracks().forEach(t => t.stop())
      }

      // Request camera with ideal constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error('Camera error:', err)

      // Check permission state if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
          if (result.state === 'denied') {
            setError('Camera blocked. Click the lock icon in your address bar and allow camera access.')
          } else {
            setError('Camera error. Please allow camera access when prompted.')
          }
        } catch {
          setError('Camera access denied. Please allow camera in your browser settings.')
        }
      } else {
        setError('Camera not available. Please ensure you\'re on HTTPS and have a camera.')
      }
    }
    setIsLoading(false)
  }, [])

  const generateQRCode = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url + '?ar=true')}`
  }, [])

  if (cameraActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black touch-none"
      >
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

        {/* Draggable + pinch-to-resize product overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          drag
          dragMomentum={false}
          dragElastic={0.1}
          whileDrag={{ cursor: 'grabbing' }}
        >
          <motion.div
            className="w-64 h-80 border-4 border-white/80 rounded-lg relative bg-white/10 shadow-2xl"
            style={{ touchAction: 'none' }}
            whileTap={{ scale: 0.95 }}
          >
            <Image src={productImage} alt={productName} fill className="object-cover rounded-lg opacity-80" sizes="256px" />

            {/* Size label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap bg-black/50 px-2 py-1 rounded-full">
              {size} — {frameStyle}
            </div>
          </motion.div>
        </motion.div>

        {/* Controls bar */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 px-4">
          <span className="text-xs text-white/50">Drag to move</span>
          <button onClick={stopCamera} className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
            Close Camera
          </button>
        </div>
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm max-h-[80vh] bg-[#1a1a1a] rounded-2xl z-[201] shadow-2xl overflow-hidden border border-white/10 flex flex-col"
        >
          {/* Header - Chrome style */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-[10px] text-white font-bold">
              AR
            </div>
            <span className="flex-1 text-sm font-medium">About AR Preview</span>
            <button onClick={onClose} aria-label="Close AR preview" title="Close" className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Secure connection indicator */}
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-400 border-b border-white/5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Camera access required for AR</span>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 overflow-y-auto flex-1">
            {error && (
              <div className="mb-3 p-2 bg-red-500/20 rounded-lg text-xs text-red-200 text-center">
                {error}
              </div>
            )}

            {/* Product preview */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                <Image src={productImage} alt={productName} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{productName}</p>
                <p className="text-xs text-gray-500">{size} • {frameStyle}</p>
              </div>
            </div>

            {/* Camera permission */}
            <div className="space-y-2">
              <button
                onClick={startCameraAR}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white transition-colors">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Camera</p>
                  <p className="text-xs text-gray-500">Click to allow access</p>
                </div>
                <span className="text-xs text-green-400 font-medium">Allow</span>
              </button>

              {/* QR Code option for desktop */}
              {deviceType === 'desktop' && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-[#1a1a1a] text-xs text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="w-full flex items-center gap-3 px-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Use Phone</p>
                      <p className="text-xs text-gray-500">Scan QR code</p>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${showQRCode ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showQRCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-center py-3"
                    >
                      <div className="w-40 h-40 bg-white rounded-lg p-2 relative">
                        <Image src={generateQRCode()} alt="Scan QR code to open AR on your phone" fill className="object-contain" unoptimized />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-white/5 border-t border-white/10 text-xs text-gray-500 text-center">
            Point camera at a wall to preview canvas placement
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
