// src/pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/db'
import { products } from '@/lib/products'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' })
  }

  try {
    const product = products.find(p => p.id === id)
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}