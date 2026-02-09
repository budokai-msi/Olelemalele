'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ARViewerProps {
  productImage: string
  productName: string
  frameStyle: 'black' | 'white' | 'natural' | 'walnut' | 'gold'
  size: string
  mode: 'idle' | 'camera' | 'fallback'
  onClose: () => void
  onRetryCamera: () => void
}

/* ── Frame color map ── */
const FRAME_COLORS: Record<string, { border: string; shadow: string; label: string }> = {
  black: { border: '#1a1a1a', shadow: 'rgba(0,0,0,0.6)', label: 'Black' },
  white: { border: '#f5f5f0', shadow: 'rgba(200,200,200,0.4)', label: 'White' },
  natural: { border: '#c4a574', shadow: 'rgba(140,110,60,0.4)', label: 'Natural Wood' },
  walnut: { border: '#5c4033', shadow: 'rgba(60,40,25,0.5)', label: 'Dark Walnut' },
  gold: { border: '#b8972e', shadow: 'rgba(160,130,30,0.4)', label: 'Gold Accent' },
}

/* ── Parse "12x16" → { w, h } ── */
function parseSize(size: string): { w: number; h: number } {
  const match = size.match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (match) return { w: parseInt(match[1]), h: parseInt(match[2]) }
  return { w: 12, h: 16 } // fallback
}

export default function ARViewer({
  productImage,
  productName,
  frameStyle,
  size,
  mode,
  onClose,
  onRetryCamera,
}: ARViewerProps) {
  /* ── State ── */
  const [cameraActive, setCameraActive] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)
  const [captured, setCaptured] = useState(false)

  /* ── Refs ── */
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ── Touch state for drag + pinch ── */
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const touchState = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastDist: 0,
    pinching: false,
  })

  /* ── Derived values ── */
  const { w, h } = parseSize(size)
  const frame = FRAME_COLORS[frameStyle] || FRAME_COLORS.black
  const aspectRatio = w / h
  // Base overlay size (in viewport units, will be scaled by pinch)
  const baseHeight = 240
  const baseWidth = baseHeight * aspectRatio
  const frameBorderWidth = 12

  /* ── Start camera when mode = 'camera' ── */
  useEffect(() => {
    if (mode !== 'camera') return
    let cancelled = false

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
          setShowGuide(true)
          setPosition({ x: 0, y: 0 })
          setScale(1)
          // Auto-hide guide after 3 seconds
          setTimeout(() => setShowGuide(false), 3000)
        }
      } catch (err) {
        console.error('Camera start failed:', err)
      }
    }

    start()

    return () => {
      cancelled = true
    }
  }, [mode])

  /* ── Stop camera on close ── */
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setCaptured(false)
    onClose()
  }, [onClose])

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    const videoEl = videoRef.current
    return () => {
      if (videoEl?.srcObject) {
        const tracks = (videoEl.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  /* ── Touch handlers for drag + pinch-to-zoom ── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchState.current.dragging = true
      touchState.current.lastX = e.touches[0].clientX
      touchState.current.lastY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      touchState.current.pinching = true
      touchState.current.dragging = false
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      touchState.current.lastDist = Math.hypot(dx, dy)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()

    if (touchState.current.dragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchState.current.lastX
      const dy = e.touches[0].clientY - touchState.current.lastY
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      touchState.current.lastX = e.touches[0].clientX
      touchState.current.lastY = e.touches[0].clientY
    }

    if (touchState.current.pinching && e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const dist = Math.hypot(dx, dy)
      const delta = dist / touchState.current.lastDist
      setScale(prev => Math.min(Math.max(prev * delta, 0.3), 4))
      touchState.current.lastDist = dist
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    touchState.current.dragging = false
    touchState.current.pinching = false
  }, [])

  /* ── Mouse drag for desktop ── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchState.current.dragging = true
    touchState.current.lastX = e.clientX
    touchState.current.lastY = e.clientY
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchState.current.dragging) return
    const dx = e.clientX - touchState.current.lastX
    const dy = e.clientY - touchState.current.lastY
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    touchState.current.lastX = e.clientX
    touchState.current.lastY = e.clientY
  }, [])

  const handleMouseUp = useCallback(() => {
    touchState.current.dragging = false
  }, [])

  /* ── Mouse wheel zoom for desktop ── */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05
    setScale(prev => Math.min(Math.max(prev * zoomFactor, 0.3), 4))
  }, [])

  /* ── Capture screenshot ── */
  const captureScreenshot = useCallback(async () => {
    if (!videoRef.current || !containerRef.current) return

    try {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw camera frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Draw the artwork overlay (simplified composite)
      const centerX = canvas.width / 2 + (position.x / window.innerWidth) * canvas.width
      const centerY = canvas.height / 2 + (position.y / window.innerHeight) * canvas.height
      const overlayW = (baseWidth / window.innerWidth) * canvas.width * scale
      const overlayH = (baseHeight / window.innerHeight) * canvas.height * scale
      const frameW = (frameBorderWidth / window.innerWidth) * canvas.width * scale

      // Draw frame
      ctx.fillStyle = frame.border
      ctx.fillRect(centerX - overlayW / 2 - frameW, centerY - overlayH / 2 - frameW, overlayW + frameW * 2, overlayH + frameW * 2)

      // Draw artwork
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = productImage

      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, centerX - overlayW / 2, centerY - overlayH / 2, overlayW, overlayH)
          resolve()
        }
        img.onerror = () => resolve()
      })

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${productName.replace(/\s+/g, '_')}_AR_preview.jpg`
        a.click()
        URL.revokeObjectURL(url)
        setCaptured(true)
        setTimeout(() => setCaptured(false), 2000)
      }, 'image/jpeg', 0.92)
    } catch (err) {
      console.error('Capture failed:', err)
    }
  }, [position, scale, baseWidth, baseHeight, frameBorderWidth, frame.border, productImage, productName])

  /* ── QR code URL ── */
  const generateQRCode = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url + '?ar=true')}`
  }, [])

  /* ═══════ CAMERA ACTIVE VIEW ═══════ */
  if (mode === 'camera' && cameraActive) {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black touch-none select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Wall placement guide */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 flex justify-center z-50 pointer-events-none"
            >
              <div className="px-6 py-3 bg-black/70 backdrop-blur-md rounded-full border border-white/20">
                <p className="text-white text-sm font-medium text-center">
                  📐 Point at a wall • Drag to position • Pinch to resize
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draggable artwork overlay */}
        <div
          ref={overlayRef}
          className="absolute z-40 cursor-grab active:cursor-grabbing"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
            width: baseWidth,
            height: baseHeight,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* Frame shadow (wall depth effect) */}
          <div
            className="absolute -inset-1 rounded-sm"
            style={{
              boxShadow: `
                8px 8px 24px ${frame.shadow},
                2px 2px 8px rgba(0,0,0,0.3),
                inset 0 0 0 1px rgba(255,255,255,0.05)
              `,
            }}
          />

          {/* Outer frame border */}
          <div
            className="absolute rounded-sm"
            style={{
              inset: -frameBorderWidth,
              backgroundColor: frame.border,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)`,
            }}
          />

          {/* Inner mat (thin white border inside the frame) */}
          <div
            className="absolute rounded-[1px]"
            style={{
              inset: -3,
              backgroundColor: frameStyle === 'white' ? '#e8e8e4' : '#faf8f5',
              boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)',
            }}
          />

          {/* Artwork itself */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
              sizes="300px"
              unoptimized
            />
          </div>

          {/* Size label below frame */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
            style={{ transform: `translateX(-50%) scale(${1 / scale})` }}
          >
            <span className="text-[11px] text-white/70 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 font-medium tracking-wider">
              {size}&quot; — {frame.label}
            </span>
          </div>
        </div>

        {/* Captured flash */}
        <AnimatePresence>
          {captured && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 bg-white z-[500] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Bottom control bar */}
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 px-4 py-4 pb-safe">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              {/* Product info */}
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-white text-xs font-bold uppercase tracking-wider truncate">{productName}</p>
                <p className="text-white/50 text-[10px] mt-0.5">{size}&quot; • {frame.label} Frame</p>
              </div>

              {/* Capture button */}
              <button
                onClick={captureScreenshot}
                className="w-14 h-14 rounded-full border-4 border-white/80 flex items-center justify-center hover:border-white transition-colors flex-shrink-0 mx-4 group"
                aria-label="Capture AR view"
                title="Capture screenshot"
              >
                <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white group-active:bg-white/60 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>

              {/* Close button */}
              <button
                onClick={stopCamera}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all flex-shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  /* ═══════ FALLBACK MODAL (camera denied) ═══════ */
  if (mode === 'fallback') {
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
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[10px] font-bold text-white/80">
                AR
              </div>
              <span className="flex-1 text-sm font-medium">AR Wall Preview</span>
              <button onClick={onClose} aria-label="Close" title="Close" className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Error banner */}
              <div className="mb-4 p-3 bg-amber-500/20 rounded-xl text-xs text-amber-200 text-center leading-relaxed">
                <p className="font-bold mb-1">📷 Camera access needed</p>
                <p>Click the <strong>lock icon</strong> in your address bar → Allow camera access → then try again.</p>
              </div>

              {/* Product preview */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                  <Image src={productImage} alt={productName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{productName}</p>
                  <p className="text-xs text-gray-500">{size} • {frame.label}</p>
                </div>
              </div>

              {/* Retry camera */}
              <button
                onClick={onRetryCamera}
                className="w-full flex items-center gap-3 px-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group mb-2"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Try Camera Again</p>
                  <p className="text-xs text-gray-500">After allowing access in browser</p>
                </div>
                <span className="text-xs text-green-400 font-medium">Retry</span>
              </button>

              {/* QR Code option */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center"><span className="px-2 bg-[#1a1a1a] text-xs text-gray-500">or use your phone</span></div>
              </div>

              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="w-full flex items-center gap-3 px-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Open on Phone</p>
                  <p className="text-xs text-gray-500">Scan QR code with your phone camera</p>
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
                  className="flex flex-col items-center py-4 gap-2"
                >
                  <div className="w-44 h-44 bg-white rounded-xl p-2.5 relative">
                    <Image src={generateQRCode()} alt="Scan to open AR on phone" fill className="object-contain" unoptimized />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">Scan with your phone camera to preview in AR</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/5 border-t border-white/10 text-xs text-gray-500 text-center">
              Point your camera at a wall to preview canvas placement
            </div>
          </motion.div>
        </>
      </AnimatePresence>
    )
  }

  /* ═══════ IDLE / HIDDEN ═══════ */

  // Hidden video element — always rendered so ref is ready
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="hidden"
    />
  )
}
