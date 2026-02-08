'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'

interface ARViewerProps {
  productImage: string
  productName: string
  frameStyle: 'black' | 'white' | 'natural' | 'walnut' | 'gold'
  size: string
  isOpen: boolean
  onClose: () => void
}

// Check device capabilities
const isIOS = () => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

const isAndroid = () => {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

const isWebXRSupported = async () => {
  if (typeof navigator === 'undefined') return false
  if (!('xr' in navigator)) return false
  try {
    const supported = await (navigator as any).xr.isSessionSupported('immersive-ar')
    return supported
  } catch {
    return false
  }
}

// Size dimensions in meters for AR
const SIZE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '12x16': { width: 0.305, height: 0.406 },
  '16x20': { width: 0.406, height: 0.508 },
  '20x24': { width: 0.508, height: 0.610 },
  '24x30': { width: 0.610, height: 0.762 },
  '24x36': { width: 0.610, height: 0.914 },
  '30x40': { width: 0.762, height: 1.016 },
  '36x48': { width: 0.914, height: 1.219 },
  '40x50': { width: 1.016, height: 1.270 },
  '48x60': { width: 1.219, height: 1.524 },
  '50x60': { width: 1.270, height: 1.524 },
  '60x72': { width: 1.524, height: 1.829 },
  'A3': { width: 0.297, height: 0.420 },
  'A2': { width: 0.420, height: 0.594 },
}

export default function ARViewer({ 
  productImage, 
  productName, 
  frameStyle, 
  size,
  isOpen, 
  onClose 
}: ARViewerProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | null>(null)
  const [webXRSupported, setWebXRSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [arMode, setArMode] = useState<'native' | 'camera' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const dimensions = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS['24x36']

  useEffect(() => {
    const checkDevice = async () => {
      setIsLoading(true)
      
      if (isIOS()) {
        setDeviceType('ios')
      } else if (isAndroid()) {
        setDeviceType('android')
      } else {
        setDeviceType('desktop')
      }

      const xrSupported = await isWebXRSupported()
      setWebXRSupported(xrSupported)
      
      setIsLoading(false)
    }

    if (isOpen) {
      checkDevice()
    }
  }, [isOpen])

  // Cleanup camera on close
  useEffect(() => {
    if (!isOpen && cameraActive) {
      stopCamera()
    }
  }, [isOpen, cameraActive])

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setCameraActive(false)
    setArMode(null)
  }

  // Launch native AR (iOS AR Quick Look)
  const launchIOSAR = useCallback(async () => {
    try {
      // Fetch AR configuration from API
      const response = await fetch(
        `/api/ar?productId=demo&frameStyle=${frameStyle}&size=${size}&imageUrl=${encodeURIComponent(productImage)}`
      )
      const config = await response.json()

      // Create anchor element for AR Quick Look
      const anchor = document.createElement('a')
      anchor.rel = 'ar'
      anchor.href = config.models.usdz
      
      // Add preview image (required for AR Quick Look)
      const img = document.createElement('img')
      img.src = productImage
      img.alt = productName
      anchor.appendChild(img)
      
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    } catch (error) {
      console.error('iOS AR error:', error)
      // Fallback to camera mode
      startCameraAR()
    }
  }, [productImage, productName, frameStyle, size])

  // Launch Android Scene Viewer
  const launchAndroidAR = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/ar?productId=demo&frameStyle=${frameStyle}&size=${size}&imageUrl=${encodeURIComponent(productImage)}`
      )
      const config = await response.json()

      const glbUrl = encodeURIComponent(config.models.glb)
      const title = encodeURIComponent(productName)
      const fallbackUrl = encodeURIComponent(window.location.href)
      
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${glbUrl}&mode=ar_only&title=${title}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${fallbackUrl};end;`
      
      window.location.href = intentUrl
    } catch (error) {
      console.error('Android AR error:', error)
      startCameraAR()
    }
  }, [productImage, productName, frameStyle, size])

  // Start camera-based AR preview
  const startCameraAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        setArMode('camera')
      }
    } catch (error) {
      console.error('Camera access error:', error)
      alert('Camera access is required for AR preview. Please allow camera access and try again.')
    }
  }

  // Generate QR code for desktop users
  const generateQRCode = useCallback(() => {
    const currentUrl = window.location.href
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl + '?ar=true')}`
  }, [])

  // Overlay component for camera AR
  const CameraAROverlay = () => (
    <div className="fixed inset-0 z-[300] bg-black">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* AR Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Wall Detection Guide */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-80 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-64 relative opacity-80">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-white text-sm mt-2 drop-shadow-lg">
                Point camera at wall
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 max-w-sm mx-auto">
            <p className="text-white text-sm text-center mb-3">
              {productName} • {size}
            </p>
            <div className="flex gap-3">
              <button
                onClick={stopCamera}
                className="flex-1 py-3 bg-white/20 text-white rounded-xl font-medium pointer-events-auto"
              >
                Close
              </button>
              <button
                onClick={() => {}}
                className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-medium pointer-events-auto"
              >
                Capture
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={stopCamera}
          className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center pointer-events-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

  if (cameraActive && arMode === 'camera') {
    return <CameraAROverlay />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[200]"
          />

          {/* AR Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-3xl z-[201] overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">View in Your Space</h2>
                <p className="text-sm text-gray-400">See how this canvas looks on your wall</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Preview Image */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800 mb-6">
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      className="object-contain p-4"
                    />
                    {/* AR Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-indigo-500 rounded-full">
                      <span className="text-xs font-bold text-white">AR READY</span>
                    </div>
                  </div>

                  {/* Device-specific Options */}
                  {deviceType === 'ios' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400 text-center">
                        Use Apple AR Quick Look to place this canvas on your wall
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={launchIOSAR}
                          className="py-4 bg-white text-black rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          AR View
                        </button>
                        <button
                          onClick={startCameraAR}
                          className="py-4 bg-white/10 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Camera
                        </button>
                      </div>
                    </div>
                  )}

                  {deviceType === 'android' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400 text-center">
                        Use Google Scene Viewer to place this canvas on your wall
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={launchAndroidAR}
                          className="py-4 bg-white text-black rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          AR View
                        </button>
                        <button
                          onClick={startCameraAR}
                          className="py-4 bg-white/10 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Camera
                        </button>
                      </div>
                    </div>
                  )}

                  {deviceType === 'desktop' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400 text-center">
                        Scan the QR code with your mobile device to view in AR
                      </p>
                      
                      {showQRCode ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-48 h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={generateQRCode()}
                              alt="QR Code"
                              className="w-44 h-44 object-contain"
                            />
                          </div>
                          <button
                            onClick={() => setShowQRCode(false)}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                          >
                            Hide QR Code
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowQRCode(true)}
                          className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                          </svg>
                          Generate QR Code
                        </button>
                      )}

                      {webXRSupported && (
                        <button
                          onClick={() => {}}
                          className="w-full py-3 border border-white/20 rounded-xl font-medium hover:bg-white/5 transition-colors"
                        >
                          Try WebXR (Requires AR Headset)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Canvas Size</span>
                      <span className="font-medium">{size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Dimensions</span>
                      <span className="font-medium">
                        {dimensions.width.toFixed(2)}m × {dimensions.height.toFixed(2)}m
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Frame Style</span>
                      <span className="font-medium capitalize">{frameStyle}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <h3 className="text-sm font-bold mb-2">How to use AR:</h3>
                    <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                      <li>Point your camera at a well-lit wall</li>
                      <li>Move slowly to help detect the surface</li>
                      <li>Tap to place the canvas</li>
                      <li>Pinch to resize, drag to move</li>
                      <li>Tap the capture button to save</li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
