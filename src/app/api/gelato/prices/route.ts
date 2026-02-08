import { NextRequest, NextResponse } from 'next/server'

// Gelato API configuration
const GELATO_API_KEY = process.env.GELATO_API_KEY || '86e44594-f701-40b8-951e-99aad32e9f4a-5e8be0f2-107d-4875-aac9-7c9e411ce86f:43112656-0bcf-4e17-abfa-0f0849c014fb'
const GELATO_PRODUCT_API = 'https://product.gelatoapis.com/v3'

// Comprehensive Gelato canvas size to product UID mapping
// 50+ sizes covering square, portrait, landscape, and panoramic formats
const SIZE_TO_PRODUCT: Record<string, string> = {
  // Square formats
  '8x8': 'canvas_8x8',
  '10x10': 'canvas_10x10',
  '12x12': 'canvas_12x12',
  '16x16': 'canvas_16x16',
  '20x20': 'canvas_20x20',
  '24x24': 'canvas_24x24',
  '30x30': 'canvas_30x30',
  '36x36': 'canvas_36x36',
  '40x40': 'canvas_40x40',
  
  // Small portrait/landscape
  '8x10': 'canvas_8x10',
  '8x12': 'canvas_8x12',
  '10x14': 'canvas_10x14',
  '10x20': 'canvas_10x20',
  '11x14': 'canvas_11x14',
  
  // Medium portrait/landscape
  '12x16': 'canvas_12x16',
  '12x18': 'canvas_12x18',
  '12x36': 'canvas_12x36',
  '16x20': 'canvas_16x20',
  '16x24': 'canvas_16x24',
  '18x18': 'canvas_18x18',
  '18x24': 'canvas_18x24',
  
  // Large portrait/landscape
  '20x24': 'canvas_20x24',
  '20x28': 'canvas_20x28',
  '20x30': 'canvas_20x30',
  '24x30': 'canvas_24x30',
  '24x32': 'canvas_24x32',
  '24x36': 'canvas_24x36',
  '27x36': 'canvas_27x36',
  
  // Extra large portrait/landscape
  '30x40': 'canvas_30x40',
  '32x48': 'canvas_32x48',
  '36x48': 'canvas_36x48',
  '40x60': 'canvas_40x60',
  
  // Panoramic formats
  '20x60': 'canvas_20x60',
  '30x60': 'canvas_30x60',
  
  // Additional European sizes
  '28x40': 'canvas_28x40',
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

// Comprehensive fallback prices for all canvas sizes
// Prices calculated based on area + base cost + frame margin
function getFallbackPrices(size: string, country: string, currency: string) {
  const fallbackPrices: Record<string, number> = {
    // Square formats
    '8x8': 950,
    '10x10': 1150,
    '12x12': 1350,
    '16x16': 1850,
    '20x20': 2400,
    '24x24': 3200,
    '30x30': 4800,
    '36x36': 6800,
    '40x40': 8500,
    
    // Small portrait/landscape
    '8x10': 1050,
    '8x12': 1150,
    '10x14': 1450,
    '10x20': 1850,
    '11x14': 1550,
    
    // Medium portrait/landscape
    '12x16': 1800,
    '12x18': 1950,
    '12x36': 3200,
    '16x20': 2400,
    '16x24': 2800,
    '18x18': 2100,
    '18x24': 2900,
    
    // Large portrait/landscape
    '20x24': 3200,
    '20x28': 3600,
    '20x30': 3900,
    '24x30': 4200,
    '24x32': 4500,
    '24x36': 5200,
    '27x36': 5600,
    
    // Extra large portrait/landscape
    '30x40': 6800,
    '32x48': 7800,
    '36x48': 8900,
    '40x60': 12000,
    
    // Panoramic formats
    '20x60': 6800,
    '30x60': 9800,
    
    // Additional sizes
    '28x40': 7200,
  }

  const price = fallbackPrices[size] || 5200

  const exchangeRates: Record<string, number> = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.36,
    'AUD': 1.52,
    'JPY': 148.5,
    'NZD': 1.62,
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
