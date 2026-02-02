'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { useCart } from '@/lib/cartContext'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Step = 'info' | 'shipping' | 'payment'

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const triggerHaptic = useHaptic()
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
  })

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })

  const total = state.total
  const shipping = step === 'info' ? 0 : 2500 // $25 flat rate
  const grandTotal = total + shipping

  const handleNext = async () => {
    triggerHaptic()
    if (step === 'info') {
      setStep('shipping')
    } else if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      // Process payment with Checkout.com
      try {
        // Get card details from form
        const form = document.querySelector('form') || document
        const cardNumberInput = form.querySelector('[name="cardNumber"]') as HTMLInputElement
        const cardNameInput = form.querySelector('[name="cardName"]') as HTMLInputElement
        const expiryMonthInput = form.querySelector('[name="expiryMonth"]') as HTMLInputElement
        const expiryYearInput = form.querySelector('[name="expiryYear"]') as HTMLInputElement
        const cvvInput = form.querySelector('[name="cvv"]') as HTMLInputElement

        const cardDetails = {
          number: cardNumberInput?.value || '',
          expiry_month: parseInt(expiryMonthInput?.value || '0'),
          expiry_year: parseInt(expiryYearInput?.value || '0'),
          cvv: cvvInput?.value || ''
        }

        // Validate card details
        if (!cardDetails.number || !cardDetails.expiry_month || !cardDetails.expiry_year || !cardDetails.cvv) {
          alert('Please fill in all card details')
          return
        }

        // Prepare payment data
        const paymentData = {
          source: {
            type: 'card' as const,
            ...cardDetails
          },
          amount: grandTotal, // Amount in cents
          currency: 'USD',
          reference: `order_${Date.now()}`
        }

        // Process payment with Checkout.com
        const origin = window.location.origin
        const { createPaymentClient } = await import('@/lib/checkout')
        const paymentResult = await createPaymentClient(paymentData, origin)

        if (paymentResult.status === 'Authorized') {
          // Payment successful, now create Gelato order
          try {
            const { createGelatoOrder } = await import('@/lib/gelato')

            // Prepare Gelato order data
            const gelatoOrder = {
              items: state.items.map(item => ({
                productId: item.id,
                variantId: item.variant.toLowerCase().replace(/\s+/g, ''),
                quantity: item.quantity
              })),
              shippingAddress: {
                firstName: formData.firstName || 'Customer',
                lastName: formData.lastName || 'Name',
                company: '',
                addressLine1: formData.address || 'N/A',
                addressLine2: '',
                city: formData.city || 'N/A',
                state: 'N/A',
                postalCode: formData.zip || 'N/A',
                country: 'US',
                email: formData.email || 'customer@example.com',
                phone: 'N/A'
              }
            }

            // Create order in Gelato system
            const gelatoOrderResult = await createGelatoOrder(gelatoOrder)

            console.log('Gelato order created:', gelatoOrderResult)

            // Clear cart and redirect to success
            dispatch({ type: 'CLEAR_CART' })
            router.push('/checkout/success')
          } catch (gelatoError) {
            console.error('Gelato order creation error:', gelatoError)
            alert('Your payment was successful, but there was an issue processing your order. Please contact support.')
          }
        } else {
          // Payment failed
          alert(`Payment failed: ${paymentResult.response_summary}`)
        }
      } catch (error) {
        console.error('Payment processing error:', error)
        alert('An error occurred while processing your payment. Please try again.')
      }
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    triggerHaptic()
    if (step === 'shipping') setStep('info')
    else if (step === 'payment') setStep('shipping')
  }

  if (state.items.length === 0 && step === 'info') {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-black tracking-tighter mb-6">YOUR BAG IS EMPTY</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Your bag is currently empty. Start exploring our collection to find something you love.</p>
        <Link href="/gallery" className="px-12 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform">
          Browse Collection
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24">

        {/* Left Side: Checkout Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          {/* Progress Header */}
          <div className="flex items-center gap-4 mb-12 text-[10px] uppercase tracking-[0.3em] font-bold">
            <span className={step === 'info' ? 'text-white' : 'text-gray-600'}>Info</span>
            <span className="text-gray-800">/</span>
            <span className={step === 'shipping' ? 'text-white' : 'text-gray-600'}>Shipping</span>
            <span className="text-gray-800">/</span>
            <span className={step === 'payment' ? 'text-white' : 'text-gray-600'}>Payment</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: 'circOut' }}
            >
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-12 uppercase">
                {step === 'info' && "Your Information"}
                {step === 'shipping' && "Shipping Options"}
                {step === 'payment' && "Secure Payment"}
              </h1>

              {step === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Email Address" placeholder="alex@example.com" type="email" />
                    <InputField label="Phone Number" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <InputField label="First Name" placeholder="Alex" />
                    <InputField label="Last Name" placeholder="Vance" />
                  </div>
                  <InputField label="Shipping Address" placeholder="123 Gallery Lane" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="City" placeholder="Modern City" />
                    <InputField label="Region" placeholder="CA" />
                    <InputField label="Postal Code" placeholder="90001" />
                  </div>
                </div>
              )}

              {step === 'shipping' && (
                <div className="space-y-4">
                  <ShippingOption
                    active={true}
                    title="Standard Delivery"
                    desc="Insured & Tracked. 5-10 business days."
                    price="Free"
                  />
                  <ShippingOption
                    active={false}
                    title="Express Priority Shipping"
                    desc="Next day printing & priority courier."
                    price="$25.00"
                  />
                </div>
              )}

              {step === 'payment' && (
                <form className="space-y-8">
                  <div className="glass p-8 rounded-2xl border border-white/10">
                    <p className="text-gray-400 text-sm mb-6">Payment encryption active. Secured by Checkout.com.</p>

                    {/* Card input fields */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Card Number" placeholder="1234 5678 9012 3456" type="text" name="cardNumber" />
                        <InputField label="Name on Card" placeholder="John Doe" type="text" name="cardName" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InputField label="Expiry Month" placeholder="MM" type="text" name="expiryMonth" />
                        <InputField label="Expiry Year" placeholder="YY" type="text" name="expiryYear" />
                        <InputField label="CVV" placeholder="123" type="text" name="cvv" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest">
                    By confirming, you agree to the Olelemalele Terms of Service.
                  </p>
                </form>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col md:flex-row gap-4 mt-16 pt-8 border-t border-white/5">
                <button
                  onClick={handleNext}
                  className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {step === 'payment' ? 'Complete Purchase' : 'Continue'}
                </button>
                {step !== 'info' && (
                  <button
                    onClick={handleBack}
                    className="px-12 py-5 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                  >
                    Back to {step === 'shipping' ? 'Information' : 'Shipping'}
                  </button>
                )}
                <Link href="/gallery" className="md:ml-auto self-center text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-32 glass p-8 lg:p-10 rounded-[2rem] border border-white/10">
            <h2 className="text-2xl font-black tracking-tighter mb-8 uppercase">ORDER SUMMARY</h2>

            <div className="space-y-6 max-h-[40vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0">
                    {/* In a real app we'd have the product image here */}
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-black/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate uppercase">{item.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{item.variant}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
                      <span className="text-sm font-mono">${(item.price / 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5 font-sans">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono">${(total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-mono text-indigo-400">{shipping === 0 ? 'FREE' : `$${(shipping / 100).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-4 border-t border-white/10">
                <span className="tracking-tighter">TOTAL</span>
                <span className="font-mono">${(grandTotal / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Micro-Copy */}
            <div className="mt-8 flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function InputField({ label, placeholder, type = 'text', name }: { label: string; placeholder: string; type?: string; name?: string }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // This would update the parent state if needed
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-gray-700"
      />
    </div>
  )
}

function ShippingOption({ active, title, desc, price }: { active: boolean; title: string, desc: string, price: string }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all cursor-pointer ${active ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/20'}`}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-sm uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{desc}</p>
        </div>
        <span className={`font-mono text-sm ${price === 'Free' ? 'text-indigo-400 font-bold' : ''}`}>{price}</span>
      </div>
    </div>
  )
}
