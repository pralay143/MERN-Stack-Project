const express = require('express')
const asyncHandler = require('../../utils/asyncHandler')
const { z, objectId } = require('../../utils/validators')
const { validateQuery } = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const checkoutService = require('./checkout.service')

const router = express.Router()

const summaryQuery = z.object({ addressId: z.preprocess((v) => (v === '' ? undefined : v), objectId('Address').optional()) })

// GET /checkout/summary?addressId=... (defaults to the user's default address)
router.get(
    '/summary',
    requireAuth,
    validateQuery(summaryQuery),
    asyncHandler(async (req, res) => {
        const data = await checkoutService.summary(req.user._id, req.validQuery.addressId)
        res.json({ message: 'Checkout summary', data })
    })
)

module.exports = router
