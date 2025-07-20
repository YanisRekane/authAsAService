const jwt = require('jsonwebtoken');
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

function newRefreshToken (user){
    return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}