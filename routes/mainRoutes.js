const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const verifyRole = require('../middleware/role')

router.get('/profile', auth, async(req,res) => {
    return res.json(`welcome ${req.user.email}`)
});
router.get('/admin', auth, verifyRole('admin'), async(req, res) => {
    return res.json({message: "Welcome admin"})
})

module.exports = router;