// routes/auth.js
const express = require('express');
const pool    = require('../db');    // CommonJS db.js
const router  = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT id,name,role,password_hash FROM executives WHERE email=$1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Executive not found' });
    }
    const exec = rows[0];
    if (password !== exec.password_hash) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ token: 'mock-token', id: exec.id, name: exec.name, role: exec.role });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
