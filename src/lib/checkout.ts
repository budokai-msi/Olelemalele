// src/lib/checkout.ts
// Checkout.com API Integration

interface PaymentData {
  source: {
    type: 'card';
    number: string;
    expiry_month: number;
    expiry_year: number;
    cvv: string;
  };
  amount: number;
  currency: string;
  reference: string;
}

interface PaymentResponse {
  id: string;
  reference: string;
  status: string;
  response_code: string;
  response_summary: string;
}

const CHECKOUT_API_KEY = process.env.CHECKOUT_API_KEY || '';
const CHECKOUT_ACCOUNT_ID = process.env.CHECKOUT_ACCOUNT_ID || '240';
const CHECKOUT_BASE_URL = 'https://api.sandbox.checkout.com'; // Using sandbox for testing


// Client-side function to create payment
export async function createPaymentClient(paymentData: PaymentData, origin: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${CHECKOUT_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHECKOUT_API_KEY}`,
        'Accept': 'application/json',
        'X-Checkout-Account-Src': CHECKOUT_ACCOUNT_ID
      },
      body: JSON.stringify({
        source: paymentData.source,
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference: paymentData.reference,
        success_url: `${origin}/checkout/success`,
        failure_url: `${origin}/checkout?error=payment_failed`
      })
    });

    if (!response.ok) {
      throw new Error(`Payment request failed: ${response.statusText}`);
    }

    const result: PaymentResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
}

// Server-side function to create payment (for API routes)
export async function createPaymentServer(paymentData: PaymentData, origin: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${CHECKOUT_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHECKOUT_API_KEY}`,
        'Accept': 'application/json',
        'X-Checkout-Account-Src': CHECKOUT_ACCOUNT_ID
      },
      body: JSON.stringify({
        source: paymentData.source,
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference: paymentData.reference,
        success_url: `${origin}/checkout/success`,
        failure_url: `${origin}/checkout?error=payment_failed`
      })
    });

    if (!response.ok) {
      throw new Error(`Payment request failed: ${response.statusText}`);
    }

    const result: PaymentResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
}

export async function verifyPayment(paymentId: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${CHECKOUT_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHECKOUT_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    const result: PaymentResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}
