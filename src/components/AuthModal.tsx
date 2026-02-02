'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-white text-black p-4 rounded-full cursor-pointer shadow-lg z-50"
      >
        Sign In
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setIsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black p-8 rounded-lg max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {isLogin ? (
            <>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg"
              />
              <button className="w-full bg-black text-white p-3 rounded-lg">
                Sign In
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg"
              />
              <button className="w-full bg-black text-white p-3 rounded-lg">
                Sign Up
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-700"
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}