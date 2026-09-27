const express = require('express')
const validate = require('../../middleware/validate')
const userSchemas = require('./user.validation')
const userController = require('./user.controller')
const { requireAuth, adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', ...adminOnly, userController.list)
router.post('/', ...adminOnly, validate(userSchemas.create), userController.create)
// Users may read and update their own account; the controller checks this.
router.get('/:id', requireAuth, userController.getById)
router.patch('/:id', requireAuth, validate(userSchemas.update), userController.update)
router.delete('/:id', ...adminOnly, userController.remove)

module.exports = router
