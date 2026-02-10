'use client'

import { useAuth } from '@/lib/useAuth'
import { useWishlist } from '@/lib/wishlistContext'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home', icon: '◈' },
  { href: '/gallery', label: 'Gallery', icon: '◆' },
  { href: '/upload', label: 'Custom Print', icon: '▣' },
  { href: '/about', label: 'About', icon: '◇' },
  { href: '/contact', label: 'Contact', icon: '○' },
  { href: '/wishlist', label: 'Wishlist', icon: '♡' },
]

const footerLinks = [
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping', label: 'Shipping' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { state: wishlistState } = useWishlist()

  // Handle scroll behavior - hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 100) {
        setIsVisible(true)
        setLastScrollY(currentScrollY)
        return
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsVisible(true)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-surface/60 dark:bg-black/50 backdrop-blur-md rounded-full border border-[rgb(var(--border))]"
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        aria-label="Toggle menu"
      >
        <div className="relative w-5 h-4 flex flex-col justify-between">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-on-surface origin-center block"
            transition={{ duration: 0.3 }}
          />
          <motion.span
            animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            className="w-full h-0.5 bg-on-surface block"
            transition={{ duration: 0.2 }}
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-on-surface origin-center block"
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.button>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-surface/90 dark:bg-black/90 backdrop-blur-md z-[90] md:hidden"
            />

            {/* Menu Panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-surface-raised dark:bg-zinc-950 z-[95] md:hidden flex flex-col border-l border-[rgb(var(--border))]"
            >
              {/* Header with Close */}
              <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <span className="text-xl font-extrabold tracking-tight text-on-surface">
                    OLELE<span className="text-accent">MALELE</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-on-muted hover:text-on-surface relative z-10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Main Navigation */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-1">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href
                    const wishlistCount = link.href === '/wishlist' ? wishlistState.items.length : 0

                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between py-3.5 px-4 rounded-xl transition-all ${isActive
                            ? 'bg-accent/10 text-accent'
                            : 'text-on-muted hover:bg-accent/5 hover:text-on-surface'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-accent/60 text-lg">{link.icon}</span>
                            <span className="text-base font-medium">{link.label}</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-accent text-white text-xs px-2.5 py-1 rounded-full font-medium">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Cart Quick Link */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="mt-2"
                >
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3.5 px-4 rounded-xl text-on-muted hover:bg-accent/5 hover:text-on-surface transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-accent/60 text-lg">⬡</span>
                      <span className="text-base font-medium">Cart</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                </motion.div>

                {/* Auth Section */}
                <div className="mt-6 pt-6 border-t border-[rgb(var(--border))]">
                  {user ? (
                    <div className="space-y-1">
                      <div className="px-4 py-3 mb-2">
                        <p className="text-xs text-on-faint uppercase tracking-wider">Signed in as</p>
                        <p className="text-on-surface font-medium truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-on-muted hover:bg-accent/5 hover:text-on-surface transition-all"
                      >
                        <span className="text-lg">◉</span>
                        <span className="text-base">Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-left"
                      >
                        <span className="text-lg">⊘</span>
                        <span className="text-base">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full py-3.5 text-center border border-accent/20 rounded-xl text-on-surface font-medium hover:bg-accent/5 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="block w-full py-3.5 text-center btn-accent rounded-xl font-medium"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="p-4 border-t border-[rgb(var(--border))]">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-faint">
                  {footerLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
