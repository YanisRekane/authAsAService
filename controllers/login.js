const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken, saveRefreshToken } = require("../middleware/generateToken");

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
    }

    try {
        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log('the account doesnt exict')
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];
        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //check if the user is verified
        if (!user.is_verified) {
            return res.status(403).json({ message: "Email not verified" });
        }


        // Generate JWT token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);


        // 3. Save refresh token to DB
        await saveRefreshToken(user.id, refreshToken); // this function inserts into DB



        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // only over HTTPS
            sameSite: "Strict", // protect against CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.status(200).json({
            accessToken,
            user: {
            id: user.id,
            name: user.name,
            email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {login};