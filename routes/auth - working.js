// routes/auth.js
const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'executive@crm.com' && password === '123456') {
    return res.status(200).json({
      token: 'mock-token',
      name: 'Executive User',
      role: 'executive',
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
