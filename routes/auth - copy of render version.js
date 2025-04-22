const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, name, role, password_hash FROM executives WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Executive not found' });
    }

    const executive = result.rows[0];

    if (password !== executive.password_hash) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      token: 'mock-token',
      id: executive.id,
      name: executive.name,
      role: executive.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

