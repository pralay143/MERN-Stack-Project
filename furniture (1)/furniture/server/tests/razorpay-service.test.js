// The Razorpay client, with fetch replaced (tests never call Razorpay).
const crypto = require('crypto')

const SECRET = 'test_key_secret_123'
const WEBHOOK_SECRET = 'test_webhook_secret'

let razorpay
beforeAll(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc'
    process.env.RAZORPAY_KEY_SECRET = SECRET
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
    jest.resetModules()
    razorpay = require('../src/services/razorpay')
})
afterEach(() => jest.restoreAllMocks())

const sign = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')

describe('payment signatures', () => {
    const ids = { razorpayOrderId: 'order_ABC', razorpayPaymentId: 'pay_XYZ' }

    test('a genuine signature is accepted', () => {
        expect(razorpay.verifyPaymentSignature({ ...ids, signature: sign(SECRET, 'order_ABC|pay_XYZ') })).toBe(true)
    })

    test.each([
        ['made with another secret', sign('someone-else', 'order_ABC|pay_XYZ')],
        ['for another payment', sign(SECRET, 'order_ABC|pay_OTHER')],
        ['empty', ''],
        ['missing', undefined],
        ['not hex of the right length', 'abc'],
    ])('a signature %s is rejected', (_, signature) => {
        expect(razorpay.verifyPaymentSignature({ ...ids, signature })).toBe(false)
    })
})

describe('webhook signatures', () => {
    const body = Buffer.from('{"event":"payment.captured"}')

    test('match the raw body with the webhook secret', () => {
        expect(razorpay.verifyWebhookSignature(body, sign(WEBHOOK_SECRET, body))).toBe(true)
        expect(razorpay.verifyWebhookSignature(Buffer.from('{"event":"x"}'), sign(WEBHOOK_SECRET, body))).toBe(false)
        expect(razorpay.verifyWebhookSignature(body, sign(SECRET, body))).toBe(false)
    })
})

describe('API calls', () => {
    test('createOrder posts the amount in paise with basic auth', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ id: 'order_1', amount: 249900, currency: 'INR', status: 'created' }), { status: 200 })
        )
        const order = await razorpay.createOrder({ amount: 249900, receipt: 'EF-260929-ABCDEF', notes: { orderId: 'o1' } })
        expect(order.id).toBe('order_1')

        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('https://api.razorpay.com/v1/orders')
        expect(init.method).toBe('POST')
        expect(init.headers.Authorization).toBe(`Basic ${Buffer.from(`rzp_test_abc:${SECRET}`).toString('base64')}`)
        expect(JSON.parse(init.body)).toEqual({ amount: 249900, currency: 'INR', receipt: 'EF-260929-ABCDEF', notes: { orderId: 'o1' } })
    })

    test('errors from Razorpay become RazorpayError with its description', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ error: { description: 'Authentication failed' } }), { status: 401 })
        )
        await expect(razorpay.createOrder({ amount: 100, receipt: 'r' })).rejects.toThrow(/Authentication failed/)
        await expect(razorpay.createOrder({ amount: 100, receipt: 'r' })).rejects.toBeInstanceOf(razorpay.RazorpayError)
    })

    test('network failures become RazorpayError', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'))
        await expect(razorpay.fetchPayment('pay_1')).rejects.toThrow(/Could not reach Razorpay/)
    })
})
