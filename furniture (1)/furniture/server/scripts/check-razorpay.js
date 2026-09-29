// Checks the Razorpay keys in server/.env without printing the secret.
// Run from the server folder:  npm run check:razorpay
require('dotenv').config({ quiet: true })

const id = process.env.RAZORPAY_KEY_ID || ''
const secret = process.env.RAZORPAY_KEY_SECRET || ''

function describe() {
    const problems = []
    if (!id) problems.push('RAZORPAY_KEY_ID is empty or missing')
    else if (/^rzp_live_/.test(id)) problems.push('RAZORPAY_KEY_ID is a LIVE key; use a test key (rzp_test_...)')
    else if (!/^rzp_test_[A-Za-z0-9]+$/.test(id)) problems.push('RAZORPAY_KEY_ID should look like rzp_test_ followed by letters and digits')
    if (!secret) problems.push('RAZORPAY_KEY_SECRET is empty or missing')
    else if (/\s|^["']|["']$/.test(secret)) problems.push('RAZORPAY_KEY_SECRET contains spaces or quotes')

    console.log(`Key ID:     ${id ? id : '(missing)'}`)
    console.log(`Key Secret: ${secret ? `set, ${secret.length} characters (usually 24)` : '(missing)'}`)
    return problems
}

async function main() {
    const problems = describe()
    if (problems.length) {
        for (const p of problems) console.log(`Problem: ${p}`)
        process.exit(1)
    }

    // Any read-only call proves the pair works; this lists at most one order.
    const res = await fetch('https://api.razorpay.com/v1/orders?count=1', {
        headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64') },
    })
    if (res.ok) {
        console.log('OK: Razorpay accepted the Key ID and Secret.')
    } else if (res.status === 401) {
        console.log('Rejected (401): the Key ID and Secret do not match. Regenerate the key and copy both again.')
        process.exit(1)
    } else {
        console.log(`Unexpected response from Razorpay: HTTP ${res.status}`)
        process.exit(1)
    }
}

main().catch((err) => {
    console.log(`Could not reach Razorpay: ${err.message}`)
    process.exit(1)
})
