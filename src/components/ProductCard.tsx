'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { Canvas } from '@react-three/fiber'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useState } from 'react'
import Blob from './Blob'

interface ProductCardProps {
  product: {
    id: string
    name: string
    image: string
    price: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" })
  const { dispatch } = useCart()
  const triggerHaptic = useHaptic()
  const [isHovered, setIsHovered] = useState(false)

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: 'Standard',
        image: product.image
      }
    })
    dispatch({ type: 'TOGGLE_CART' })
    triggerHaptic()
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-500"
    >
      <Link href={`/product/${product.id}`} className="block">
        {/* Visual Area */}
        <div className="aspect-[4/5] w-full relative overflow-hidden bg-zinc-900">
          {/* Static Image */}
          <motion.img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* 3D Experience on Hover */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {isHovered && (
              <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Blob />
              </Canvas>
            )}
          </div>

          {/* Quick View Badge */}
          <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-[10px] uppercase tracking-widest text-white/70">Explore 3D</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-bold text-xl tracking-tight mb-1 group-hover:text-indigo-400 transition-colors duration-300">
                {product.name}
              </h3>
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Premium Drop 001</span>
            </div>
            <span className="text-white font-mono text-sm">${(product.price / 100).toFixed(0)}</span>
          </div>

          <button
            onClick={addToCart}
            className="w-full bg-white text-black py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 hover:text-white transition-all duration-300 transform active:scale-95 z-20"
          >
            Add to Bag
          </button>
        </div>
      </Link>
    </motion.div>
  )
}
