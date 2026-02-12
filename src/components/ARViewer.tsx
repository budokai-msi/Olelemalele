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

const FRAME_COLORS: Record<string, { border: string; shadow: string; label: string }> = {
  white: { border: '#f5f5f0', shadow: 'rgba(200,200,200,0.4)', label: 'Gallery Wrap' },
  black: { border: '#000000', shadow: 'rgba(0,0,0,0.6)', label: 'Black' },
  natural: { border: '#9D6C3C', shadow: 'rgba(140,100,50,0.4)', label: 'Natural Wood' },
  darkbrown: { border: '#5C4033', shadow: 'rgba(60,40,25,0.5)', label: 'Dark Brown' },
}

function parseSize(size: string): { w: number; h: number } {
  const match = size.match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (match) return { w: parseInt(match[1]), h: parseInt(match[2]) }
  return { w: 12, h: 16 }
}

// Detect if mobile device
function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export default function ARViewer({
  productImage,
  productName,
  frameStyle,
  size,
  onClose,
}: ARViewerProps) {
  const [mode, setMode] = useState<'loading' | 'camera' | 'wall' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [showGuide, setShowGuide] = useState(true)
  const [captured, setCaptured] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  const [snapH, setSnapH] = useState(false)
  const [snapV, setSnapV] = useState(false)
  const [snapEdge, setSnapEdge] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null)
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  const { w, h } = parseSize(size)
  const frame = FRAME_COLORS[frameStyle] || FRAME_COLORS.white
  const aspectRatio = w / h
  const baseHeight = 240
  const baseWidth = baseHeight * aspectRatio
  const frameBorderWidth = 12

  useEffect(() => {
    setIsMobileDevice(isMobile())
  }, [])

  const addDebug = (msg: string) => {
    console.log(`[AR] ${msg}`)
    setDebugInfo(prev => [...prev.slice(-4), msg])
  }

  const SNAP_THRESHOLD = 18
  const EDGE_MARGIN = 40

  const checkSnap = useCallback((newPos: { x: number; y: number }) => {
    const container = containerRef.current
    if (!container) return newPos

    const cw = container.offsetWidth
    const ch = container.offsetHeight
    let { x, y } = newPos
    let didSnapH = false
    let didSnapV = false
    let edgeSnap: 'left' | 'right' | 'top' | 'bottom' | null = null

    if (Math.abs(x) < SNAP_THRESHOLD) {
      x = 0
      didSnapV = true
    }
    if (Math.abs(y) < SNAP_THRESHOLD) {
      y = 0
      didSnapH = true
    }

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

    if (snapTimeout.current) clearTimeout(snapTimeout.current)
    if (didSnapH || didSnapV || edgeSnap) {
      snapTimeout.current = setTimeout(() => {
        setSnapH(false)
        setSnapV(false)
        setSnapEdge(null)
      }, 1200)
    }

    return { x, y }
  }, [baseWidth, baseHeight, scale])

  const requestCamera = useCallback(async () => {
    addDebug('Starting camera request...')
    setMode('loading')
    setErrorMessage('')
    setErrorDetail('')

    if (typeof window === 'undefined') {
      addDebug('ERROR: Window not defined (SSR)')
      setMode('wall')
      return
    }

    const mobile = isMobile()
    addDebug(`Device: ${mobile ? 'MOBILE' : 'DESKTOP'}`)
    addDebug(`Protocol: ${window.location.protocol}`)
    addDebug(`Host: ${window.location.hostname}`)

    // Check HTTPS
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isHTTPS = window.location.protocol === 'https:'
    
    if (!isHTTPS && !isLocalhost) {
      setErrorMessage('Camera requires HTTPS')
      setErrorDetail(`Current: ${window.location.protocol}//${window.location.hostname}`)
      setMode('wall')
      return
    }

    // Check getUserMedia
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Camera not supported')
      setErrorDetail('Your browser does not support camera access')
      setMode('wall')
      return
    }

    // Check permission state
    let permissionState: string | null = null
    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        permissionState = permission.state
        addDebug(`Permission: ${permissionState}`)
        
        if (permissionState === 'denied') {
          setErrorMessage('Camera permission denied')
          setErrorDetail('Please reset camera permissions in your browser settings (click the lock icon in the address bar)')
          setMode('error')
          return
        }
      }
    } catch (e) {
      addDebug('Permission API not available')
    }

    // Wait for video element
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!videoRef.current) {
      setErrorMessage('Camera setup failed')
      setErrorDetail('Video element not ready')
      setMode('wall')
      return
    }

    // Try cameras with different constraints
    const attempts: MediaStreamConstraints[] = []
    
    if (mobile) {
      // Mobile: Try back camera first
      attempts.push(
        { video: { facingMode: { exact: 'environment' } }, audio: false },
        { video: { facingMode: 'environment' }, audio: false },
        { video: { facingMode: 'user' }, audio: false },
        { video: true, audio: false }
      )
    } else {
      // Desktop: Any camera
      attempts.push(
        { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
        { video: true, audio: false }
      )
    }

    for (let i = 0; i < attempts.length; i++) {
      const constraints = attempts[i]
      try {
        addDebug(`Trying camera ${i + 1}/${attempts.length}...`)
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        addDebug(`✓ Camera obtained!`)
        
        const track = stream.getVideoTracks()[0]
        addDebug(`Track: ${track?.label || 'unknown'}`)

        streamRef.current = stream

        const video = videoRef.current
        video.srcObject = stream

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000)
          video.onloadedmetadata = () => {
            clearTimeout(timeout)
            addDebug(`Video: ${video.videoWidth}x${video.videoHeight}`)
            resolve()
          }
          video.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Video error'))
          }
        })

        await video.play()
        addDebug('✓ Camera active!')

        setMode('camera')
        setShowGuide(true)
        setPosition({ x: 0, y: 0 })
        setScale(1)
        setTimeout(() => setShowGuide(false), 3000)
        return
        
      } catch (err: any) {
        addDebug(`✗ Attempt ${i + 1} failed: ${err.name}`)
        
        // Clean up failed stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }

        // Last attempt failed
        if (i === attempts.length - 1) {
          handleCameraError(err)
        }
      }
    }
  }, [setPosition])

  function handleCameraError(err: any) {
    addDebug(`FINAL ERROR: ${err.name}: ${err.message}`)
    
    let msg = 'Camera unavailable'
    let detail = err.message

    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        msg = 'Permission denied'
        detail = 'Click the lock icon in your address bar and allow camera access, then try again'
        break
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        msg = 'No camera found'
        detail = mobile ? 'Make sure your device has a camera and it\'s not in use by another app' : 'Your computer may not have a camera, or it\'s being used by another application (Zoom, Teams, etc.)'
        break
      case 'NotReadableError':
      case 'TrackStartError':
        msg = 'Camera in use'
        detail = 'Another app is using your camera. Close Zoom, Teams, or other video apps and try again'
        break
      case 'OverconstrainedError':
        msg = 'Camera not compatible'
        detail = 'Your camera doesn\'t support the required settings'
        break
      case 'SecurityError':
        msg = 'Security blocked'
        detail = 'Camera access is blocked by your browser settings'
        break
      case 'AbortError':
        msg = 'Camera aborted'
        detail = 'You cancelled the camera permission prompt'
        break
    }

    setErrorMessage(msg)
    setErrorDetail(detail)
    setMode('error')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      requestCamera()
    }, 500)
    return () => clearTimeout(timer)
  }, [requestCamera])

  useEffect(() => {
    if (mode === 'wall') {
      setPosition({ x: 0, y: 0 })
      setScale(1)
      setShowGuide(true)
      setTimeout(() => setShowGuide(false), 3000)
    }
  }, [mode, setPosition])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCaptured(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Touch handlers
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

  // Mouse handlers
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

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05
    setScale(prev => Math.min(Math.max(prev * zoomFactor, 0.3), 4))
  }, [])

  // Screenshot
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

      if (mode === 'camera' && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, cw, ch)
      } else {
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

      ctx.fillStyle = frame.border
      ctx.fillRect(centerX - overlayW / 2 - frameW, centerY - overlayH / 2 - frameW, overlayW + frameW * 2, overlayH + frameW * 2)

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

  const snapGuides = (
    <>
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

  const artworkOverlay = (
    <div
      className="absolute z-40 cursor-grab active:cursor-grabbing ar-draggable-overlay"
      style={{ '--pos-x': `${position.x}px`, '--pos-y': `${position.y}px`, '--overlay-scale': scale, '--base-w': `${baseWidth}px`, '--base-h': `${baseHeight}px` } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute -inset-1 rounded-sm ar-frame-shadow"
        style={{ '--shadow-color': frame.shadow } as React.CSSProperties}
      />
      <div
        className="absolute rounded-sm ar-frame-shadow-inset ar-outer-frame"
        style={{ '--frame-inset': `${-frameBorderWidth}px`, '--frame-bg': frame.border } as React.CSSProperties}
      />
      <div
        className="absolute rounded-[1px] ar-mat-shadow ar-inner-mat"
        style={{ '--mat-bg': frameStyle === 'white' ? '#e8e8e4' : '#faf8f5' } as React.CSSProperties}
      />
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

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={mode === 'camera' ? 'fixed inset-0 w-full h-full object-cover z-[299]' : 'fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none'}
      />

      {/* LOADING */}
      {mode === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/70 text-sm uppercase tracking-wider font-bold">
              {isMobileDevice ? 'Accessing camera...' : 'Looking for camera...'}
            </p>
            <p className="text-white/40 text-xs mt-2">
              {isMobileDevice ? 'Please allow camera permission' : 'Allow camera access when prompted'}
            </p>
          </div>
          <button
            onClick={stopCamera}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* ERROR */}
      {mode === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-6"
        >
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">📷❌</div>
            <h3 className="text-xl font-bold text-white mb-2">{errorMessage}</h3>
            <p className="text-gray-400 mb-4">{errorDetail}</p>
            
            <div className="bg-gray-900 rounded-lg p-3 mb-4 text-left">
              <p className="text-xs text-gray-500 mb-2">Debug:</p>
              {debugInfo.map((info, i) => (
                <p key={i} className="text-xs text-gray-400 font-mono">{info}</p>
              ))}
            </div>

            <div className="space-y-3">
              <button 
                onClick={requestCamera}
                className="w-full px-4 py-3 bg-white text-black rounded-full font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => setMode('wall')}
                className="w-full px-4 py-3 border border-white/30 text-white rounded-full font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                Use Wall Preview
              </button>
              <button 
                onClick={stopCamera}
                className="w-full px-4 py-3 text-white/50 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* CAMERA MODE */}
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
                    📐 {isMobileDevice ? 'Point at wall • Drag • Pinch' : 'Drag to move • Scroll to resize'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {snapGuides}
          {artworkOverlay}

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

      {/* WALL MODE */}
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
          <div className="absolute inset-0 ar-wall-light pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[30%] ar-wall-floor pointer-events-none" />

          <button
            onClick={requestCamera}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-xs font-bold uppercase tracking-wider">Try Camera</span>
          </button>

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
                    🖼️ Drag to position • Scroll to resize
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {snapGuides}
          {artworkOverlay}

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
