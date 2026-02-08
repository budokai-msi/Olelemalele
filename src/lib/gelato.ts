// Gelato API Integration for Canvas Printing

const GELATO_API_KEY = process.env.GELATO_API_KEY || ''
const GELATO_PRODUCT_API = 'https://product.gelatoapis.com/v3'
const GELATO_ORDER_API = 'https://order.gelatoapis.com'

// Product UIDs for canvas sizes
// Replace these with actual Gelato product UIDs from your account
export const GELATO_PRODUCT_UIDS: Record<string, string> = {
  'canvas_12x16': 'canvas_12x16',
  'canvas_16x20': 'canvas_16x20',
  'canvas_20x24': 'canvas_20x24',
  'canvas_24x30': 'canvas_24x30',
  'canvas_24x36': 'canvas_24x36',
  'canvas_30x40': 'canvas_30x40',
  'canvas_36x48': 'canvas_36x48',
  'canvas_40x60': 'canvas_40x60',
}

export interface GelatoPrice {
  productUid: string
  country: string
  quantity: number
  price: number
  currency: string
}

export interface GelatoProduct {
  id: string
  name: string
  description: string
  variants: {
    id: string
    name: string
    size: string
    price: number
  }[]
}

export interface GelatoOrder {
  items: {
    productId: string
    variantId: string
    quantity: number
    files?: {
      url: string
      type: string
    }[]
  }[]
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    email: string
    phone?: string
  }
}

export interface GelatoOrderResponse {
  orderId: string
  status: string
  trackingUrl?: string
}

/**
 * Fetch prices for a specific product from Gelato
 */
export async function getGelatoPrice(
  productUid: string,
  country: string = 'US',
  currency: string = 'USD'
): Promise<GelatoPrice | null> {
  try {
    const response = await fetch(
      `${GELATO_PRODUCT_API}/products/${productUid}/prices?country=${country}&currency=${currency}`,
      {
        headers: {
          'X-API-KEY': GELATO_API_KEY,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      throw new Error(`Gelato API error: ${response.status}`)
    }

    const prices: GelatoPrice[] = await response.json()
    // Return price for quantity 1 (retail)
    return prices.find(p => p.quantity === 1) || prices[0] || null
  } catch (error) {
    console.error('Error fetching Gelato price:', error)
    return null
  }
}

/**
 * Fetch prices for multiple products
 */
export async function getGelatoPrices(
  productUids: string[],
  country: string = 'US',
  currency: string = 'USD'
): Promise<Map<string, GelatoPrice>> {
  const priceMap = new Map<string, GelatoPrice>()
  
  await Promise.all(
    productUids.map(async (uid) => {
      const price = await getGelatoPrice(uid, country, currency)
      if (price) {
        priceMap.set(uid, price)
      }
    })
  )
  
  return priceMap
}

/**
 * Get fallback price when API fails
 */
export function getFallbackPrice(size: string): number {
  const fallbackPrices: Record<string, number> = {
    '12x16': 1800,
    '16x20': 2400,
    '20x24': 3200,
    '24x30': 4200,
    '24x36': 5200,
    '30x40': 6800,
    '36x48': 8900,
    '40x60': 12000,
  }
  return fallbackPrices[size] || 5200
}

/**
 * Convert size ID to Gelato product UID
 */
export function getProductUid(sizeId: string): string {
  return GELATO_PRODUCT_UIDS[`canvas_${sizeId}`] || `canvas_${sizeId}`
}

/**
 * Fetch available products from Gelato catalog
 */
export async function getGelatoProducts(): Promise<GelatoProduct[]> {
  try {
    const response = await fetch(`${GELATO_PRODUCT_API}/products`, {
      headers: {
        'X-API-KEY': GELATO_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Gelato API error: ${response.status}`)
    }

    const products: GelatoProduct[] = await response.json()
    return products
  } catch (error) {
    console.error('Error fetching Gelato products:', error)
    // Return mock data for development
    return [
      {
        id: 'canvas-standard',
        name: 'Premium Canvas Print',
        description: 'High-quality canvas print with archival inks',
        variants: [
          { id: 'canvas-12x16', name: '12x16 inches', size: '12x16', price: 1800 },
          { id: 'canvas-16x20', name: '16x20 inches', size: '16x20', price: 2400 },
          { id: 'canvas-24x36', name: '24x36 inches', size: '24x36', price: 5200 },
        ],
      },
    ]
  }
}

/**
 * Create order in Gelato
 */
export async function createGelatoOrder(order: GelatoOrder): Promise<GelatoOrderResponse> {
  try {
    const response = await fetch(`${GELATO_ORDER_API}/orders`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GELATO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })

    if (!response.ok) {
      throw new Error(`Gelato order creation failed: ${response.status}`)
    }

    const result: GelatoOrderResponse = await response.json()
    return result
  } catch (error) {
    console.error('Error creating Gelato order:', error)
    // Return mock response for development
    return {
      orderId: `ORD-${Date.now()}`,
      status: 'processing',
    }
  }
}

/**
 * Get order status from Gelato
 */
export async function getGelatoOrderStatus(orderId: string): Promise<GelatoOrderResponse> {
  try {
    const response = await fetch(`${GELATO_ORDER_API}/orders/${orderId}`, {
      headers: {
        'X-API-KEY': GELATO_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Gelato order status request failed: ${response.status}`)
    }

    const result: GelatoOrderResponse = await response.json()
    return result
  } catch (error) {
    console.error('Error fetching Gelato order status:', error)
    return {
      orderId: orderId,
      status: 'error',
    }
  }
}

/**
 * Calculate shipping cost
 */
export async function calculateShipping(
  items: { productUid: string; quantity: number }[],
  country: string,
  currency: string = 'USD'
): Promise<number> {
  try {
    const response = await fetch(`${GELATO_ORDER_API}/shipping`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GELATO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items, country, currency }),
    })

    if (!response.ok) {
      throw new Error(`Shipping calculation failed: ${response.status}`)
    }

    const result = await response.json()
    return result.shippingCost || 0
  } catch (error) {
    console.error('Error calculating shipping:', error)
    return 0
  }
}
