'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Order {
  _id: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  shippingAddress: {
    street: string
    city: string
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=100')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setOrders(orders.map(o =>
          o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o
        ))
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const statusColors = {
    pending: 'bg-gray-500/20 text-gray-400',
    processing: 'bg-gray-400/20 text-gray-300',
    shipped: 'bg-gray-500/20 text-gray-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400'
  }

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
            <span className="text-white">Orders</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Orders</h1>
              <p className="text-gray-400 mt-1">Manage customer orders</p>
            </div>
            <div className="flex gap-3">
              <select
                title="Filter orders by status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/40"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
              <button
                onClick={() => fetchOrders()}
                className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/4 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-white/10 rounded-xl p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">Order #{order._id.slice(-8)}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {order.items.length} items • ${(order.total / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.shippingAddress.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      title="Update order status"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/40"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-mono">
                          ${(item.price * item.quantity / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No orders found</p>
          </div>
        )}
      </div>
    </main>
  )
}
