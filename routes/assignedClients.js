
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/customer/assigned?executive=John
router.get('/assigned', async (req, res) => {
  const executive = req.query.executive;

  if (!executive) {
    return res.status(400).json({ error: 'Missing executive name' });
  }

  try {
    const result = await pool.query(
      'SELECT id, full_name, mobile_number, package_name FROM customer_profiles WHERE assigned_executive = $1',
      [executive]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assigned clients:', err);
    res.status(500).json({ error: 'Failed to fetch assigned clients' });
  }
});

module.exports = router;
