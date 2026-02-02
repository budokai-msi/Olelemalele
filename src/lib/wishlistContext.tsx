'use client'

import { createContext, useContext, useEffect, useReducer } from 'react'

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  addedAt: number
}

interface WishlistState {
  items: WishlistItem[]
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: WishlistItem[] }

const WishlistContext = createContext<{
  state: WishlistState
  dispatch: React.Dispatch<WishlistAction>
  isInWishlist: (id: string) => boolean
  toggleWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void
} | null>(null)

const STORAGE_KEY = 'olelemalele_wishlist'

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.items.find(item => item.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, addedAt: Date.now() }],
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      }
    }
    case 'CLEAR': {
      return { items: [] }
    }
    case 'HYDRATE': {
      return { items: action.payload }
    }
    default:
      return state
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] })

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored)
        dispatch({ type: 'HYDRATE', payload: items })
      }
    } catch (e) {
      console.error('Failed to hydrate wishlist:', e)
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch (e) {
      console.error('Failed to persist wishlist:', e)
    }
  }, [state.items])

  const isInWishlist = (id: string) => state.items.some(item => item.id === id)

  const toggleWishlist = (item: Omit<WishlistItem, 'addedAt'>) => {
    if (isInWishlist(item.id)) {
      dispatch({ type: 'REMOVE_ITEM', payload: item.id })
    } else {
      dispatch({ type: 'ADD_ITEM', payload: item })
    }
  }

  return (
    <WishlistContext.Provider value={{ state, dispatch, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
