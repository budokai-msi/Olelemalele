'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { products } from '@/lib/products'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// Simple lightweight hero
import Hero from '@/components/HeroSimple'

// Animated counter - triggers only when scrolled into view
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // IntersectionObserver to trigger count only when visible
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasTriggered])

  // Animate only after scrolled into view
  useEffect(() => {
    if (!hasTriggered) return
    const duration = 1500
    const steps = 30
    const increment = value / steps
    let current = 0
    let frame = 0

    const timer = setInterval(() => {
      frame++
      current += increment
      if (frame >= steps) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, hasTriggered])

  return <span ref={ref}>{count}{suffix}</span>
}

// Simple CSS marquee - no JS animation
function SimpleMarquee() {
  const items = ['PREMIUM CANVAS', '•', 'LIMITED EDITIONS', '•', 'ARCHIVAL QUALITY', '•', 'MUSEUM GRADE', '•']

  return (
    <div className="relative overflow-hidden py-6 bg-accent/[0.03] border-y border-[rgb(var(--border))]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            {items.map((item, j) => (
              <span
                key={j}
                className={`text-[11px] md:text-sm uppercase tracking-[0.3em] ${item === '•' ? 'text-accent' : 'text-on-muted'} font-medium`}
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Simplified product card
function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const triggerHaptic = useHaptic()
  const { dispatch } = useCart()

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
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
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-surface-raised dark:bg-zinc-900 border border-[rgb(var(--border))] hover:border-accent/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(45,212,191,0.1)]">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 3}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{product.variants[0]?.size}</span>
              <button
                onClick={handleQuickAdd}
                className="px-4 py-1.5 bg-accent/20 hover:bg-accent text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function HomePage() {
  const featuredProducts = products.slice(0, 6)

  return (
    <div className="bg-surface text-on-surface">
      {/* Hero */}
      <Hero />

      {/* Marquee */}
      <SimpleMarquee />

      {/* Featured Products */}
      <section className="py-20 px-4 md:px-8 relative overflow-hidden">
        {/* ═══ Ambient Turquoise Glow ═══ */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/[0.04] blur-[180px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
              Featured <span className="text-accent">Works</span>
            </h2>
            <p className="text-on-muted max-w-md mx-auto">
              Curated selection of our most celebrated pieces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-block px-8 py-4 border border-accent/30 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-accent hover:text-white transition-all glow laser-btn laser-btn-dark"
            >
              View All Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 border-t border-[rgb(var(--border))]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-black text-accent mb-2">
              <AnimatedCounter value={18} />
            </div>
            <p className="text-sm text-on-muted uppercase tracking-wider">Artworks</p>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-accent mb-2">
              <AnimatedCounter value={50} suffix="+" />
            </div>
            <p className="text-sm text-on-muted uppercase tracking-wider">Size Options</p>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-accent mb-2">
              <AnimatedCounter value={100} suffix="%" />
            </div>
            <p className="text-sm text-on-muted uppercase tracking-wider">Archival</p>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-accent mb-2">
              <AnimatedCounter value={5} suffix="★" />
            </div>
            <p className="text-sm text-on-muted uppercase tracking-wider">Rated</p>
          </div>
        </div>
      </section>
    </div>
  )
}
