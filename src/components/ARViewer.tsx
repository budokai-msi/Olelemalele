'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ARViewerProps {
  productImage: string
  productName: string
  frameStyle: 'white' | 'black' | 'natural' | 'darkbrown'
  size: string
  onClose: () => void
}

/* ── Frame color map — matches Gelato's actual framed canvas catalog ── */
const FRAME_COLORS: Record<string, { border: string; shadow: string; label: string }> = {
  white: { border: '#f5f5f0', shadow: 'rgba(200,200,200,0.4)', label: 'Gallery Wrap' },
  black: { border: '#000000', shadow: 'rgba(0,0,0,0.6)', label: 'Black' },
  natural: { border: '#9D6C3C', shadow: 'rgba(140,100,50,0.4)', label: 'Natural Wood' },
  darkbrown: { border: '#5C4033', shadow: 'rgba(60,40,25,0.5)', label: 'Dark Brown' },
}

/* ── Parse "12x16" → { w, h } ── */
function parseSize(size: string): { w: number; h: number } {
  const match = size.match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (match) return { w: parseInt(match[1]), h: parseInt(match[2]) }
  return { w: 12, h: 16 }
}

export default function ARViewer({
  productImage,
  productName,
  frameStyle,
  size,
  onClose,
}: ARViewerProps) {
  /* ── State ── */
  const [mode, setMode] = useState<'loading' | 'camera' | 'wall'>('loading')
  const [showGuide, setShowGuide] = useState(true)
  const [captured, setCaptured] = useState(false)

  /* ── Snap guide state ── */
  const [snapH, setSnapH] = useState(false)  // horizontal center snap active
  const [snapV, setSnapV] = useState(false)  // vertical center snap active
  const [snapEdge, setSnapEdge] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null)
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Refs ── */
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ── Touch state for drag + pinch ── */
  const [position, _setPosition] = useState({ x: 0, y: 0 })
  const posRef = useRef({ x: 0, y: 0 })
  const setPosition = useCallback((p: { x: number; y: number }) => {
    posRef.current = p
    _setPosition(p)
  }, [])
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
  const frame = FRAME_COLORS[frameStyle] || FRAME_COLORS.white
  const aspectRatio = w / h
  const baseHeight = 240
  const baseWidth = baseHeight * aspectRatio
  const frameBorderWidth = 12

  /* ── Snap detection ── */
  const SNAP_THRESHOLD = 18 // px to trigger snap
  const EDGE_MARGIN = 40    // px from viewport edge for edge snap

  const checkSnap = useCallback((newPos: { x: number; y: number }) => {
    const container = containerRef.current
    if (!container) return newPos

    const cw = container.offsetWidth
    const ch = container.offsetHeight
    let { x, y } = newPos
    let didSnapH = false
    let didSnapV = false
    let edgeSnap: 'left' | 'right' | 'top' | 'bottom' | null = null

    // Center snap (artwork center → viewport center)
    if (Math.abs(x) < SNAP_THRESHOLD) {
      x = 0
      didSnapV = true
    }
    if (Math.abs(y) < SNAP_THRESHOLD) {
      y = 0
      didSnapH = true
    }

    // Edge snap detection (artwork approaching viewport edges)
    const artHalfW = (baseWidth * scale) / 2
    const artHalfH = (baseHeight * scale) / 2
    const artLeft = cw / 2 + x - artHalfW
    const artRight = cw / 2 + x + artHalfW
    const artTop = ch / 2 + y - artHalfH
    const artBottom = ch / 2 + y + artHalfH

    if (Math.abs(artLeft - EDGE_MARGIN) < SNAP_THRESHOLD) edgeSnap = 'left'
    else if (Math.abs(artRight - (cw - EDGE_MARGIN)) < SNAP_THRESHOLD) edgeSnap = 'right'
    else if (Math.abs(artTop - EDGE_MARGIN) < SNAP_THRESHOLD) edgeSnap = 'top'
    else if (Math.abs(artBottom - (ch - EDGE_MARGIN)) < SNAP_THRESHOLD) edgeSnap = 'bottom'

    setSnapH(didSnapH)
    setSnapV(didSnapV)
    setSnapEdge(edgeSnap)

    // Clear snap indicators after a delay
    if (snapTimeout.current) clearTimeout(snapTimeout.current)
    if (didSnapH || didSnapV || edgeSnap) {
      snapTimeout.current = setTimeout(() => {
        setSnapH(false)
        setSnapV(false)
        setSnapEdge(null)
      }, 1200)
    }

    return { x, y }
  }, [baseWidth, baseHeight, scale, SNAP_THRESHOLD, EDGE_MARGIN])

  /* ── Try camera, fall back to wall preview ── */
  const requestCamera = useCallback(async () => {
    setMode('loading')

    // Skip camera on non-HTTPS
    if (
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      setMode('wall')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => { })
        setMode('camera')
        setShowGuide(true)
        setPosition({ x: 0, y: 0 })
        setScale(1)
        setTimeout(() => setShowGuide(false), 3000)
      } else {
        stream.getTracks().forEach(t => t.stop())
        setMode('wall')
      }
    } catch {
      // Camera denied/unavailable → wall preview (no popup!)
      setMode('wall')
    }
  }, [])

  // Auto-request on mount
  useEffect(() => {
    requestCamera()
  }, [requestCamera])

  // When entering wall mode, reset position and show guide
  useEffect(() => {
    if (mode === 'wall') {
      setPosition({ x: 0, y: 0 })
      setScale(1)
      setShowGuide(true)
      setTimeout(() => setShowGuide(false), 3000)
    }
  }, [mode])

  /* ── Stop camera + close ── */
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCaptured(false)
    onClose()
  }, [onClose])

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    const videoEl = videoRef.current
    return () => {
      if (videoEl?.srcObject) {
        (videoEl.srcObject as MediaStream).getTracks().forEach(t => t.stop())
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
      const raw = { x: posRef.current.x + dx, y: posRef.current.y + dy }
      const snapped = checkSnap(raw)
      setPosition(snapped)
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
  }, [checkSnap, setPosition])

  const handleTouchEnd = useCallback(() => {
    touchState.current.dragging = false
    touchState.current.pinching = false
  }, [])

  /* ── Mouse drag (desktop) ── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchState.current.dragging = true
    touchState.current.lastX = e.clientX
    touchState.current.lastY = e.clientY
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchState.current.dragging) return
    const dx = e.clientX - touchState.current.lastX
    const dy = e.clientY - touchState.current.lastY
    const raw = { x: posRef.current.x + dx, y: posRef.current.y + dy }
    const snapped = checkSnap(raw)
    setPosition(snapped)
    touchState.current.lastX = e.clientX
    touchState.current.lastY = e.clientY
  }, [checkSnap, setPosition])

  const handleMouseUp = useCallback(() => {
    touchState.current.dragging = false
  }, [])

  /* ── Mouse wheel zoom (desktop) ── */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05
    setScale(prev => Math.min(Math.max(prev * zoomFactor, 0.3), 4))
  }, [])

  /* ── Capture screenshot ── */
  const captureScreenshot = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    try {
      const canvas = document.createElement('canvas')
      const cw = container.offsetWidth * 2
      const ch = container.offsetHeight * 2
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw background
      if (mode === 'camera' && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, cw, ch)
      } else {
        // Draw wall gradient
        const wallGrad = ctx.createLinearGradient(0, 0, 0, ch)
        wallGrad.addColorStop(0, '#e8e4df')
        wallGrad.addColorStop(0.7, '#d8d4cf')
        wallGrad.addColorStop(1, '#8b8070')
        ctx.fillStyle = wallGrad
        ctx.fillRect(0, 0, cw, ch)
      }

      const centerX = cw / 2 + (position.x / container.offsetWidth) * cw
      const centerY = ch / 2 + (position.y / container.offsetHeight) * ch
      const overlayW = (baseWidth / container.offsetWidth) * cw * scale
      const overlayH = (baseHeight / container.offsetHeight) * ch * scale
      const frameW = (frameBorderWidth / container.offsetWidth) * cw * scale

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

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${productName.replace(/\s+/g, '_')}_wall_preview.jpg`
        a.click()
        URL.revokeObjectURL(url)
        setCaptured(true)
        setTimeout(() => setCaptured(false), 2000)
      }, 'image/jpeg', 0.92)
    } catch (err) {
      console.error('Capture failed:', err)
    }
  }, [position, scale, baseWidth, baseHeight, frameBorderWidth, frame.border, productImage, productName, mode])

  /* ── Snap guide lines (rendered behind artwork) ── */
  const snapGuides = (
    <>
      {/* Horizontal center guide */}
      <AnimatePresence>
        {snapH && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="ar-snap-guide-h"
          />
        )}
      </AnimatePresence>
      {/* Vertical center guide */}
      <AnimatePresence>
        {snapV && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="ar-snap-guide-v"
          />
        )}
      </AnimatePresence>
      {/* Edge snap indicator */}
      <AnimatePresence>
        {snapEdge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ar-snap-edge ar-snap-edge-${snapEdge}`}
          />
        )}
      </AnimatePresence>
      {/* Snap feedback dot at center */}
      <AnimatePresence>
        {(snapH && snapV) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="ar-snap-center-dot"
          />
        )}
      </AnimatePresence>
    </>
  )

  /* ── Shared artwork overlay (used in both camera + wall modes) ── */
  const artworkOverlay = (
    <div
      className="absolute z-40 cursor-grab active:cursor-grabbing ar-draggable-overlay"
      style={{ '--pos-x': `${position.x}px`, '--pos-y': `${position.y}px`, '--overlay-scale': scale, '--base-w': `${baseWidth}px`, '--base-h': `${baseHeight}px` } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Frame shadow */}
      <div
        className="absolute -inset-1 rounded-sm ar-frame-shadow"
        style={{ '--shadow-color': frame.shadow } as React.CSSProperties}
      />

      {/* Outer frame */}
      <div
        className="absolute rounded-sm ar-frame-shadow-inset ar-outer-frame"
        style={{ '--frame-inset': `${-frameBorderWidth}px`, '--frame-bg': frame.border } as React.CSSProperties}
      />

      {/* Inner mat */}
      <div
        className="absolute rounded-[1px] ar-mat-shadow ar-inner-mat"
        style={{ '--mat-bg': frameStyle === 'white' ? '#e8e8e4' : '#faf8f5' } as React.CSSProperties}
      />

      {/* Artwork */}
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

      {/* Size label */}
      <div
        className="absolute -bottom-10 left-1/2 whitespace-nowrap pointer-events-none ar-size-label"
        style={{ '--label-scale': 1 / scale } as React.CSSProperties}
      >
        <span className="text-[11px] text-white/70 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 font-medium tracking-wider">
          {size}&quot; — {frame.label}
        </span>
      </div>
    </div>
  )

  /* ── Shared bottom control bar ── */
  const controlBar = (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 px-4 py-4 pb-safe">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-white text-xs font-bold uppercase tracking-wider truncate">{productName}</p>
            <p className="text-white/50 text-[10px] mt-0.5">{size}&quot; • {frame.label} Frame</p>
          </div>

          <button
            onClick={captureScreenshot}
            className="w-14 h-14 rounded-full border-4 border-white/80 flex items-center justify-center hover:border-white transition-colors flex-shrink-0 mx-4 group"
            aria-label="Capture wall preview"
            title="Save screenshot"
          >
            <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white group-active:bg-white/60 transition-colors flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>

          <button
            onClick={stopCamera}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all flex-shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <>
      {/* Always-mounted video for camera mode */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={mode === 'camera' ? 'fixed inset-0 w-full h-full object-cover z-[299]' : 'fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none'}
      />

      {/* ═══════ LOADING (brief spinner) ═══════ */}
      {mode === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/70 text-sm uppercase tracking-wider font-bold">Setting up preview...</p>
          </div>
          <button
            onClick={stopCamera}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* ═══════ CAMERA MODE (live camera feed + artwork) ═══════ */}
      {mode === 'camera' && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] touch-none select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Guide toast */}
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

          {snapGuides}
          {artworkOverlay}

          {/* Capture flash */}
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

          {controlBar}
        </motion.div>
      )}

      {/* ═══════ WALL MODE (static wall background + artwork) ═══════ */}
      {mode === 'wall' && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] touch-none select-none ar-wall-bg"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Ambient lighting overlay */}
          <div className="absolute inset-0 ar-wall-light pointer-events-none" />
          {/* Floor gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] ar-wall-floor pointer-events-none" />

          {/* Use Camera button — lets user retry browser permission */}
          <button
            onClick={requestCamera}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all"
            title="Switch to live camera"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-xs font-bold uppercase tracking-wider">Use Camera</span>
          </button>

          {/* Guide toast */}
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
                    🖼️ Drag to reposition • Scroll to resize
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {snapGuides}
          {artworkOverlay}

          {/* Capture flash */}
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

          {controlBar}
        </motion.div>
      )}
    </>
  )
}
