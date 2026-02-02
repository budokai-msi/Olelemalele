// src/app/dashboard/page.tsx
'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">Access Denied</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-400">Manage your orders and profile</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              <div className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <span>Order #1234</span>
                  <span className="text-green-400">Delivered</span>
                </div>
                <p className="text-sm text-gray-400">2 items - $125.00</p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <span>Order #1233</span>
                  <span className="text-blue-400">Processing</span>
                </div>
                <p className="text-sm text-gray-400">1 item - $75.00</p>
              </div>
            </div>
            <Link
              href="/orders"
              className="text-white hover:text-gray-300 mt-4 inline-block"
            >
              View All Orders →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 p-6 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Account Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400">Name</label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400">Member Since</label>
                <p className="text-lg">January 2026</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="bg-white text-black px-4 py-2 rounded-full mt-4 hover:bg-gray-200 transition"
            >
              Edit Profile
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  )
}