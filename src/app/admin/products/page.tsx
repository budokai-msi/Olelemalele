'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Product {
  _id: string
  id: string
  name: string
  category: string
  price: number
  image: string
  inventory: number
  isActive: boolean
  collection?: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.category.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-white">Products</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Products</h1>
              <p className="text-gray-400 mt-1">Manage your canvas collection</p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search products..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => fetchProducts()}
                className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden">
                <div className="aspect-square bg-zinc-800 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link
                      href={`/product/${product.id}`}
                      className="px-3 py-1.5 bg-white text-black text-sm rounded-full hover:bg-indigo-500 hover:text-white transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-indigo-400 font-mono">
                      ${(product.price / 100).toFixed(0)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.inventory > 10 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.inventory} in stock
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found</p>
            <Link
              href="/admin/seed"
              className="text-indigo-400 hover:text-indigo-300 underline mt-2 inline-block"
            >
              Seed database with products
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
