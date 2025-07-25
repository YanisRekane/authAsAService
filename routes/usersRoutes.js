const express = require('express');
const router = express.Router();
const { register } = require('../controllers/register');
const { login } = require('../controllers/login');
const { refreshToken } = require("../controllers/refresh");
const { logout } = require('../controllers/logout');
const authLimiter = require('../middleware/rateLimiter')
const verifyEmail = require('../controllers/verifyEmail');
const auth = require('../middleware/auth')

router.get('/verify-email', verifyEmail);
router.post('/register',authLimiter, register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout)

module.exports = router;