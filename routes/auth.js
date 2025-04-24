// routes/auth.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/login', async (req, res) => {
  console.log("🛎️ /api/auth/login HIT"); // Log to confirm route is hit

  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM executives WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // ✅ SIMPLE PASSWORD MATCH (no bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // ✅ Login Success
    res.json({
      success: true,
      message: 'Login successful',
      executive_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
