// Database functions for products - SERVER ONLY
// Do not import this file in client components

import connectDB from './db'
import Product from '@/models/Product'
import { products as staticProducts, Product as IProduct } from '@/lib/data/products'

// Fetch products from database with fallback to static
export async function getProducts(): Promise<IProduct[]> {
  try {
    await connectDB()
    const products = await Product.find({ isActive: true }).lean()
    
    if (products.length === 0) {
      return staticProducts
    }
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      type: p.type,
      image: p.image,
      price: p.price,
      description: p.description,
      variants: p.variants.map((v: { size: string }) => ({ size: v.size })),
      productCollection: p.productCollection,
      tags: p.tags,
      inventory: p.inventory,
      isActive: p.isActive
    }))
  } catch (error) {
    console.error('Error fetching products from DB:', error)
    return staticProducts
  }
}

// Get single product by ID
export async function getProductById(id: string): Promise<IProduct | null> {
  try {
    await connectDB()
    const product = await Product.findOne({ id, isActive: true }).lean()
    
    if (!product) {
      // Fallback to static
      return staticProducts.find(p => p.id === id) || null
    }
    
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      image: product.image,
      price: product.price,
      description: product.description,
      variants: product.variants.map((v: { size: string }) => ({ size: v.size })),
      productCollection: product.productCollection,
      tags: product.tags,
      inventory: product.inventory,
      isActive: product.isActive
    }
  } catch (error) {
    console.error('Error fetching product from DB:', error)
    return staticProducts.find(p => p.id === id) || null
  }
}

// Seed database with static products (for admin use)
export async function seedProducts(): Promise<void> {
  try {
    await connectDB()
    
    for (const product of staticProducts) {
      await Product.findOneAndUpdate(
        { id: product.id },
        {
          ...product,
          slug: product.name.toLowerCase().replace(/\s+/g, '-'),
          inventory: 100,
          lowStockThreshold: 10,
          isActive: true,
          metadata: {
            weight: 400,
            dimensions: product.variants[0]?.size || '24x36',
            materials: ['Cotton canvas', 'Archival ink'],
            care: 'Dust gently with soft cloth'
          },
          seo: {
            title: `${product.name} | Olelemalele`,
            description: product.description,
            keywords: product.tags
          }
        },
        { upsert: true, new: true }
      )
    }
    
    console.log('Products seeded successfully')
  } catch (error) {
    console.error('Error seeding products:', error)
    throw error
  }
}
