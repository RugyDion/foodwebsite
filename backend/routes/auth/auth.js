const express = require('express')
const router = express.Router()
const authController = require('../../controllers/auth/authController')
const loginLimiter = require('../../middleware/loginLimiter')

router.route('/')
    .post(loginLimiter, authController.handleLogin)

router.get('/refresh', authController.handleRefreshToken)
router.post('/logout', authController.handleLogout)

module.exports = router