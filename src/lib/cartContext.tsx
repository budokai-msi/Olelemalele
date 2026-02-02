'use client'

import { useAuth } from '@/lib/useAuth'
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variant: string
  image: string
}

interface CartState {
  items: CartItem[]
  total: number
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; variant: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; variant: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.items.find(item => item.id === action.payload.id && item.variant === action.payload.variant)
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.variant === action.payload.variant
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: state.total + action.payload.price * action.payload.quantity,
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price * action.payload.quantity,
      }
    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload.id && item.variant === action.payload.variant)
      return {
        ...state,
        items: state.items.filter(item => !(item.id === action.payload.id && item.variant === action.payload.variant)),
        total: state.total - (itemToRemove ? itemToRemove.price * itemToRemove.quantity : 0),
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && item.variant === action.payload.variant
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.items.reduce((sum, item) => {
          if (item.id === action.payload.id && item.variant === action.payload.variant) {
            return sum + item.price * action.payload.quantity
          }
          return sum + item.price * item.quantity
        }, 0),
      }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 }
    case 'SET_CART':
      return {
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0),
        isOpen: state.isOpen
      }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  syncWithServer: () => Promise<void>
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, isOpen: false })
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      syncCartWithServer()
    } else {
      dispatch({ type: 'SET_CART', payload: [] })
    }
  }, [user])

  const syncCartWithServer = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        // Convert server cart to client format with product details
        const serverItems = await Promise.all(
          data.cart.map(async (item: any) => {
            const productResponse = await fetch(`/api/products/${item.productId}`)
            const product = await productResponse.json()
            return {
              id: item.productId,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              variant: item.variant
            }
          })
        )
        dispatch({ type: 'SET_CART', payload: serverItems })
      }
    } catch (error) {
      console.error('Failed to sync cart:', error)
    }
  }

  return (
    <CartContext.Provider value={{ state, dispatch, syncWithServer: syncCartWithServer }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
