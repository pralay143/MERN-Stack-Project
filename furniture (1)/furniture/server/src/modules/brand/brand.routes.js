const express = require('express')
const brandController = require('./brand.controller')

const router = express.Router()

router.get('/', brandController.list)
router.post('/', brandController.create)
router.get('/:id', brandController.getById)
router.patch('/:id', brandController.update)
router.delete('/:id', brandController.remove)

module.exports = router
