'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useState, useTransition } from 'react'

interface TransitionLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function TransitionLink({
  href,
  children,
  className = '',
  onClick
}: TransitionLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (onClick) onClick()

    // Start navigation animation
    setIsNavigating(true)

    // Navigate after a brief delay for exit animation
    startTransition(() => {
      setTimeout(() => {
        router.push(href)
      }, 150)
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
    >
      <motion.span
        className="inline-block"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        animate={isNavigating ? { opacity: 0.7 } : { opacity: 1 }}
      >
        {children}
      </motion.span>
    </Link>
  )
}

// Animated button link variant
export function AnimatedLinkButton({
  href,
  children,
  className = '',
  variant = 'primary'
}: TransitionLinkProps & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const baseStyles = "relative overflow-hidden rounded-full font-bold uppercase tracking-wider transition-all duration-300"

  const variantStyles = {
    primary: "bg-white text-black px-8 py-4 hover:bg-indigo-500 hover:text-white",
    secondary: "border-2 border-white/20 text-white px-8 py-4 hover:border-white hover:bg-white/5",
    ghost: "text-white/70 hover:text-white px-4 py-2"
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    startTransition(() => {
      setTimeout(() => {
        router.push(href)
      }, 150)
    })
  }

  return (
    <Link href={href} onClick={handleClick}>
      <motion.span
        className={`${baseStyles} ${variantStyles[variant]} ${className} inline-block`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {/* Shine effect on hover */}
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{ translateX: '100%' }}
          transition={{ duration: 0.5 }}
        />
        <span className="relative z-10">{children}</span>
      </motion.span>
    </Link>
  )
}
