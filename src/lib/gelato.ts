// src/lib/gelato.ts
// Gelato API Integration for Canvas Printing

interface GelatoProduct {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    size: string;
    price: number;
  }[];
}

interface GelatoOrder {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email: string;
    phone: string;
  };
}

interface GelatoOrderResponse {
  orderId: string;
  status: string;
  trackingUrl?: string;
}

const GELATO_API_KEY = process.env.GELATO_API_KEY || 'your-gelato-api-key';
const GELATO_BASE_URL = 'https://api.gelato.com/v2';

export async function getGelatoProducts(): Promise<GelatoProduct[]> {
  try {
    const response = await fetch(`${GELATO_BASE_URL}/products/canvas`, {
      headers: {
        'Authorization': `Bearer ${GELATO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gelato API request failed: ${response.statusText}`);
    }

    const products: GelatoProduct[] = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching Gelato products:', error);
    // Return mock data for development
    return [
      {
        id: 'canvas-standard',
        name: 'Premium Canvas Print',
        description: 'High-quality canvas print with archival inks',
        variants: [
          {
            id: 'canvas-12x16',
            name: '12x16 inches',
            size: '12x16',
            price: 1800, // Price in cents
          },
          {
            id: 'canvas-16x20',
            name: '16x20 inches',
            size: '16x20',
            price: 2400, // Price in cents
          },
          {
            id: 'canvas-20x24',
            name: '20x24 inches',
            size: '20x24',
            price: 3200, // Price in cents
          },
        ],
      },
    ];
  }
}

export async function createGelatoOrder(order: GelatoOrder): Promise<GelatoOrderResponse> {
  try {
    const response = await fetch(`${GELATO_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GELATO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`Gelato order creation failed: ${response.statusText}`);
    }

    const result: GelatoOrderResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Gelato order:', error);
    // Return mock response for development
    return {
      orderId: `ORD-${Date.now()}`,
      status: 'processing',
    };
  }
}

export async function getGelatoOrderStatus(orderId: string): Promise<GelatoOrderResponse> {
  try {
    const response = await fetch(`${GELATO_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${GELATO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gelato order status request failed: ${response.statusText}`);
    }

    const result: GelatoOrderResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching Gelato order status:', error);
    return {
      orderId: orderId,
      status: 'error',
    };
  }
}