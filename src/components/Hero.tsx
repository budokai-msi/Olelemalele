'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import { memo, useCallback, useEffect, useState } from 'react'

// Lazy load VoidArt (heavy 3D component)
const VoidArt = dynamic(() => import('@/components/VoidArt'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
})

function Hero() {
  const triggerHaptic = useHaptic()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 })
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 })

  const { scrollY } = useScroll()

  const titleY = useTransform(scrollY, [0, 500], [0, 100])
  const videoScale = useTransform(scrollY, [0, 1000], [1, 1.15])

  // Optimized mouse handler with useCallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set((e.clientX / window.innerWidth - 0.5) * 20)
    mouseY.set((e.clientY / window.innerHeight - 0.5) * 20)
  }, [mouseX, mouseY])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <section className="relative h-screen-safe w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Video - lazy loaded */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale: videoScale }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        >
          <source src="/WebGL_Fluid_Simulation_Video_Generation.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* Simulated Void Art */}
      <VoidArt />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-10 px-4">

        {/* Brand Name with Blend Mode & Ghost Shadow */}
        <div className="relative group/title">
          {/* Ghost Shadow (The Doubt) */}
          <motion.div
            style={{
              y: titleY,
              x: springX,
            }}
            className="absolute inset-0 mix-blend-difference z-10 opacity-40 blur-[2px]"
          >
            <h1 className="text-[12vw] md:text-[10vw] leading-[0.9] font-black text-white/50 tracking-[-0.05em] select-none text-center uppercase flex flex-col">
              <span>OLELE</span>
              <span className="text-indigo-500/30">MALELE</span>
            </h1>
          </motion.div>

          <motion.div
            style={{ y: titleY }}
            className="relative mix-blend-difference z-20 flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: springX,
                y: springY,
              }}
              className="text-[12vw] md:text-[10vw] leading-[0.9] font-black text-white tracking-[-0.05em] select-none text-center cursor-default uppercase flex flex-col"
              onMouseEnter={() => triggerHaptic()}
            >
              <span>OLELE</span>
              <span className="text-indigo-500">MALELE</span>
            </motion.h1>
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-30 mt-8 md:mt-12"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-2xl font-light italic text-white/80 tracking-widest text-center"
          >
            Art in motion. Captured for you.
          </motion.h2>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 md:mt-16 z-30"
        >
          <a
            href="/gallery"
            className="group relative px-10 py-4 border-2 border-white/40 rounded-full overflow-hidden transition-all duration-300 hover:border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            onClick={() => triggerHaptic()}
          >
            <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-white group-hover:text-black transition-colors">
              Enter the Archive
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>

      {/* Machine Heartbeat (The Baseline) */}
      <MachineHeartbeat />

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 opacity-30"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  )
}

function MachineHeartbeat() {
  const [hex, setHex] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setHex(Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0'))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-white/20 tracking-[0.2em] hidden md:block">
      SYS_CLK: 0x{hex}
    </div>
  )
}

export default memo(Hero)
