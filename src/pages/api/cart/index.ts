// src/pages/api/cart/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  try {
    if (req.method === 'GET') {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      res.status(200).json({ cart: user.cart })
    }

    if (req.method === 'POST') {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

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
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { productId, variant } = req.body
      user.cart = user.cart.filter(item => !(item.productId === productId && item.variant === variant))
      
      await user.save()
      res.status(200).json({ cart: user.cart })
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}