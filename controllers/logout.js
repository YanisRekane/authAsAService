const {removeRefreshToken} = require('../middleware/generateToken');

const logout = async (req, res) => {
    const token = req.cookies.refreshToken;

  if (!token) return res.sendStatus(204); // No token = nothing to do

  try {
    // Delete from DB
    await removeRefreshToken(token);
  } catch (err) {
    console.error("Logout error:", err);
    // Do not block logout if DB fails — still clear the cookie
  }

  // Clear the cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.status(200).json({message:"Logged out successfully"});
};

module.exports = {logout};