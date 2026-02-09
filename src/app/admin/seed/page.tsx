'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleSeed = async () => {
    setSeeding(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      
      setResult({
        success: res.ok,
        message: data.message || (res.ok ? 'Products seeded successfully!' : 'Failed to seed products')
      })
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while seeding products'
      })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-white">Seed Database</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Seed Database</h1>
          <p className="text-gray-400 mt-1">Import static products to MongoDB</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4">What this does:</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-white/70">•</span>
              Creates Product documents in MongoDB from static data
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/70">•</span>
              Generates unique IDs and slugs for each product
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/70">•</span>
              Sets default inventory (100 units per product)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/70">•</span>
              Adds SEO metadata and product specifications
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/70">•</span>
              Skips existing products (no duplicates)
            </li>
          </ul>
        </motion.div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
        >
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-wider hover:bg-white hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {seeding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Seeding...
              </span>
            ) : (
              'Seed Products'
            )}
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl ${
                result.success 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <p className="font-medium">{result.message}</p>
              {result.success && (
                <Link
                  href="/admin/products"
                  className="text-sm underline mt-2 inline-block"
                >
                  View products →
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Admin Dashboard
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
