// src/lib/printify.ts
const PRINTIFY_API_URL = 'https://api.printify.com/v1'
const API_KEY = process.env.PRINTIFY_API_KEY

export async function fetchProducts() {
  if (!API_KEY) return []

  const response = await fetch(`${PRINTIFY_API_URL}/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  })

  if (!response.ok) return []

  const data = await response.json()
  return data.data || []
}

export async function createOrder(orderData: any) {
  // Placeholder for creating order
  return { success: true }
}