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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user exists
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify a user's email using a verification token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token (JWT or random string)
 *     responses:
 *       200:
 *         description: Email successfully verified
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User loged in successfully
 *       401:
 *         description: Invalide email or password
 *       403:
 *         description: Email not verified
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token stored in cookie
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Refresh token stored as HTTP-only cookie
 *     responses:
 *       200:
 *          description : new access token has been sent
 *          content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       403:
 *          description : invalide or expired token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the user by clearing the refresh token cookie and removing it from the database
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: false
 *         schema:
 *           type: string
 *         description: Refresh token stored in an HTTP-only cookie
 *     responses:
 *       200:
 *         description: Logged out successfully — refresh token cleared from cookie and database
 *       204:
 *         description: No refresh token present to clear
 *       500:
 *         description: Server error during logout
 */
router.post('/logout', logout)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send a password reset link to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: If the email exists, a reset link is sent
 *       400:
 *         description: Invalid email input
 */
router.post('/forgot-password', reset_password_email);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset the user's password using the provided token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token sent via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: NewStrongPassword123
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password has been successfully reset
 *       400:
 *         description: Invalid or expired token, or bad input
 */
router.post('/reset-password', resetPassword);

module.exports = router;