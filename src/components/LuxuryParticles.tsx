'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

// Luxury ambient particles that respond to mouse movement
export default function LuxuryParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
    color: string
  }>>([])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    // Generate initial ambient particles
    const generateParticles = () => {
      const colors = [
        'rgba(99, 102, 241, 0.4)',   // Indigo
        'rgba(139, 92, 246, 0.4)',   // Violet
        'rgba(236, 72, 153, 0.3)',   // Pink
        'rgba(255, 255, 255, 0.2)',  // White
        'rgba(79, 70, 229, 0.3)',    // Deep indigo
      ]

      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setParticles(newParticles)
    }

    generateParticles()

    // Track mouse for particle influence
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          x: useSpring(useTransform(mouseX, [0, window.innerWidth || 1920], [-100, 100]), { stiffness: 50, damping: 30 }),
          y: useSpring(useTransform(mouseY, [0, window.innerHeight || 1080], [-100, 100]), { stiffness: 50, damping: 30 }),
          left: '10%',
          top: '20%',
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          x: useSpring(useTransform(mouseX, [0, window.innerWidth || 1920], [50, -50]), { stiffness: 30, damping: 20 }),
          y: useSpring(useTransform(mouseY, [0, window.innerHeight || 1080], [50, -50]), { stiffness: 30, damping: 20 }),
          right: '10%',
          bottom: '30%',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  )
}
