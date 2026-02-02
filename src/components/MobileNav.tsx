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
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { state: wishlistState } = useWishlist()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
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
        className="md:hidden relative z-[60] w-10 h-10 flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-5 flex flex-col justify-between">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-white origin-center"
            transition={{ duration: 0.3 }}
          />
          <motion.span
            animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            className="w-full h-0.5 bg-white"
            transition={{ duration: 0.2 }}
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-white origin-center"
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] md:hidden"
            />

            {/* Menu Panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-zinc-950 z-[56] md:hidden flex flex-col"
            >
              {/* Logo Area */}
              <div className="p-6 border-b border-white/5">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <span className="text-2xl font-extrabold tracking-tight">
                    OLE<span className="text-gray-500">MALE</span>
                  </span>
                </Link>
              </div>

              {/* Main Navigation */}
              <div className="flex-1 overflow-y-auto py-8 px-6">
                <div className="space-y-2">
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
                          className={`flex items-center justify-between py-4 px-4 rounded-xl transition-all ${isActive
                              ? 'bg-white/10 text-white'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-indigo-400 text-lg">{link.icon}</span>
                            <span className="text-lg font-medium">{link.label}</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Auth Section */}
                <div className="mt-8 pt-8 border-t border-white/5">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block py-4 px-4 text-gray-400 hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsOpen(false)
                        }}
                        className="w-full text-left py-4 px-4 text-gray-400 hover:text-white transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full py-3 text-center border border-white/20 rounded-full text-white font-medium hover:bg-white/10 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="block w-full py-3 text-center bg-white text-black rounded-full font-medium hover:bg-indigo-500 hover:text-white transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="p-6 border-t border-white/5">
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {footerLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="hover:text-white transition-colors"
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
