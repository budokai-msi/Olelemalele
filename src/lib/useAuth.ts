// src/lib/useAuth.ts
import { useEffect, useState } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'super_admin' | 'curator'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch {
        // User not authenticated
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
      // Using window.location to navigate
      window.location.href = '/dashboard'
    } else {
      const error = await response.json()
      throw new Error(error.error)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
      // Using window.location to navigate
      window.location.href = '/dashboard'
    } else {
      const error = await response.json()
      throw new Error(error.error)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    // Using window.location to navigate
    window.location.href = '/'
  }

  return { user, loading, login, register, logout }
}
