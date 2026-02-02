'use client'

import { useCart } from '@/lib/cartContext'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Cart() {
  const { state, dispatch } = useCart()

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  // Close cart when pressing Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'TOGGLE_CART' })
    }
    if (state.isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [state.isOpen, dispatch])

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-black border-l border-white/5 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-black/50 backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">YOUR CART</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  {state.items.reduce((acc, item) => acc + item.quantity, 0)} Items Collected
                </p>
              </div>
              <button
                onClick={() => { dispatch({ type: 'TOGGLE_CART' }); triggerHaptic(); }}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300 transform active:scale-95"
                aria-label="Close cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">CART IS EMPTY</h3>
                  <p className="text-gray-500 text-xs uppercase tracking-widest leading-loose max-w-[180px] mb-8">
                    Your collection starts with a single statement.
                  </p>
                  <Link
                    href="/gallery"
                    onClick={() => { dispatch({ type: 'TOGGLE_CART' }); triggerHaptic(); }}
                    className="px-8 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Explore Drops
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-6 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="h-28 w-24 bg-zinc-900 rounded-xl flex-shrink-0 overflow-hidden relative border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent z-10" />
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-white font-bold tracking-tight uppercase text-sm group-hover:text-indigo-400 transition-colors">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => {
                                dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id, variant: item.variant } });
                                triggerHaptic();
                              }}
                              className="text-gray-600 hover:text-white transition-colors"
                              aria-label="Remove item"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{item.variant}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-white font-mono text-sm">${(item.price / 100).toFixed(0)}</p>
                          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                            <button
                              onClick={() => { dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, variant: item.variant, quantity: Math.max(0, item.quantity - 1) } }); triggerHaptic(); }}
                              className="text-gray-500 hover:text-white text-lg font-light"
                            >
                              -
                            </button>
                            <span className="text-xs text-white w-4 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => { dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, variant: item.variant, quantity: item.quantity + 1 } }); triggerHaptic(); }}
                              className="text-gray-500 hover:text-white text-lg font-light"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${(state.total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500">
                    <span>Shipping</span>
                    <span className="text-indigo-400 font-bold italic text-[10px]">FREE ARCHIVAL DELIVERY</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-lg font-black tracking-tighter text-white">TOTAL</span>
                    <span className="text-lg font-mono text-white">${(state.total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => { dispatch({ type: 'TOGGLE_CART' }); triggerHaptic(); }}
                  className="group relative block w-full bg-white text-black text-center py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                >
                  <span className="relative z-10">Checkout Now</span>
                  <div className="absolute inset-0 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left -z-10" />
                </Link>
                <p className="text-center text-[9px] text-gray-600 uppercase tracking-[0.2em] mt-6">
                  Secured & encrypted payment processing
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
