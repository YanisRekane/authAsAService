const express = require('express');
const router = express.Router();
const { register } = require('../controllers/register');
const { login } = require('../controllers/login');
const { refreshToken } = require("../controllers/refresh");
const { logout } = require('../controllers/logout');
const authLimiter = require('../middleware/rateLimiter')
const verifyEmail = require('../controllers/verifyEmail');
const auth = require('../middleware/auth')
const reset_password_email = require('../controllers/resetPasswordEmail');
const resetPassword = require('../controllers/resetPassword');

router.get('/verify-email', verifyEmail);
router.post('/register',authLimiter, register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout)
router.post('/forgot-password', reset_password_email);
router.post('/reset-password', resetPassword);

module.exports = router;