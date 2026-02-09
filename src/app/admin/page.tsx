'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch('/api/products?limit=1'),
          fetch('/api/orders?limit=1'),
          fetch('/api/auth/me')
        ])

        const products = await productsRes.json()
        const orders = await ordersRes.json()
        
        setStats({
          totalProducts: products.products?.length || 18,
          totalOrders: orders.orders?.length || 0,
          totalUsers: 0,
          revenue: 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const adminLinks = [
    {
      title: 'Products',
      description: 'Manage your canvas collection',
      href: '/admin/products',
      icon: '🎨',
      count: stats.totalProducts
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      href: '/admin/orders',
      icon: '📦',
      count: stats.totalOrders
    },
    {
      title: 'Seed Database',
      description: 'Import static products to database',
      href: '/admin/seed',
      icon: '🌱',
      count: null
    }
  ]

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Admin</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage your store and view analytics</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatCard
            title="Products"
            value={stats.totalProducts}
            loading={loading}
            icon="🎨"
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            loading={loading}
            icon="📦"
          />
          <StatCard
            title="Users"
            value={stats.totalUsers}
            loading={loading}
            icon="👥"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            loading={loading}
            icon="💰"
          />
        </motion.div>

        {/* Admin Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {adminLinks.map((link, index) => (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{link.icon}</span>
                  {link.count !== null && (
                    <span className="bg-white text-white text-sm px-3 py-1 rounded-full">
                      {link.count}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-white/70 transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-400 text-sm">{link.description}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-zinc-900 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/gallery"
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white hover:text-white transition-colors"
            >
              View Store
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-white/20 rounded-full font-medium hover:bg-white/5 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function StatCard({ title, value, loading, icon }: { 
  title: string
  value: number | string
  loading: boolean
  icon: string 
}) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <span>{icon}</span>
        <span className="text-sm">{title}</span>
      </div>
      {loading ? (
        <div className="h-8 bg-white/10 rounded animate-pulse" />
      ) : (
        <p className="text-2xl md:text-3xl font-bold">{value}</p>
      )}
    </div>
  )
}
