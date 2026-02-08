import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const collection = searchParams.get('collection')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build query
    const query: any = { isActive: true }
    
    if (category) {
      query.category = category
    }
    
    if (collection) {
      query.productCollection = collection
    }
    
    if (featured === 'true') {
      query.isFeatured = true
    }
    
    const products = await Product.find(query)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    await connectDB()
    
    const body = await request.json()
    
    // Generate unique ID if not provided
    if (!body.id) {
      const count = await Product.countDocuments()
      body.id = String(count)
    }
    
    // Generate slug
    body.slug = body.name.toLowerCase().replace(/\s+/g, '-')
    
    const product = await Product.create(body)
    
    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this ID or slug already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
