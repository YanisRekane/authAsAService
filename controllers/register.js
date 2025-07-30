const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const {generateEmailVerificationToken} = require('../middleware/generateToken')
const {sendVerificationEmail} = require('../middleware/sendEmail')

const register = async (req, res) => {
    const { username,email, password, role} = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
    }

    const userRole = role || 'user';
    
    try {
        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            console.log(existingUser);
        return res.status(409).json({ message: 'User already exists' });
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Insert new user into the database
        const [results] = await db.query('INSERT INTO users (username,email, password, role) VALUES (?, ?, ?, ?)', [username,email, hashedPassword, userRole]);

        const newUserId = results.insertId;

        const token = generateEmailVerificationToken(newUserId);
        await sendVerificationEmail(email, token);

    
        res.status(201).json({ message: 'verification email sent', id:newUserId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {register};