const express = require('express');
const pool = require('../db');

const router = express.Router();

// ✅ GET all packages (used in customer profile form)
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages');
    res.json(result.rows); // Must return array
  } catch (err) {
    console.error('Error fetching all packages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET packages by commodity
router.get('/packages/:commodity', async (req, res) => {
  const commodity = req.params.commodity;

  try {
    const result = await pool.query(
      'SELECT * FROM packages WHERE commodity = $1',
      [commodity]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET distinct commodities
router.get('/commodities', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT commodity FROM packages');
    const commodities = result.rows.map(row => row.commodity);
    res.json(commodities);
  } catch (err) {
    console.error('Error fetching commodities:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
