// routes/auth.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT id, name, role, password_hash FROM executives WHERE email = $1',
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Executive not found' });
    const exec = rows[0];
    // In production, use bcrypt.compare()
    if (password !== exec.password_hash) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({
      token: 'mock-token',
      id:    exec.id,
      name:  exec.name,
      role:  exec.role
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;  // :contentReference[oaicite:14]{index=14}&#8203;:contentReference[oaicite:15]{index=15}
