const express = require('express')
const userController = require('./user.controller')
const { requireAuth, adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', ...adminOnly, userController.list)
router.post('/', ...adminOnly, userController.create)
// Users may read and update their own account; the controller checks this.
router.get('/:id', requireAuth, userController.getById)
router.patch('/:id', requireAuth, userController.update)
router.delete('/:id', ...adminOnly, userController.remove)

module.exports = router
