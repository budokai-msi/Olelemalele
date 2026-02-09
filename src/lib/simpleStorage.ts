// src/lib/simpleStorage.ts
// Simple in-memory session management for development

export interface User {
  id: string
  name: string
  email: string
  password: string  // Added password field
  createdAt?: string
}

export interface CartItem {
  productId: string
  quantity: number
  variant: string
}

// In-memory storage for development
// Note: This will reset on server restart in development
// For production, you'd use a persistent database
const users = new Map<string, User>() // Keyed by email
const sessions = new Map<string, { userId: string; expires: number }>()

// Initialize with a default user for testing
// No default test users in any environment

export async function saveUser(userData: User) {
  users.set(userData.email, userData)
  return userData
}

export async function getUserByEmail(email: string) {
  return users.get(email) || null
}

export async function getUserById(id: string) {
  const userValues = Array.from(users.values());
  for (const user of userValues) {
    if (user.id === id) {
      return user
    }
  }
  return null
}

export function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function verifyToken(token: string) {
  const session = sessions.get(token)
  if (!session || session.expires < Date.now()) {
    return null
  }
  return { userId: session.userId }
}

export function createSession(userId: string, token: string) {
  sessions.set(token, {
    userId,
    expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })
}

export function deleteSession(token: string) {
  sessions.delete(token)
}