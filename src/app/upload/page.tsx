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

// Popular Gelato canvas sizes - curated for best seller availability
// Square, Portrait, Landscape formats (most commonly available)

const CANVAS_SIZES: CanvasSize[] = [
  // Square - Most popular
  { id: '12x12', name: '12" × 12"', width: 12, height: 12, price: null, loading: true, category: 'square' },
  { id: '16x16', name: '16" × 16"', width: 16, height: 16, price: null, loading: true, category: 'square' },
  { id: '20x20', name: '20" × 20"', width: 20, height: 20, price: null, loading: true, category: 'square' },
  { id: '24x24', name: '24" × 24"', width: 24, height: 24, price: null, loading: true, category: 'square' },
  { id: '30x30', name: '30" × 30"', width: 30, height: 30, price: null, loading: true, category: 'square' },

  // Portrait - Best sellers
  { id: '12x16', name: '12" × 16"', width: 12, height: 16, price: null, loading: true, category: 'portrait' },
  { id: '16x20', name: '16" × 20"', width: 16, height: 20, price: null, loading: true, category: 'portrait' },
  { id: '18x24', name: '18" × 24"', width: 18, height: 24, price: null, loading: true, category: 'portrait' },
  { id: '24x36', name: '24" × 36"', width: 24, height: 36, price: null, loading: true, category: 'portrait' },
  { id: '30x40', name: '30" × 40"', width: 30, height: 40, price: null, loading: true, category: 'portrait' },

  // Landscape - Best sellers
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
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('black')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [customName, setCustomName] = useState('')
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [sizeCategory, setSizeCategory] = useState<SizeCategory>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { dispatch } = useCart()
  const triggerHaptic = useHaptic()

  // Fetch prices from Gelato API on mount
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

        // Update selected size with new price
        setSelectedSize(prev => ({
          ...prev,
          price: priceMap.get(prev.id) || getFallbackPrice(prev.id),
          loading: false
        }))
      } else {
        // Use fallback prices
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
    } catch (error) {
      console.error('Error fetching prices:', error)
      // Use fallback prices
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
    } finally {
      setIsLoadingPrices(false)
    }
  }

  const getFallbackPrice = (sizeId: string): number => {
    const fallbackPrices: Record<string, number> = {
      // Square formats (2x Gelato cost)
      '12x12': 3200,
      '16x16': 4400,
      '20x20': 5800,
      '24x24': 7800,
      '30x30': 11600,

      // Portrait
      '12x16': 4800,
      '16x20': 5800,
      '18x24': 7200,
      '24x36': 13000,
      '30x40': 17200,

      // Landscape
      '16x12': 4800,
      '20x16': 5800,
      '24x18': 7200,
      '36x24': 13000,
      '40x30': 17200,
      '32x48': 19600,
      '36x48': 22400,
      '40x60': 30400,

      // Panoramic formats
      '20x60': 17200,
      '30x60': 24800,

      // Additional sizes
      '28x40': 18400,
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
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      {/* Header */}
      <header className="px-4 md:px-12 py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white">Custom Print</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              YOUR ART.<br />
              <span className="text-gradient">OUR CANVAS.</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-lg">
              Transform your photos and artwork into museum-quality canvas prints.
              Upload your image and we&apos;ll handle the rest.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Upload & Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!uploadedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${isDragging
                  ? 'border-white/40 bg-white/5'
                  : 'border-white/20 hover:border-white/40 bg-zinc-900/50'
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
                    animate={{ y: isDragging ? -10 : 0 }}
                    className="w-20 h-20 mb-6 rounded-2xl bg-white/5 flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2">
                    {isDragging ? 'Drop your image here' : 'Upload your image'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Drag and drop or click to browse<br />
                    Supports JPEG, PNG, WebP up to 10MB
                  </p>

                  <span className="px-4 py-2 bg-white/5 rounded-full text-xs uppercase tracking-wider text-gray-500">
                    Recommended: 300 DPI minimum
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-white/[0.02] pointer-events-none" />
              </div>
            ) : (
              <div className="relative">
                <div
                  className="relative rounded-2xl overflow-hidden bg-zinc-900"
                  style={{ aspectRatio: getAspectRatio() }}
                >
                  <Image
                    src={uploadedImage}
                    alt="Your upload"
                    fill
                    className="object-contain p-4"
                  />
                  <div
                    className="absolute inset-4 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 8px ${GELATO_FRAME_OPTIONS[selectedFrame].primary}`,
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setCustomName('')
                  }}
                  className="mt-4 w-full py-3 border border-white/20 rounded-xl text-sm uppercase tracking-wider hover:bg-white/5 transition-colors"
                >
                  Change Image
                </button>
              </div>
            )}

            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-zinc-900 rounded-xl"
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Uploading...</span>
                    <span className="text-white">{uploadProgress}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {uploadedImage && (
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-3 block">
                  Print Title
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Name your creation"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                  Select Size {isLoadingPrices && '(Loading...)'}
                </label>
                <span className="text-xs text-gray-400">
                  {sizes.filter(s => sizeCategory === 'all' || s.category === sizeCategory).length} options
                </span>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
                {(['all', 'square', 'portrait', 'landscape'] as SizeCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSizeCategory(cat)
                      triggerHaptic()
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${sizeCategory === cat
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Horizontal Scroll Size List */}
              <div className="relative">
                <div
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {sizes
                    .filter(size => sizeCategory === 'all' || size.category === sizeCategory)
                    .map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizeSelect(size)}
                        disabled={size.loading}
                        className={`flex-shrink-0 w-28 p-3 rounded-xl border text-center transition-all snap-start ${selectedSize.id === size.id
                          ? 'border-white/40 bg-white/5'
                          : 'border-white/10 hover:border-white/30 bg-zinc-900/50'
                          } ${size.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-sm">{size.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {size.loading ? '...' : formatPrice(size.price)}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5 capitalize">{size.category}</div>
                      </button>
                    ))}
                </div>
                {/* Scroll hint */}
                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Frame Selection */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-3 block">
                Frame Style
              </label>
              <div className="flex flex-wrap gap-3">
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
                        ? 'border-white/40 bg-white/5'
                        : 'border-white/10 hover:border-white/30 bg-zinc-900/50'
                        }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: frame.primary }}
                      />
                      <span className="text-sm">{frame.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">
                    Total Price
                  </p>
                  <p className="text-3xl font-black">
                    {selectedSize.loading ? 'Loading...' : formatPrice(selectedSize.price)}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>Free shipping</p>
                  <p>5-7 business days</p>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!uploadedImage || selectedSize.loading || !selectedSize.price}
                className="w-full py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                <span className="relative z-10">
                  {!uploadedImage ? 'Upload an Image First' :
                    selectedSize.loading ? 'Loading Price...' : 'Add to Cart'}
                </span>
                <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left -z-0" />
              </button>

              {uploadedImage && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Your custom print will be reviewed by our team before printing
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
              {[
                { icon: '◈', title: 'Archival Ink', desc: '100+ year fade resistance' },
                { icon: '◆', title: 'Handcrafted', desc: 'Gallery-wrapped canvas' },
                { icon: '◇', title: 'Ready to Hang', desc: 'Hardware included' },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl text-white/70 mb-2">{feature.icon}</div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1">{feature.title}</div>
                  <div className="text-[10px] text-gray-500">{feature.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Info Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-20 border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">Image Quality</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              For best results, upload high-resolution images (300 DPI minimum).
              We support JPEG, PNG, and WebP formats up to 10MB.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Color Accuracy</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our 12-color giclée printing process ensures your artwork is reproduced
              with stunning color accuracy and detail.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Proofing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every custom order is reviewed by our team. We&apos;ll contact you if
              we detect any quality issues with your image.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
