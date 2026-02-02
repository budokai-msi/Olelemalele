import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Clear both possible tokens (legacy and new)
    cookieStore.delete('token')
    cookieStore.delete('session_token')

    return NextResponse.json({
      message: 'Logged out successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
