'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

// Premium cinematic hero with video background + entrance animations
export default function HeroSimple() {
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll-linked parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const smoothTextY = useSpring(textY, { stiffness: 100, damping: 30 })
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })

  // Staggered entrance variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Layer 1: Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-black to-black z-[1]" />

      {/* Layer 2: Video fluid simulation — 30% opacity, blended */}
      <motion.div className="absolute inset-0 z-[2]" style={{ y: videoY }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        >
          <source
            src="/WebGL_Fluid_Simulation_Video_Generation.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>

      {/* Layer 3: Animated gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl z-[3]"
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          left: '10%',
          top: '20%',
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl z-[3]"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          right: '15%',
          bottom: '25%',
        }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 20, -10, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Layer 4: Content with mix-blend-difference + parallax */}
      <motion.div
        className="relative z-10 text-center px-4 mix-blend-difference"
        style={{ y: smoothTextY, opacity: smoothOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Brand Name — OLELE / MALELE with mix-blend-difference */}
        <motion.h1
          className="text-[14vw] md:text-[10vw] leading-[0.85] font-black text-white tracking-[-0.04em] uppercase mb-6"
          variants={fadeUp}
        >
          <span className="block">OLELE</span>
          <span className="block text-indigo-400">MALELE</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-xl text-gray-400 max-w-md mx-auto mb-10 tracking-wide"
          variants={fadeUp}
        >
          Premium canvas art for the modern collector
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={fadeUp}
        >
          <Link
            href="/gallery"
            className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-indigo-500 hover:text-white transition-colors duration-300"
          >
            View Collection
          </Link>
          <Link
            href="/upload"
            className="px-8 py-4 border border-white/30 text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors duration-300"
          >
            Custom Print
          </Link>
        </motion.div>
      </motion.div>

      {/* Layer 5: Animated scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
