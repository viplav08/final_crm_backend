const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM executives WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Use bcrypt to compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Success
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
