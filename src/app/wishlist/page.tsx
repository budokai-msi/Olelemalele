'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { products } from '@/lib/products'
import { useWishlist } from '@/lib/wishlistContext'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function WishlistPage() {
  const { state, dispatch } = useWishlist()
  const { dispatch: cartDispatch } = useCart()
  const triggerHaptic = useHaptic()

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    triggerHaptic()
  }

  const handleAddToCart = (item: typeof state.items[0]) => {
    const product = products.find(p => p.id === item.id)
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        variant: product?.variants[0]?.size || 'Standard',
        image: item.image
      }
    })
    cartDispatch({ type: 'TOGGLE_CART' })
    triggerHaptic()
  }

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR' })
    triggerHaptic()
  }

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Wishlist</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold mb-4 block">
                Your Favorites
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                Wishlist
              </h1>
            </div>
            {state.items.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors underline underline-offset-4"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Wishlist Items */}
        {state.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/5 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Save your favorite pieces here to keep track of artwork you love.
            </p>
            <Link
              href="/gallery"
              className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-indigo-500 hover:text-white transition-colors"
            >
              Explore Gallery
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {state.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link href={`/product/${item.id}`}>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 mb-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemove(item.id)
                        }}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Add to Cart Button */}
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddToCart(item)
                        }}
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="absolute bottom-4 left-4 right-4 py-3 bg-white text-black rounded-full font-bold uppercase tracking-wider text-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500 hover:text-white"
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-mono text-gray-400">
                      ${(item.price / 100).toFixed(0)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Recommendations */}
        {state.items.length > 0 && state.items.length < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 pt-20 border-t border-white/5"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold">Discover More</h2>
              <p className="text-gray-400 mt-2">Explore the full collection</p>
            </div>
            <div className="flex justify-center">
              <Link
                href="/gallery"
                className="px-8 py-4 border border-white/20 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors"
              >
                View All Artworks
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
