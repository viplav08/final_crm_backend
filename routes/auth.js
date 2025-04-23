// routes/auth.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(
      'SELECT id,name,role,password_hash FROM executives WHERE email=$1',
      [email]
    );
    if (!rows.length || rows[0].password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { id, name, role } = rows[0];
    res.json({ token: 'mock-token', id, name, role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
