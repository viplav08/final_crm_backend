const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/commodities - returns distinct list of commodities
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

// GET /api/packages/:commodity - returns packages for a given commodity
router.get('/packages/:commodity', async (req, res) => {
  const { commodity } = req.params;
  try {
    const result = await pool.query(
      'SELECT package_name, mrp FROM packages WHERE commodity = $1',
      [commodity]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
