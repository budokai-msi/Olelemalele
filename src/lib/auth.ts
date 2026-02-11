// src/lib/auth.ts
import UserModel from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, role: string = 'user'): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}

// Role hierarchy check
const ROLE_LEVELS: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  curator: 2,
  user: 1,
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_LEVELS[userRole] || 0) >= (ROLE_LEVELS[requiredRole] || 0)
}

// Get user from token string (for API routes)
export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  try {
    const user = await UserModel.findById(decoded.userId)
    return user
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}
