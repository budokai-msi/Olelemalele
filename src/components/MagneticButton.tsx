'use client'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  strength?: number
  radius?: number
}

// Magnetic button that attracts to cursor
export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.3,
  radius = 150,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const scale = useSpring(1, springConfig)
  const rotate = useTransform(xSpring, [-50, 50], [-5, 5])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    if (distance < radius) {
      x.set(distanceX * strength)
      y.set(distanceY * strength)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    scale.set(1)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    scale.set(1.05)
    setIsHovered(true)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{
        x: xSpring,
        y: ySpring,
        scale,
        rotateZ: rotate,
      }}
      className={`relative cursor-pointer ${className}`}
    >
      {/* Glow effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-xl -z-10"
          />
        )}
      </AnimatePresence>

      {children}
    </motion.div>
  )
}

// Magnetic link with text scramble effect
export function MagneticLink({
  children,
  href,
  className = ''
}: {
  children: string
  href: string
  className?: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayText, setDisplayText] = useState(children)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const originalText = children

  const handleMouseEnter = () => {
    setIsHovered(true)
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(prev =>
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) return originalText[index]
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join('')
      )
      iteration += 1 / 3
      if (iteration >= originalText.length) {
        clearInterval(interval)
        setDisplayText(originalText)
      }
    }, 30)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setDisplayText(originalText)
  }

  return (
    <MagneticButton strength={0.2}>
      <a
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative overflow-hidden ${className}`}
      >
        <span className="font-mono tracking-wider">{displayText}</span>
        <motion.span
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={{ width: '0%' }}
          animate={{ width: isHovered ? '100%' : '0%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </a>
    </MagneticButton>
  )
}
