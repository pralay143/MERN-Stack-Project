// Minimal Razorpay client (REST API over fetch) and signature checks.
// Docs: https://razorpay.com/docs/api/orders/ and
// https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/
const crypto = require('crypto')
const config = require('../config/env')

const API = 'https://api.razorpay.com/v1'
const TIMEOUT_MS = 10_000

const isConfigured = () => Boolean(config.razorpayKeyId && config.razorpayKeySecret)

class RazorpayError extends Error {}

async function call(method, path, body) {
    const auth = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64')
    let res
    try {
        res = await fetch(`${API}${path}`, {
            method,
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(TIMEOUT_MS),
        })
    } catch (err) {
        throw new RazorpayError(`Could not reach Razorpay: ${err.message}`)
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new RazorpayError(`Razorpay ${method} ${path} failed (${res.status}): ${data?.error?.description ?? 'no details'}`)
    return data
}

/** Creates a Razorpay order for `amount` paise. Returns { id, amount, currency, status, ... }. */
const createOrder = ({ amount, receipt, notes }) => call('POST', '/orders', { amount, currency: 'INR', receipt, notes })

/** Looks up a payment: { id, order_id, amount, currency, status, method, ... }. */
const fetchPayment = (paymentId) => call('GET', `/payments/${encodeURIComponent(paymentId)}`)

// Constant-time comparison of two hex strings.
function safeEqual(expectedHex, actual) {
    if (typeof actual !== 'string') return false
    const a = Buffer.from(expectedHex, 'utf8')
    const b = Buffer.from(actual, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}

const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')

/**
 * True when Razorpay's checkout signature is genuine: HMAC-SHA256 of
 * "<razorpay order id>|<payment id>" with the key secret.
 */
function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature }) {
    if (!config.razorpayKeySecret) return false
    return safeEqual(hmac(config.razorpayKeySecret, `${razorpayOrderId}|${razorpayPaymentId}`), signature)
}

/** True when a webhook's X-Razorpay-Signature matches its raw body. */
function verifyWebhookSignature(rawBody, signature) {
    if (!config.razorpayWebhookSecret || !rawBody) return false
    return safeEqual(hmac(config.razorpayWebhookSecret, rawBody), signature)
}

module.exports = { isConfigured, createOrder, fetchPayment, verifyPaymentSignature, verifyWebhookSignature, RazorpayError }
