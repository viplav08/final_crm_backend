// routes/auth.js
const express = require('express');
const pool = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Still useful if you want to issue JWTs for admins

// Ensure JWT_SECRET is in your .env or environment variables if you use JWTs
// const JWT_SECRET = process.env.JWT_SECRET;

router.get('/test', (req, res) => {
  console.log("[DEBUG] /api/auth/test was HIT ✅");
  res.send("✅ Auth route is working");
});

// Unified Login Route for Executives and Admins
router.post('/login', async (req, res) => {
  console.log("[DEBUG] POST /api/auth/login (Unified) was HIT ✅");

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM executives WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Plain text password comparison (as per your current setup)
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Successful login - now determine if admin or executive based on role
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // This is the crucial field
    };

    if (user.role === 'admin') {
      // Optional: Generate a JWT for admin if you want token-based auth for admin API calls later
      // For simplicity now, we'll just send user data. If using JWT:
      /*
      if (!JWT_SECRET) {
          console.error("JWT_SECRET is not defined!");
          return res.status(500).json({ success: false, message: 'Server authentication configuration error.' });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' } // Adjust as needed
      );
      */
      
      res.json({
        success: true,
        message: 'Admin login successful',
        user: userData, // Send user data, including the role
        // token: token, // Uncomment if using JWT
      });
    } else if (user.role === 'executive') {
      res.json({
        success: true,
        message: 'Executive login successful',
        user: userData, // Send user data, including the role
      });
    } else {
      // Should not happen if roles are properly managed, but good to have a fallback
      console.warn(`User ${user.email} has an unrecognized role: ${user.role}`);
      return res.status(403).json({ success: false, message: 'Access denied due to unrecognized role.' });
    }

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: 'Login failed due to server error' });
  }
});

module.exports = router;