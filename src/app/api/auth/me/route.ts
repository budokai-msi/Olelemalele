// src/app/api/auth/me/route.ts
import connectDB from '@/lib/db'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JwtPayload {
  userId: string
  email: string
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return Response.json({ user: null }, { status: 200 })
    }

    // Verify JWT
    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch {
      // Invalid or expired token
      return Response.json({ user: null }, { status: 200 })
    }

    // Connect to MongoDB and fetch user
    await connectDB()
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return Response.json({ user: null }, { status: 200 })
    }

    return Response.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Auth check error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
