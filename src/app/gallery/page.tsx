'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { products } from '@/lib/products'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const ITEMS_PER_BATCH = 6

export default function Gallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_BATCH)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const triggerHaptic = useHaptic()
  const { dispatch } = useCart()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayedProducts = useMemo(() => {
    return products.slice(0, displayCount)
  }, [displayCount])

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    // Simulate network delay for smooth feel
    setTimeout(() => {
      const newCount = Math.min(displayCount + ITEMS_PER_BATCH, products.length)
      setDisplayCount(newCount)
      setHasMore(newCount < products.length)
      setIsLoading(false)
      triggerHaptic()
    }, 300)
  }, [displayCount, hasMore, isLoading, triggerHaptic])

  // Intersection Observer for infinite scroll
  const observerTargetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  const handleQuickAdd = (product: typeof products[0]) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: product.variants[0]?.size || 'Standard',
        image: product.image
      }
    })
    dispatch({ type: 'TOGGLE_CART' })
    triggerHaptic()
  }

  return (
    <main className="h-screen bg-surface text-on-surface flex flex-col overflow-hidden relative">
      {/* ═══ Ambient Glow ═══ */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/[0.04] blur-[200px] rounded-full pointer-events-none animate-pulse-glow z-0" />
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b border-[rgb(var(--border))] bg-surface/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-on-faint uppercase tracking-wider mb-1">
              <Link href="/" className="hover:text-accent transition-colors">Home</Link>
              <span>/</span>
              <span className="text-on-surface">Archive</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              CANVAS <span className="text-accent">COLLECTION</span>
            </h1>
          </div>
          <p className="text-sm text-on-muted">
            {mounted ? `${products.length} pieces` : 'Loading...'}
          </p>
        </div>
      </header>

      {/* Infinite Scroll Container - Gemini Style */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    delay: (index % ITEMS_PER_BATCH) * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  layout
                  className="group relative"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative overflow-hidden aspect-[4/5] bg-surface-raised rounded-2xl">
                      {/* Glow on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 z-10 pointer-events-none ${hoveredId === product.id ? 'opacity-100' : ''}`} />

                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 6}
                      />

                      {/* Edition Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-surface/60 backdrop-blur-md rounded-full z-20 border border-accent/20">
                        <span className="text-[10px] text-accent uppercase tracking-wider font-medium">
                          № {product.id.padStart(2, '0')}
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 z-20">
                        <motion.span
                          initial={{ y: 20, opacity: 0 }}
                          animate={hoveredId === product.id ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 py-2.5 border border-accent/50 rounded-full backdrop-blur-sm text-xs uppercase tracking-widest text-white"
                        >
                          View Details
                        </motion.span>
                        <motion.button
                          initial={{ y: 20, opacity: 0 }}
                          animate={hoveredId === product.id ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          onClick={(e) => {
                            e.preventDefault()
                            handleQuickAdd(product)
                          }}
                          className="px-6 py-2.5 bg-accent text-white rounded-full text-xs uppercase tracking-widest font-medium hover:bg-accent-glow transition-colors"
                        >
                          Quick Add
                        </motion.button>
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="mt-4 px-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-on-faint uppercase tracking-wider mt-1">
                          {product.category} — {product.type}
                        </p>
                      </div>
                      <span className="text-accent font-mono text-sm">
                        ${(product.price / 100).toFixed(0)}
                      </span>
                    </div>

                    {/* Variant Pills */}
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {product.variants.slice(0, 3).map((v, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-accent/5 rounded text-[10px] text-on-muted uppercase tracking-wider"
                        >
                          {v.size}
                        </span>
                      ))}
                      {product.variants.length > 3 && (
                        <span className="px-2 py-1 text-[10px] text-on-faint">
                          +{product.variants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Loading Trigger & Indicator */}
          <div
            ref={observerTargetRef}
            className="py-12 flex flex-col items-center"
          >
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-0" />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-300" />
                <span className="text-xs text-on-faint uppercase tracking-wider ml-2">Loading more...</span>
              </motion.div>
            )}
            {!hasMore && displayedProducts.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-on-faint uppercase tracking-wider"
              >
                — All {products.length} pieces loaded —
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
