import { NextRequest, NextResponse } from 'next/server'

// Gelato API configuration
const GELATO_API_KEY = process.env.GELATO_API_KEY || '86e44594-f701-40b8-951e-99aad32e9f4a-5e8be0f2-107d-4875-aac9-7c9e411ce86f:43112656-0bcf-4e17-abfa-0f0849c014fb'
const GELATO_PRODUCT_API = 'https://product.gelatoapis.com/v3'

// Size to product UID mapping for Gelato canvas products
// These UIDs need to be replaced with actual Gelato product UIDs from your account
const SIZE_TO_PRODUCT: Record<string, string> = {
  '12x16': 'canvas_12x16',
  '16x20': 'canvas_16x20',
  '20x24': 'canvas_20x24',
  '24x30': 'canvas_24x30',
  '24x36': 'canvas_24x36',
  '30x40': 'canvas_30x40',
  '36x48': 'canvas_36x48',
  '40x60': 'canvas_40x60',
}

interface GelatoPrice {
  productUid: string
  country: string
  quantity: number
  price: number
  currency: string
}

// GET /api/gelato/prices?size=24x36&country=US&currency=USD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size')
    const country = searchParams.get('country') || 'US'
    const currency = searchParams.get('currency') || 'USD'

    if (!size) {
      return NextResponse.json(
        { error: 'Size parameter is required' },
        { status: 400 }
      )
    }

    const productUid = SIZE_TO_PRODUCT[size]
    if (!productUid) {
      return NextResponse.json(
        { error: `Invalid size: ${size}` },
        { status: 400 }
      )
    }

    // Fetch prices from Gelato API
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
      console.warn(`Gelato API error: ${response.status}. Using fallback prices.`)
      return NextResponse.json({
        price: getFallbackPrices(size, country, currency),
        source: 'fallback',
        size,
        country,
        currency
      })
    }

    const prices: GelatoPrice[] = await response.json()
    const retailPrice = prices.find(p => p.quantity === 1) || prices[0]

    return NextResponse.json({
      price: retailPrice,
      allPrices: prices,
      source: 'gelato',
      size,
      country,
      currency
    })

  } catch (error) {
    console.error('Error fetching Gelato prices:', error)
    
    const size = new URL(request.url).searchParams.get('size') || '24x36'
    const country = new URL(request.url).searchParams.get('country') || 'US'
    const currency = new URL(request.url).searchParams.get('currency') || 'USD'
    
    return NextResponse.json({
      price: getFallbackPrices(size, country, currency),
      source: 'fallback',
      error: 'Failed to fetch from Gelato API',
      size,
      country,
      currency
    })
  }
}

// POST /api/gelato/prices/bulk - Get prices for multiple sizes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sizes, country = 'US', currency = 'USD' } = body

    if (!Array.isArray(sizes)) {
      return NextResponse.json(
        { error: 'sizes must be an array' },
        { status: 400 }
      )
    }

    const pricePromises = sizes.map(async (size) => {
      try {
        const productUid = SIZE_TO_PRODUCT[size]
        if (!productUid) {
          return { size, error: 'Invalid size' }
        }

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
          return { 
            size, 
            ...getFallbackPrices(size, country, currency),
            source: 'fallback'
          }
        }

        const prices: GelatoPrice[] = await response.json()
        const retailPrice = prices.find(p => p.quantity === 1) || prices[0]

        return {
          size,
          price: retailPrice.price,
          currency: retailPrice.currency,
          source: 'gelato'
        }
      } catch (error) {
        return { 
          size, 
          ...getFallbackPrices(size, country, currency),
          source: 'fallback'
        }
      }
    })

    const results = await Promise.all(pricePromises)

    return NextResponse.json({
      prices: results,
      country,
      currency
    })

  } catch (error) {
    console.error('Error in bulk price fetch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

// Fallback prices when Gelato API is unavailable
function getFallbackPrices(size: string, country: string, currency: string) {
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

  const price = fallbackPrices[size] || 5200

  const exchangeRates: Record<string, number> = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.36,
    'AUD': 1.52,
  }

  const rate = exchangeRates[currency] || 1
  const convertedPrice = Math.round(price * rate)

  return {
    productUid: `canvas_${size}`,
    country,
    quantity: 1,
    price: convertedPrice,
    currency,
  }
}
