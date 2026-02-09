'use client'

import { useAuth } from '@/lib/useAuth'
import { useWishlist } from '@/lib/wishlistContext'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import MobileNav from './MobileNav'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/upload', label: 'Custom Print' },
  { href: '/about', label: 'About' },
]

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className="relative group">
      <motion.span
        className={`inline-block transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {label}
      </motion.span>
      {/* Animated underline */}
      <motion.span
        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-white/30 to-white/20"
        initial={{ width: isActive ? '100%' : '0%' }}
        animate={{ width: isActive ? '100%' : '0%' }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </Link>
  )
}

function WishlistButton() {
  const { state } = useWishlist()
  const itemCount = state.items.length

  return (
    <Link href="/wishlist" className="relative group">
      <motion.div
        className="relative p-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gray-400 group-hover:text-white transition-colors"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {itemCount > 9 ? '9+' : itemCount}
          </motion.span>
        )}
      </motion.div>
    </Link>
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const [hidden, setHidden] = useState(false)

  // Sticky-Show-Hide: hide on scroll down, show on scroll up
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? '-100%' : 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 w-full bg-black/90 backdrop-blur-md text-white p-6 z-50 border-b border-white/5"
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <motion.span
            className="text-2xl md:text-3xl font-extrabold tracking-tight cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            OLELE<span className="text-gray-500">MALELE</span>
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-lg">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}

          {/* Wishlist */}
          <WishlistButton />

          {user ? (
            <>
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/admin" label="Admin" />
              <motion.button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <NavLink href="/login" label="Login" />
              <Link href="/register">
                <motion.span
                  className="relative overflow-hidden bg-white text-black px-6 py-2 rounded-full text-sm font-medium inline-block"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {/* Shimmer effect — fixed: was using unicode minus U+2212 */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
                    animate={{ translateX: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <span className="relative z-10">Sign Up</span>
                </motion.span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <WishlistButton />
          <MobileNav />
        </div>
      </nav>
    </motion.header>
  )
}
