// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserById, getUserByEmail, saveUser } from './storage'
import { User } from '@/types'
import UserModal from '@/models/User' // Import the Mongoose User model
import { Types } from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function getUserFromToken(req: NextApiRequest): Promise<InstanceType<typeof UserModal> | null> {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')

  if (!token) return null

  const decoded: any = verifyToken(token)
  if (!decoded) return null

  // Find the user using Mongoose model instead of simple storage
  try {
    const user = await UserModal.findById(decoded.userId)
    return user
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

// Authentication middleware
export async function authenticate(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const user = await getUserFromToken(req)

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  req.user = user
  next()
}