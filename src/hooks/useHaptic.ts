import { useCallback } from 'react'

export function useHaptic() {
  return useCallback((intensity: number = 50) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(intensity)
    }
  }, [])
}
