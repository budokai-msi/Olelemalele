'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const FRAGMENTS = [
  '0xDEADBEEF',
  'GENESIS_INIT',
  'Φ',
  'λ',
  'APPAREL_PROTOCOL',
  '1.61803398',
]

export default function MysticBaseline() {
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 500], [0.3, 0.1])

  useEffect(() => {
    setMounted(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Optimization: Pre-render noise
    const noiseCanvas = document.createElement('canvas')
    noiseCanvas.width = 128
    noiseCanvas.height = 128
    const nCtx = noiseCanvas.getContext('2d')
    if (nCtx) {
      const nData = nCtx.createImageData(128, 128)
      for (let i = 0; i < nData.data.length; i += 4) {
        const val = Math.random() * 255
        nData.data[i] = 160
        nData.data[i + 1] = 170
        nData.data[i + 2] = 255
        nData.data[i + 3] = val * 0.1 // Low alpha for grain
      }
      nCtx.putImageData(nData, 0, 0)
    }

    // Dynamic Grain + Subtle Grid + Chaos Bursts
    const draw = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 0. Pulse logic
      const pulse = Math.sin(time * 2) * 0.5 + 0.5

      // 1. Optimized Noise (Tiled drawing)
      ctx.save()
      ctx.globalAlpha = 0.5 + pulse * 0.5
      for (let x = 0; x < canvas.width; x += 128) {
        for (let y = 0; y < canvas.height; y += 128) {
          ctx.drawImage(noiseCanvas, x, y)
        }
      }
      ctx.restore()

      // 2. The "Elegant Chaos" Grid
      const glitch = Math.random() > 0.99 ? Math.random() * 50 : 0
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + (glitch ? 0.04 : 0)})`
      ctx.lineWidth = 0.5

      const spacing = 150 // Increased spacing for performance
      const offset = (Math.sin(time * 0.5) * 20) + glitch

      ctx.beginPath()
      for (let x = -spacing; x < canvas.width + spacing; x += spacing) {
        ctx.moveTo(x + offset + Math.sin(time + x * 0.005) * 30, 0)
        ctx.lineTo(x + offset + Math.cos(time + x * 0.005) * 30, canvas.height)
      }
      for (let y = -spacing; y < canvas.height + spacing; y += spacing) {
        ctx.moveTo(0, y + offset + Math.sin(time + y * 0.005) * 30)
        ctx.lineTo(canvas.width, y + offset + Math.cos(time + y * 0.005) * 30)
      }
      ctx.stroke()

      // 3. Chaos Bursts
      if (Math.random() > 0.99) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.beginPath()
        const rx = Math.random() * canvas.width
        ctx.moveTo(rx, 0)
        ctx.lineTo(rx + (Math.random() - 0.5) * 200, canvas.height)
        ctx.stroke()
      }

      animationFrame = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen" />

      {/* Floating Fragments - The machine's subconscious */}
      {FRAGMENTS.map((text, i) => (
        <FloatingFragment key={i} text={text} index={i} />
      ))}

      {/* The Baseline Gradient - Deep Void */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
    </motion.div>
  )
}

function FloatingFragment({ text, index }: { text: string; index: number }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setPos({
      x: (index * 137.5) % 90 + 5,
      y: (index * 73.1) % 90 + 5
    })
  }, [index])

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: `${pos.x}vw`,
        y: `${pos.y}vh`,
        rotate: index * 15
      }}
      animate={{
        opacity: [0, 0.08, 0],
        y: [`${pos.y}vh`, `${pos.y - 4}vh`],
      }}
      transition={{
        duration: 25 + index * 5,
        repeat: Infinity,
        ease: "linear",
        delay: index * 4
      }}
      className="absolute text-[7px] md:text-[9px] font-mono text-white/30 tracking-[0.8em] whitespace-nowrap mix-blend-overlay"
    >
      {text}
    </motion.div>
  )
}
