const express = require('express')
const brandController = require('./brand.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', brandController.list)
router.post('/', ...adminOnly, brandController.create)
router.get('/:id', brandController.getById)
router.patch('/:id', ...adminOnly, brandController.update)
router.delete('/:id', ...adminOnly, brandController.remove)

module.exports = router
