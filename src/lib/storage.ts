// src/lib/storage.ts
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // Directory already exists
  }
}

// File-based storage for users
export async function saveUser(userData: any) {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, `users`, `${userData.id}.json`)
  await fs.writeFile(filePath, JSON.stringify(userData, null, 2))
}

export async function getUserById(id: string) {
  await ensureDataDir()
  try {
    const filePath = path.join(DATA_DIR, `users`, `${id}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function getUserByEmail(email: string) {
  await ensureDataDir()
  try {
    const files = await fs.readdir(path.join(DATA_DIR, 'users'))
    for (const file of files) {
      const filePath = path.join(DATA_DIR, 'users', file)
      const data = await fs.readFile(filePath, 'utf-8')
      const user = JSON.parse(data)
      if (user.email === email) {
        return user
      }
    }
    return null
  } catch {
    return null
  }
}

// File-based storage for orders
export async function saveOrder(orderData: any) {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, 'orders', `${orderData.id}.json`)
  await fs.writeFile(filePath, JSON.stringify(orderData, null, 2))
}

export async function getOrdersByUserId(userId: string) {
  await ensureDataDir()
  try {
    const files = await fs.readdir(path.join(DATA_DIR, 'orders'))
    const orders = []
    
    for (const file of files) {
      const filePath = path.join(DATA_DIR, 'orders', file)
      const data = await fs.readFile(filePath, 'utf-8')
      const order = JSON.parse(data)
      if (order.userId === userId) {
        orders.push(order)
      }
    }
    
    return orders
  } catch {
    return []
  }
}