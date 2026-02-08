import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'

// POST /api/checkout - Process payment and create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      paymentMethod,
      items,
      shippingAddress,
      customerEmail,
      total 
    } = body

    await connectDB()
    
    const order = await Order.create({
      userId: null,
      items: items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant
      })),
      total,
      status: 'pending',
      shippingAddress: {
        street: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || 'N/A',
        zip: shippingAddress.zip,
        country: shippingAddress.country || 'US'
      },
      paymentMethod,
      paymentStatus: 'pending'
    })
    
    return NextResponse.json({ 
      success: true, 
      orderId: order._id,
      message: 'Order created successfully'
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
