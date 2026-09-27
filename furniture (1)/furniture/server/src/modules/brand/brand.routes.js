const express = require('express')
const validate = require('../../middleware/validate')
const brandSchemas = require('./brand.validation')
const brandController = require('./brand.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', brandController.list)
router.post('/', ...adminOnly, validate(brandSchemas.create), brandController.create)
router.get('/:id', brandController.getById)
router.patch('/:id', ...adminOnly, validate(brandSchemas.update), brandController.update)
router.delete('/:id', ...adminOnly, brandController.remove)

module.exports = router
