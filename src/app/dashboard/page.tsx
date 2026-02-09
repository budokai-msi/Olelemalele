'use client'

import { useAuth } from '@/lib/useAuth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Order {
  _id: string
  items: { name: string; quantity: number }[]
  total: number
  status: string
  createdAt: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=10')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <Link href="/login" className="text-white/70 hover:underline">
            Please login to continue
          </Link>
        </div>
      </main>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400',
    processing: 'text-blue-400',
    shipped: 'text-gray-400',
    delivered: 'text-green-400',
    cancelled: 'text-red-400'
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-400">Manage your orders and profile</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Orders Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-800 rounded animate-pulse" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="bg-zinc-800/50 p-4 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Order #{order._id.slice(-6)}</span>
                        <span className={`text-xs ${statusColors[order.status] || 'text-gray-400'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {order.items.length} items • ${(order.total / 100).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No orders yet</p>
                <Link
                  href="/gallery"
                  className="text-white/70 hover:text-white/60 underline"
                >
                  Start shopping
                </Link>
              </div>
            )}
          </motion.div>

          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Member Since</label>
                <p className="text-lg">January 2026</p>
              </div>
            </div>
            <Link
              href="/wishlist"
              className="block w-full text-center py-3 bg-white text-black rounded-xl font-medium hover:bg-white hover:text-white transition-colors mt-6"
            >
              View Wishlist
            </Link>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link
            href="/gallery"
            className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Browse Gallery
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
