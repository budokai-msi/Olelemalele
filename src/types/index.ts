// src/types/index.ts
import { NextApiRequest } from 'next'

declare module 'next' {
  interface NextApiRequest {
    user?: any
  }
}

export interface User {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variant: string
}

export interface CartState {
  items: CartItem[]
  total: number
}

export interface CartAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'UPDATE_QUANTITY'
  payload: any
}