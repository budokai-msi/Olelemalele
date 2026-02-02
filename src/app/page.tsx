'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { products } from '@/lib/products'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'


// Lazy load heavy components with optimized loading
const Hero = dynamic(() => import('@/components/Hero'), {
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl md:text-7xl font-black text-white/10 animate-pulse">
          OLELE<span className="text-indigo-500/30">MALELE</span>
        </div>
      </div>
    </div>
  ),
})

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span>{count}{suffix}</span>
}

// Infinite marquee component
function InfiniteMarquee() {
  const items = [
    'PREMIUM CANVAS',
    '•',
    'LIMITED EDITIONS',
    '•',
    'ARCHIVAL QUALITY',
    '•',
    'MUSEUM GRADE',
    '•',
    'HANDCRAFTED',
    '•',
  ]

  return (
    <div className="relative overflow-hidden py-6 bg-white/[0.02] border-y border-white/5">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1920] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            {items.map((item, j) => (
              <span
                key={j}
                className={`text-[11px] md:text-sm uppercase tracking-[0.3em] ${item === '•' ? 'text-indigo-500' : 'text-white/40'
                  } font-medium`}
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// Floating product card with 3D tilt effect
function ProductCard3D({ product, index }: { product: typeof products[0]; index: number }) {
  const triggerHaptic = useHaptic()
  const { dispatch } = useCart()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-100px' }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="relative cursor-pointer"
        >
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ transform: 'translateZ(-20px)' }}
          />

          {/* Card container */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-white/5 group-hover:border-white/10 transition-all duration-500">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-800">
              {/* Loading skeleton */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

              {/* Prismatic shine effect on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                  transform: 'translateZ(10px)',
                }}
                animate={isHovered ? { x: ['-100%', '200%'] } : {}}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />

              {/* Edition badge */}
              <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full">
                <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold">
                  № {product.id.padStart(2, '0')}
                </span>
              </div>

              {/* Quick add button */}
              <motion.button
                onClick={handleQuickAdd}
                initial={{ opacity: 0, y: 20 }}
                animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-colors"
              >
                Quick Add
              </motion.button>
            </div>

            {/* Product info */}
            <div className="p-5 border-t border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                    Canvas Edition
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-white font-mono text-lg">${product.price}</span>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">USD</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Stats section with animated counters
function StatsSection() {
  const stats = [
    { value: 400, suffix: 'G', label: 'Canvas Weight' },
    { value: 100, suffix: '+', label: 'Year Archival' },
    { value: 12, suffix: '', label: 'Color Pigments' },
    { value: 48, suffix: 'H', label: 'Curing Time' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="text-3xl md:text-4xl font-mono font-black text-white mb-2">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Interactive featured product spotlight
function FeaturedSpotlight() {
  const [activeProduct, setActiveProduct] = useState(0)
  const product = products[activeProduct]

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-indigo-400 font-bold mb-4 block">
            Featured Drop
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
            Spotlight
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Product image with effects */}
          <motion.div
            key={activeProduct}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
            <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
              {/* Loading skeleton */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority={activeProduct === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Floating frame preview */}
              <div className="absolute inset-8 border-4 border-white/20 rounded-xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Product selector */}
          <div className="space-y-8">
            {products.slice(0, 4).map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => setActiveProduct(i)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${activeProduct === i
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                  }`}
                whileHover={{ x: 10 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      № {p.id.padStart(2, '0')}
                    </span>
                    <h3 className={`text-xl font-black uppercase mt-1 transition-colors ${activeProduct === i ? 'text-indigo-400' : 'text-white'
                      }`}>
                      {p.name}
                    </h3>
                  </div>
                  <span className="text-white font-mono text-lg">${p.price}</span>
                </div>

                {/* Progress indicator */}
                {activeProduct === i && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5 }}
                    className="h-0.5 bg-indigo-500 mt-4 origin-left"
                    onAnimationComplete={() => {
                      if (activeProduct < products.slice(0, 4).length - 1) {
                        setActiveProduct(prev => prev + 1)
                      } else {
                        setActiveProduct(0)
                      }
                    }}
                  />
                )}
              </motion.button>
            ))}

            {/* View all CTA */}
            <Link href={`/product/${product.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white text-black rounded-full text-center font-black uppercase tracking-wider text-sm hover:bg-indigo-500 hover:text-white transition-colors"
              >
                View Details
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
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

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Infinite Marquee */}
      <InfiniteMarquee />

      {/* Featured Spotlight */}
      <FeaturedSpotlight />

      {/* CANVAS COLLECTION */}
      <section className="py-20 md:py-32 px-4 md:px-12 max-w-[1920px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold mb-4 block">
            [ 001 — CANVAS DROP ]
          </span>
          <h2 className="text-4xl md:text-7xl font-black tracking-tight text-white uppercase">
            The Collection
          </h2>
        </motion.div>

        {/* Product grid with 3D cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {products.map((product, index) => (
            <ProductCard3D key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-12 max-w-[1920px] mx-auto">
        <StatsSection />
      </section>


      {/* THE PROCESS */}
      <section className="py-32 px-4 md:px-12 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-indigo-400 font-bold mb-4 block italic">
              Our Promise
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase mb-6">
              Precision<br /><span className="text-gray-500 italic">Crafted</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
              Every canvas is a statement. Archival-grade materials meet
              uncompromising craftsmanship for art that transcends time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '◈',
                title: 'Museum Grade',
                desc: 'Premium cotton canvas with protective coating for 100+ year preservation'
              },
              {
                icon: '◆',
                title: 'Vivid Colors',
                desc: '12-color pigment system delivers unparalleled depth and vibrancy'
              },
              {
                icon: '◇',
                title: 'Ready to Hang',
                desc: 'Gallery-wrapped with solid wood stretcher bars, pre-tensioned'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl border border-white/5 hover:border-indigo-500/30 bg-white/[0.02] hover:bg-indigo-500/5 transition-all duration-500"
              >
                <div className="text-3xl text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-black to-violet-900/30" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square"
          >
            <div className="absolute inset-0 bg-gradient-conic from-indigo-500/10 via-transparent to-violet-500/10 blur-3xl" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 text-center px-4"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-[10px] text-indigo-400 uppercase tracking-[0.5em] mb-8 font-bold"
          >
            Drop Cycle 001 — Final Pieces
          </motion.p>

          <h2 className="text-5xl md:text-8xl font-black tracking-tight mb-12 uppercase">
            Experience<br />
            <span className="text-gradient italic">Art</span>
          </h2>

          <Link href="/gallery">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-16 py-5 border-2 border-white/50 rounded-full text-lg font-black uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                Explore Drops
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
