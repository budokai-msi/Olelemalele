'use client'

import ARButton from '@/components/ARButton'
import { GELATO_FRAME_OPTIONS, type FrameStyle } from '@/components/Product3D'
import RelatedProducts from '@/components/RelatedProducts'
import { useHaptic } from '@/hooks/useHaptic'
import { useHardwareDetection } from '@/hooks/useHardwareDetection'
import { useCart } from '@/lib/cartContext'
import { products } from '@/lib/products'
import { useWishlist } from '@/lib/wishlistContext'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// Dynamic imports for heavy 3D libraries
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false })
const Product3D = dynamic(() => import('@/components/Product3D'), { ssr: false })
const Environment = dynamic(() => import('@react-three/drei').then(mod => mod.Environment), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => mod.OrbitControls), { ssr: false })
const PerspectiveCamera = dynamic(() => import('@react-three/drei').then(mod => mod.PerspectiveCamera), { ssr: false })
const ContactShadows = dynamic(() => import('@react-three/drei').then(mod => mod.ContactShadows), { ssr: false })

export default function ProductPage() {
  const params = useParams()
  const { dispatch } = useCart()
  const { isInWishlist, toggleWishlist: toggleWishlistContext } = useWishlist()
  const triggerHaptic = useHaptic()
  const hardware = useHardwareDetection()

  // Handle the case where params might be null
  const productId = params?.id as string | undefined
  const product = products.find(p => p.id === productId)

  const [selectedSize, setSelectedSize] = useState(product?.variants[0]?.size || '')
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('white')
  const [isAdding, setIsAdding] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [flowingTexts, setFlowingTexts] = useState<{ id: number; text: string; x: number; y: number; direction: number }[]>([])

  // Generate flowing text phrases based on product
  const getProductPhrases = useCallback(() => {
    if (!product) return ['art', 'vision']
    const basePhrases = [
      product.name,
      product.productCollection || '',
      ...(product.tags || []),
    ].filter(Boolean) // Remove empty strings
    return basePhrases.length > 0 ? basePhrases : [product.name]
  }, [product])

  // Spawn a new flowing text
  const spawnFlowingText = useCallback(() => {
    const phrases = getProductPhrases()
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
    const newText = {
      id: Date.now() + Math.random(),
      text: randomPhrase.toUpperCase(),
      x: Math.random() * 60 + 20, // 20-80% of width
      y: Math.random() * 60 + 20, // 20-80% of height
      direction: Math.random() > 0.5 ? 1 : -1,
    }
    setFlowingTexts(prev => [...prev.slice(-5), newText]) // Keep max 6 texts
  }, [getProductPhrases])

  // Handle drag start - spawn flowing texts
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    spawnFlowingText()
  }, [spawnFlowingText])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Spawn texts continuously while dragging
  useEffect(() => {
    if (!isDragging) return
    const spawnInterval = setInterval(() => {
      spawnFlowingText()
    }, 400) // Spawn new text every 400ms while dragging
    return () => clearInterval(spawnInterval)
  }, [isDragging, spawnFlowingText])

  // Clean up old flowing texts
  useEffect(() => {
    const cleanup = setInterval(() => {
      setFlowingTexts(prev => prev.filter(t => Date.now() - t.id < 3000))
    }, 1000)
    return () => clearInterval(cleanup)
  }, [])

  const productInWishlist = product ? isInWishlist(product.id) : false

  const toggleWishlist = () => {
    if (!product) return
    triggerHaptic()
    toggleWishlistContext({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Drop not found.</h2>
          <Link href="/gallery" className="text-accent hover:text-accent-glow underline">Back to Archive</Link>
        </div>
      </div>
    )
  }

  const addToCart = () => {
    setIsAdding(true)
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: selectedSize,
        image: product.image,
      },
    })
    triggerHaptic()

    setTimeout(() => {
      setIsAdding(false)
      dispatch({ type: 'TOGGLE_CART' })
    }, 800)
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface selection:bg-accent/20">
      {/* Immersive Layout Container */}
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* Left Side: 3D Immersive Viewer */}
        <div className="relative w-full lg:w-[60%] h-[60vh] lg:h-screen bg-surface-raised dark:bg-[#0a0a0a] overflow-hidden">
          <div
            className="absolute inset-0 z-0"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            {hardware.webGL ? (
              <Canvas
                shadows={hardware.supportsShadows}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                dpr={hardware.performance === 'low' ? [1, 1] : [1, 1.5]}
                gl={{
                  antialias: hardware.performance !== 'low',
                  powerPreference: hardware.performance === 'low' ? "low-power" : "high-performance",
                  failIfMajorPerformanceCaveat: true,
                  alpha: true
                }}
                frameloop="always"
              >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />

                {/* Simplified lighting for low-performance systems */}
                <ambientLight
                  intensity={hardware.performance === 'low' ? 0.8 : 0.5}
                />

                {hardware.supportsShadows && (
                  <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={0.8}
                    castShadow={false}
                  />
                )}

                <pointLight
                  position={[-10, -10, -10]}
                  intensity={hardware.performance === 'low' ? 0.3 : 0.5}
                />

                {hardware.performance !== 'low' && <Environment preset="city" />}

                <Product3D
                  image={product.image}
                  position={[0, 0, 0]}
                  scale={[1.2, 1.2, 1.2]}
                  disableAnimation={hardware.performance === 'low'}
                  frameStyle={selectedFrame}
                />

                {hardware.supportsShadows && (
                  <ContactShadows
                    position={[0, -2, 0]}
                    opacity={0.2}
                    scale={10}
                    blur={hardware.performance === 'low' ? 0.5 : 1}
                    far={4.5}
                    resolution={hardware.performance === 'low' ? 128 : 256}
                  />
                )}

                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.5}
                  enableDamping={true}
                  dampingFactor={0.05}
                />
              </Canvas>
            ) : (
              // Fallback for systems without WebGL
              <div className="w-full h-full flex items-center justify-center bg-surface-raised">
                <div className="text-center p-4">
                  <div className="text-on-surface text-lg mb-4">3D Preview Unavailable</div>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={600}
                    className="mx-auto rounded-lg"
                    priority
                  />
                  <p className="text-on-muted mt-4 text-sm">
                    Your device may not support 3D graphics.
                    Image preview shown instead.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Flowing Text Overlay - appears on drag */}
          <AnimatePresence>
            {flowingTexts.map((flowText) => (
              <motion.div
                key={flowText.id}
                className="absolute pointer-events-none select-none z-20"
                style={{
                  left: `${flowText.x}%`,
                  top: `${flowText.y}%`,
                }}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  x: -50,
                  y: -20,
                }}
                animate={{
                  opacity: [0, 0.8, 0.6, 0],
                  scale: [0.5, 1.1, 1, 0.9],
                  x: flowText.direction * 100,
                  y: -60,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span
                  className="text-2xl md:text-4xl font-black tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-glow-hex, #5EEAD4) 0%, var(--accent-hex, #2DD4BF) 50%, var(--accent-glow-hex, #5EEAD4) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(45, 212, 191, 0.5)',
                    filter: 'drop-shadow(0 0 20px rgba(94, 234, 212, 0.4))',
                  }}
                >
                  {flowText.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Drag Active Indicator */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 border-2 border-accent/20 rounded-lg m-4" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gamified Viewer Controls Hint */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {/* Animated drag icon */}
            <motion.div
              className="flex items-center gap-3 glass px-5 py-3 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Hand/Drag SVG Icon */}
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/70"
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path
                  d="M12 2L12 6M12 6L9 3M12 6L15 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22L12 18M12 18L9 21M12 18L15 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L6 12M6 12L3 9M6 12L3 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 12L18 12M18 12L21 9M18 12L21 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </motion.svg>

              <span
                className="text-[11px] uppercase tracking-[0.15em] font-medium bg-gradient-to-r from-accent/80 to-accent/40 bg-clip-text text-transparent">
                Drag to Rotate
              </span>

              {/* Pulsing dot indicator */}
              <motion.div
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          {/* Edition Tag */}
          <div className="absolute top-32 left-8 lg:left-12 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass px-4 py-2 rounded-full"
            >
              <span className="text-[10px] font-mono tracking-widest text-on-faint">EDITION № {product.id.padStart(3, '0')}</span>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full lg:w-[40%] flex flex-col p-8 lg:p-16 xl:p-24 lg:justify-center bg-surface border-l border-[rgb(var(--border))]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'circOut' }}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs text-accent uppercase tracking-[0.3em] font-semibold font-sans">
                [ {product.category} ]
              </p>

              {/* Wishlist Button */}
              <motion.button
                onClick={toggleWishlist}
                className="group p-2 -mt-1 -mr-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={productInWishlist ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={`transition-colors                  ${productInWishlist ? 'text-red-500' : 'text-on-muted group-hover:text-accent'}`}
                  animate={productInWishlist ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </motion.svg>
              </motion.button>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-mono text-on-muted mb-8 tracking-tight">
              ${(product.price / 100).toFixed(0)}
            </p>

            <div className="space-y-8 mb-12">
              <p className="text-on-muted leading-relaxed text-sm lg:text-base max-w-md">
                {product.description || "Experimental visual statement. Part of the first Olelemalele drop cycle. High-density pigments on archival-grade canvas fibers. Built to endure, designed to provoke."}
              </p>

              {/* Variant Selection */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-on-faint font-bold">Select Size</span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => { setSelectedSize(v.size); triggerHaptic(); }}
                      className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 border ${selectedSize === v.size
                        ? 'bg-accent text-white border-accent'
                        : 'bg-transparent text-on-muted border-[rgb(var(--border))] hover:border-accent/40 hover:text-on-surface'
                        }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Style Selection - Gelato Options */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-on-faint font-bold">Frame Style</span>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(GELATO_FRAME_OPTIONS) as FrameStyle[]).map((style) => {
                    const frame = GELATO_FRAME_OPTIONS[style]
                    return (
                      <button
                        key={style}
                        onClick={() => { setSelectedFrame(style); triggerHaptic(); }}
                        className={`group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 border ${selectedFrame === style
                          ? 'bg-accent/10 border-accent/50'
                          : 'bg-transparent border-[rgb(var(--border))] hover:border-accent/30'
                          }`}
                      >
                        {/* Color swatch */}
                        <span
                          className={`w-4 h-4 rounded-full border border-accent/20 shadow-inner swatch-${style}`}
                        />
                        <span className={`transition-colors ${selectedFrame === style ? 'text-accent' : 'text-on-muted group-hover:text-on-surface'}`}>
                          {frame.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4">
              {/* AR Button - New */}
              <ARButton
                productImage={product.image}
                productName={product.name}
                frameStyle={selectedFrame}
                size={selectedSize}
              />

              <button
                disabled={isAdding}
                onClick={addToCart}
                className="group relative w-full bg-accent text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)]"
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.span
                      key="adding"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="inline-block"
                    >
                      Adding to Bag...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="inline-block"
                    >
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-accent-glow scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left -z-10" />
              </button>

              <div className="flex items-center justify-between text-[10px] text-on-faint uppercase tracking-widest px-2">
                <span>Free global delivery</span>
                <span>•</span>
                <span>Archival quality</span>
                <span>•</span>
                <span>Limited drop</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products Section */}
      <RelatedProducts currentProductId={product.id} />
    </main>
  )
}
