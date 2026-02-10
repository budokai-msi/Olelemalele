'use client'

import { GELATO_FRAME_OPTIONS, type FrameStyle } from '@/components/Product3D'
import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CanvasSize {
  id: string
  name: string
  width: number
  height: number
  price: number | null
  loading: boolean
  category: 'square' | 'portrait' | 'landscape'
}

type SizeCategory = 'all' | 'square' | 'portrait' | 'landscape'

const CANVAS_SIZES: CanvasSize[] = [
  // Square
  { id: '12x12', name: '12" × 12"', width: 12, height: 12, price: null, loading: true, category: 'square' },
  { id: '16x16', name: '16" × 16"', width: 16, height: 16, price: null, loading: true, category: 'square' },
  { id: '20x20', name: '20" × 20"', width: 20, height: 20, price: null, loading: true, category: 'square' },
  { id: '24x24', name: '24" × 24"', width: 24, height: 24, price: null, loading: true, category: 'square' },
  { id: '30x30', name: '30" × 30"', width: 30, height: 30, price: null, loading: true, category: 'square' },

  // Portrait
  { id: '12x16', name: '12" × 16"', width: 12, height: 16, price: null, loading: true, category: 'portrait' },
  { id: '16x20', name: '16" × 20"', width: 16, height: 20, price: null, loading: true, category: 'portrait' },
  { id: '18x24', name: '18" × 24"', width: 18, height: 24, price: null, loading: true, category: 'portrait' },
  { id: '24x36', name: '24" × 36"', width: 24, height: 36, price: null, loading: true, category: 'portrait' },
  { id: '30x40', name: '30" × 40"', width: 30, height: 40, price: null, loading: true, category: 'portrait' },

  // Landscape
  { id: '16x12', name: '16" × 12"', width: 16, height: 12, price: null, loading: true, category: 'landscape' },
  { id: '20x16', name: '20" × 16"', width: 20, height: 16, price: null, loading: true, category: 'landscape' },
  { id: '24x18', name: '24" × 18"', width: 24, height: 18, price: null, loading: true, category: 'landscape' },
  { id: '36x24', name: '36" × 24"', width: 36, height: 24, price: null, loading: true, category: 'landscape' },
  { id: '40x30', name: '40" × 30"', width: 40, height: 30, price: null, loading: true, category: 'landscape' },
]

export default function CustomUploadPage() {
  const [sizes, setSizes] = useState<CanvasSize[]>(CANVAS_SIZES)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[4])
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('white')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [customName, setCustomName] = useState('')
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [sizeCategory, setSizeCategory] = useState<SizeCategory>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { dispatch } = useCart()
  const triggerHaptic = useHaptic()

  useEffect(() => {
    fetchPrices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPrices = async () => {
    setIsLoadingPrices(true)
    try {
      const response = await fetch('/api/gelato/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sizes: CANVAS_SIZES.map(s => s.id),
          country: 'US',
          currency: 'USD'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const priceMap = new Map<string, number>(data.prices.map((p: any) => [p.size, Number(p.price) || 0]))

        setSizes(prev => prev.map(size => ({
          ...size,
          price: priceMap.get(size.id) || getFallbackPrice(size.id),
          loading: false
        })))

        setSelectedSize(prev => ({
          ...prev,
          price: priceMap.get(prev.id) || getFallbackPrice(prev.id),
          loading: false
        }))
      } else {
        applyFallbackPrices()
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      applyFallbackPrices()
    } finally {
      setIsLoadingPrices(false)
    }
  }

  const applyFallbackPrices = () => {
    setSizes(prev => prev.map(size => ({
      ...size,
      price: getFallbackPrice(size.id),
      loading: false
    })))
    setSelectedSize(prev => ({
      ...prev,
      price: getFallbackPrice(prev.id),
      loading: false
    }))
  }

  const getFallbackPrice = (sizeId: string): number => {
    const fallbackPrices: Record<string, number> = {
      '12x12': 3200, '16x16': 4400, '20x20': 5800, '24x24': 7800, '30x30': 11600,
      '12x16': 4800, '16x20': 5800, '18x24': 7200, '24x36': 13000, '30x40': 17200,
      '16x12': 4800, '20x16': 5800, '24x18': 7200, '36x24': 13000, '40x30': 17200,
    }
    return fallbackPrices[sizeId] || 13000
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, or WebP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setCustomName(file.name.replace(/\.[^/.]+$/, ''))
      }, 300)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleAddToCart = () => {
    if (!uploadedImage || !selectedSize.price) return

    triggerHaptic()

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `custom-${Date.now()}`,
        name: customName || 'Custom Canvas',
        price: selectedSize.price,
        quantity: 1,
        variant: `${selectedSize.id}-${selectedFrame}`,
        image: uploadedImage,
        isCustom: true,
      }
    })

    dispatch({ type: 'TOGGLE_CART' })
  }

  const handleSizeSelect = (size: CanvasSize) => {
    if (size.loading) return
    setSelectedSize(size)
    triggerHaptic()
  }

  const getAspectRatio = () => selectedSize.width / selectedSize.height

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Loading...'
    return `$${(price / 100).toFixed(0)}`
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 relative overflow-hidden">
      {/* ═══ Ambient Glow Orbs ═══ */}
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-white/[0.04] blur-[160px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-40 left-1/4 w-[400px] h-[400px] bg-white/[0.05] blur-[140px] rounded-full pointer-events-none animate-pulse-glow upload-glow-delayed" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10">

        {/* ═══ Header (checkout-style) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-8 text-[10px] uppercase tracking-[0.3em] font-bold">
            <Link href="/" className="text-gray-600 hover:text-white transition-colors">Home</Link>
            <span className="text-gray-800">/</span>
            <span className="text-white">Custom Print</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-black tracking-tighter mb-4 uppercase">
            Your Art.{' '}
            <span className="text-gradient">Our Canvas.</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Transform your photos and artwork into museum-quality canvas prints.
            Upload your image and we&apos;ll handle the rest.
          </p>
        </motion.div>

        {/* ═══ Main Grid (checkout-style 12-col) ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24">

          {/* ━━━ Left Side: Upload & Preview ━━━ */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {!uploadedImage ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: 'circOut' }}
                >
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative aspect-[4/3] rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden glass ${isDragging
                      ? 'border-white/40 bg-white/[0.06]'
                      : 'border-white/20 hover:border-white/40'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      title="Upload your image"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <motion.div
                        animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }}
                        className="w-24 h-24 mb-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                      >
                        <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </motion.div>

                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                        {isDragging ? 'Drop it here' : 'Upload Your Image'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 max-w-xs">
                        Drag and drop or click to browse.
                        Supports JPEG, PNG, WebP up to 10MB.
                      </p>

                      <span className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                        Recommended: 300 DPI minimum
                      </span>
                    </div>
                  </div>

                  {/* Upload progress */}
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 glass p-6 rounded-2xl border border-white/10"
                      >
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Uploading...</span>
                          <span className="text-white font-mono">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: 'circOut' }}
                >
                  <div className="glass p-6 rounded-[2rem] border border-white/10 glow-border">
                    <div
                      className="relative rounded-xl overflow-hidden bg-black/40 upload-preview-aspect"
                      style={{ '--aspect': getAspectRatio() } as React.CSSProperties}
                    >
                      <Image
                        src={uploadedImage}
                        alt="Your upload"
                        fill
                        className="object-contain p-4"
                      />
                      <div
                        className="absolute inset-4 pointer-events-none upload-frame-border"
                        style={{ '--frame-color': GELATO_FRAME_OPTIONS[selectedFrame].primary } as React.CSSProperties}
                      />
                    </div>

                    {/* Print title input */}
                    <div className="mt-6">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2 block px-1">
                        Print Title
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Name your creation"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-700"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setCustomName('')
                      }}
                      className="mt-4 w-full py-3 border border-white/20 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ━━━ Right Side: Configuration (sticky like checkout) ━━━ */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 glass p-8 lg:p-10 rounded-[2rem] glow-border laser-border-orbit">
              <h2 className="text-2xl font-black tracking-tighter mb-8 uppercase">Configure</h2>

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                    Select Size {isLoadingPrices && '(Loading...)'}
                  </label>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {sizes.filter(s => sizeCategory === 'all' || s.category === sizeCategory).length} options
                  </span>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                  {(['all', 'square', 'portrait', 'landscape'] as SizeCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSizeCategory(cat)
                        triggerHaptic()
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${sizeCategory === cat
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                    >
                      {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Scrollable Size List */}
                <div className="relative">
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide upload-size-scroller pb-2 -mx-1 px-1 snap-x snap-mandatory"
                  >
                    {sizes
                      .filter(size => sizeCategory === 'all' || size.category === sizeCategory)
                      .map((size) => (
                        <button
                          key={size.id}
                          onClick={() => handleSizeSelect(size)}
                          disabled={size.loading}
                          className={`flex-shrink-0 w-28 p-3 rounded-xl border text-center transition-all snap-start ${selectedSize.id === size.id
                            ? 'border-white bg-white/5'
                            : 'border-white/10 hover:border-white/30'
                            } ${size.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="font-bold text-sm">{size.name}</div>
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            {size.loading ? '...' : formatPrice(size.price)}
                          </div>
                          <div className="text-[10px] text-gray-600 mt-0.5 capitalize">{size.category}</div>
                        </button>
                      ))}
                  </div>
                  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-black/70 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Frame Selection */}
              <div className="mb-8 pt-6 border-t border-white/5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-3 block">
                  Frame Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(GELATO_FRAME_OPTIONS) as FrameStyle[]).map((style) => {
                    const frame = GELATO_FRAME_OPTIONS[style]
                    return (
                      <button
                        key={style}
                        onClick={() => {
                          setSelectedFrame(style)
                          triggerHaptic()
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedFrame === style
                          ? 'border-white bg-white/5'
                          : 'border-white/10 hover:border-white/30'
                          }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 upload-frame-swatch"
                          style={{ '--swatch-color': frame.primary } as React.CSSProperties}
                        />
                        <span className="text-xs font-bold uppercase tracking-tight">{frame.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price + CTA */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Total Price</p>
                    <p className="text-4xl font-black font-mono">
                      {selectedSize.loading ? '...' : formatPrice(selectedSize.price)}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-gray-500 uppercase tracking-widest">
                    <p>Free shipping</p>
                    <p>5-7 business days</p>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!uploadedImage || selectedSize.loading || !selectedSize.price}
                  className="w-full py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glow-intense laser-btn"
                >
                  {!uploadedImage ? 'Upload an Image First' :
                    selectedSize.loading ? 'Loading Price...' : 'Add to Cart'}
                </button>

                {uploadedImage && (
                  <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
                    Your custom print will be reviewed before printing
                  </p>
                )}
              </div>

              {/* Micro-Copy */}
              <div className="mt-8 flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest justify-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Museum-Quality Guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Info Section — with laser glow ═══ */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-12 py-20 mt-20 border-t border-white/10 relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[300px] bg-white/[0.04] blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {[
            { icon: '◈', title: 'Image Quality', desc: 'For best results, upload high-resolution images (300 DPI minimum). We support JPEG, PNG, and WebP formats up to 10MB.' },
            { icon: '◆', title: 'Color Accuracy', desc: 'Our 12-color giclée printing process ensures your artwork is reproduced with stunning color accuracy and detail.' },
            { icon: '◇', title: 'Proofing', desc: 'Every custom order is reviewed by our team. We\'ll contact you if we detect any quality issues with your image.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-[2rem] border border-white/10 glow-border laser-border-orbit"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-white/70 mb-4">{feature.icon}</div>
              <h3 className="text-base font-black uppercase tracking-tight mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ Feature Strip ═══ */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-12 pb-12">
        <div className="grid grid-cols-3 gap-8">
          {[
            { icon: '🎨', title: 'Archival Ink', desc: '100+ year fade resistance' },
            { icon: '🖼️', title: 'Handcrafted', desc: 'Gallery-wrapped canvas' },
            { icon: '📦', title: 'Ready to Hang', desc: 'Hardware included' },
          ].map((feature, i) => (
            <div key={i} className="text-center py-6">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{feature.title}</div>
              <div className="text-[10px] text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
