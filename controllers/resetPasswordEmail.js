const express = require('express');
const crypto = require('crypto');
const db = require('../config/db');
const {sendResetEmail} = require('../middleware/sendEmail')


const reset_password_email = async(req,res) => {
    const {email} = req.body;

    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0){
        return res.status(404).json({message:"user not found"});
    }
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)`,
        [results[0].id, tokenHash, expiresAt]
    );
    await sendResetEmail(email, token);

    res.status(200).json({ message: 'Reset link sent' })
}

module.exports = reset_password_email;