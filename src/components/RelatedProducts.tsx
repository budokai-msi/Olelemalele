'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { getRelatedProducts, Product } from '@/lib/products'
import { useWishlist } from '@/lib/wishlistContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface RelatedProductsProps {
  currentProductId: string
  limit?: number
}

export default function RelatedProducts({ currentProductId, limit = 4 }: RelatedProductsProps) {
  const relatedProducts = getRelatedProducts(currentProductId, limit)
  const triggerHaptic = useHaptic()
  const { dispatch: cartDispatch } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  if (relatedProducts.length === 0) return null

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: product.variants[0]?.size || 'Standard',
        image: product.image
      }
    })
    cartDispatch({ type: 'TOGGLE_CART' })
    triggerHaptic()
  }

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    triggerHaptic()
  }

  return (
    <section className="py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold mb-3 block">
            Curated For You
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
            You Might Also Like
          </h2>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleWishlistToggle(product, e)}
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isInWishlist(product.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                      }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Quick Add Button */}
                  <motion.button
                    onClick={(e) => handleQuickAdd(product, e)}
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute bottom-3 left-3 right-3 py-2.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500 hover:text-white"
                  >
                    Quick Add
                  </motion.button>

                  {/* Edition Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    <span className="text-[9px] text-white/70 uppercase tracking-wider">
                      № {product.id.padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-sm md:text-base font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-sm font-mono text-gray-400">
                      ${(product.price / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
