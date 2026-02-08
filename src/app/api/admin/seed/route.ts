import { NextResponse } from 'next/server'
import { seedProducts } from '@/lib/products'

// POST /api/admin/seed - Seed database with static products
export async function POST() {
  try {
    await seedProducts()
    return NextResponse.json({ message: 'Products seeded successfully' })
  } catch (error: any) {
    console.error('Error seeding products:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to seed products' },
      { status: 500 }
    )
  }
}
