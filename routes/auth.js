// routes/auth.js – FINAL with /login + /test + route debug
const express = require('express');
const pool = require('../db');
const router = express.Router();

// ✅ Route hit test
router.get('/test', (req, res) => {
  console.log("[DEBUG] /api/auth/test was HIT ✅");
  res.send("✅ Auth route is working");
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  console.log("[DEBUG] POST /api/auth/login was HIT ✅");

  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM executives WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      executive_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
