import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Role hierarchy: super_admin > admin > curator > user
const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  curator: 2,
  user: 1,
}

type RouteConfig = {
  path: string
  minRole: string
}

const PROTECTED_ROUTES: RouteConfig[] = [
  { path: '/admin', minRole: 'admin' },
  { path: '/curator', minRole: 'curator' },
  { path: '/dashboard', minRole: 'user' },
]

const API_PROTECTED_ROUTES: RouteConfig[] = [
  { path: '/api/admin', minRole: 'admin' },
  { path: '/api/curator', minRole: 'curator' },
  { path: '/api/notes', minRole: 'curator' },
]

function hasAccess(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0)
}

export async function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()')

  const pathname = request.nextUrl.pathname

  // Check page routes
  const pageRoute = PROTECTED_ROUTES.find(r => pathname.startsWith(r.path))
  // Check API routes
  const apiRoute = API_PROTECTED_ROUTES.find(r => pathname.startsWith(r.path))

  const protectedRoute = pageRoute || apiRoute

  if (!protectedRoute) return response

  // Get token from cookie
  const token = request.cookies.get('token')?.value

  if (!token) {
    if (apiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = (payload.role as string) || 'user'

    if (!hasAccess(userRole, protectedRoute.minRole)) {
      if (apiRoute) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Add role header for downstream use
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-id', (payload.userId as string) || '')

    return response
  } catch {
    // Invalid token
    if (apiRoute) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/curator/:path*',
    '/api/admin/:path*',
    '/api/curator/:path*',
    '/api/notes/:path*',
    '/api/orders/:path*',
  ]
}
