// src/pages/api/cart/index.ts
import { getUserFromToken } from '@/lib/auth'
import connectDB from '@/lib/db'
import type { NextApiRequest, NextApiResponse } from 'next'

function getToken(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/token=([^;]+)/)
  return match ? match[1] : null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  try {
    const token = getToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      res.status(200).json({ cart: user.cart })
    }

    if (req.method === 'POST') {
      const { productId, quantity = 1, variant } = req.body

      if (!productId || !variant) {
        return res.status(400).json({ error: 'Product ID and variant are required' })
      }

      const existingItem = user.cart.find(item => item.productId === productId && item.variant === variant)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        user.cart.push({ productId, quantity, variant })
      }

      await user.save()
      res.status(200).json({ cart: user.cart })
    }

    if (req.method === 'DELETE') {
      const { productId, variant } = req.body
      user.cart = user.cart.filter(item => !(item.productId === productId && item.variant === variant))

      await user.save()
      res.status(200).json({ cart: user.cart })
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}
