// Loads Razorpay Checkout (checkout.razorpay.com) and opens its payment
// window. Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

import type { PaymentOptions, RazorpayResult } from '@/features/orders/types'

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

interface RazorpayInstance {
  open(): void
  on(event: 'payment.failed', handler: (response: { error: { description?: string } }) => void): void
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

let loading: Promise<void> | null = null

/** Adds Razorpay's script once; later calls reuse the same promise. */
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error('The payment window couldn’t load. Check your connection and try again.'))
    }
    document.body.appendChild(script)
  })
  return loading
}

/** The customer closed the payment window without paying. */
export class PaymentDismissedError extends Error {
  constructor() {
    super('Payment was not completed')
  }
}

/**
 * Opens Razorpay's payment window. Resolves with Razorpay's response when the
 * customer pays; rejects with PaymentDismissedError if they close it.
 * (Failed attempts stay inside the window so the customer can retry there.)
 */
export async function openRazorpayCheckout(payment: PaymentOptions): Promise<RazorpayResult> {
  await loadRazorpay()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new Error('The payment window couldn’t load. Please try again.')

  return new Promise<RazorpayResult>((resolve, reject) => {
    const checkout = new Razorpay({
      key: payment.keyId,
      order_id: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      name: payment.name,
      description: payment.description,
      prefill: payment.prefill,
      // The walnut brand colour (Razorpay needs a literal colour value).
      theme: { color: '#6b4a33' },
      handler: (result: RazorpayResult) => resolve(result),
      modal: { ondismiss: () => reject(new PaymentDismissedError()), confirm_close: true },
    })
    checkout.open()
  })
}
