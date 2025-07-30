const jwt = require("jsonwebtoken");

const {findRefreshToken, generateAccessToken} = require("../middleware/generateToken")

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401); // No token = not logged in

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await findRefreshToken(token);
    if (!storedToken) return res.sendStatus(403);
    
    if (new Date(storedToken.expires_at) < new Date()) {
      await removeRefreshToken(token);
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const newAccessToken = generateAccessToken({ id: payload.id });

    // Send new access token to frontend
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.sendStatus(403); // Invalid token
  }
};

module.exports = {refreshToken}