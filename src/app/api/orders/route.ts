import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'

// GET /api/orders - List orders (admin or user-specific)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const query: any = {}
    if (userId) {
      query.userId = userId
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const order = await Order.create({
      ...body,
      status: 'pending'
    })
    
    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
