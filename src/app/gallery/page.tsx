'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { Product, products } from '@/lib/products'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type FilterType = 'all' | 'canvas' | 'poster'

export default function Gallery() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const triggerHaptic = useHaptic()
  const { dispatch } = useCart()

  // Ensure hydration matches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fix for mobile viewport height
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setVH()
    window.addEventListener('resize', setVH)
    return () => window.removeEventListener('resize', setVH)
  }, [])

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products
    return products.filter(p => p.type === filter)
  }, [filter])

  // Use stable count for SSR
  const displayCount = mounted ? filteredProducts.length : products.length

  const handleQuickAdd = (product: Product) => {
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
    <main className="min-h-screen bg-black text-white">
      {/* Hero Header */}
      <header className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-12">
        <div className="max-w-[1920px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white">Archive</span>
            </div>

            {/* Title Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs md:text-sm text-gray-500 uppercase tracking-[0.3em] mb-4"
                >
                  [ {displayCount} pieces ]
                </motion.p>
                <h1 className="text-[clamp(3rem,12vw,9rem)] font-black tracking-tighter leading-[0.85]">
                  CANVAS<br />
                  <span className="text-gradient">COLLECTION</span>
                </h1>
              </div>

              {/* Filter Pills */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2 flex-wrap"
              >
                {(['all', 'canvas', 'experimental', 'limited'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilter(type)
                      triggerHaptic()
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 ${filter === type
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {type === 'all' ? 'All Works' : type}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Gallery Grid */}
      <section className="px-4 md:px-12 pb-24 md:pb-32">
        <div className="max-w-[1920px] mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image Container */}
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative overflow-hidden aspect-4-5 bg-gradient-to-b from-gray-900 to-black rounded-lg md:rounded-xl mb-4">
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-indigo-600/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 z-10 pointer-events-none ${hoveredId === product.id ? 'opacity-100' : ''}`} />

                      <div className="absolute inset-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 2}
                          loading={index < 2 ? undefined : 'lazy'}
                        />
                      </div>

                      {/* Edition Badge */}
                      <div className="absolute top-3 left-3 glass px-3 py-1.5 rounded-full z-20">
                        <span className="text-[10px] text-white/80 uppercase tracking-wider font-medium">
                          № {product.id.padStart(2, '0')}
                        </span>
                      </div>

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 z-20">
                        <motion.span
                          initial={{ y: 20, opacity: 0 }}
                          animate={hoveredId === product.id ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 py-2.5 border border-white/50 rounded-full backdrop-blur-sm text-xs uppercase tracking-widest"
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
                          className="px-6 py-2.5 bg-white text-black rounded-full text-xs uppercase tracking-widest font-medium hover:bg-indigo-500 hover:text-white transition-colors"
                        >
                          Quick Add
                        </motion.button>
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="px-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold tracking-tight group-hover:text-gradient transition-all duration-300">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                          {product.category} — {product.type}
                        </p>
                      </div>
                      <span className="text-gray-400 font-mono text-sm">
                        ${product.price}
                      </span>
                    </div>

                    {/* Variants Pills */}
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {product.variants.slice(0, 3).map((v, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 uppercase tracking-wider"
                        >
                          {v.size}
                        </span>
                      ))}
                      {product.variants.length > 3 && (
                        <span className="px-2 py-1 text-[10px] text-gray-500">
                          +{product.variants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <p className="text-gray-500 text-lg">No pieces found in this category.</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-white underline underline-offset-4 hover:text-indigo-400 transition-colors"
              >
                View all works
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-12 pb-24">
        <div className="max-w-[1920px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/5 p-8 md:p-16 text-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
              <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mb-4">
                Custom Commissions
              </p>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
                Want something unique?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                We create custom pieces tailored to your space. From size adjustments to entirely new compositions.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-white text-black rounded-full font-medium uppercase tracking-wider text-sm hover:bg-indigo-500 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
