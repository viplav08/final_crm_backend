// routes/packages.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM packages');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:commodity', async (req, res) => {
  const { commodity } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM packages WHERE commodity = $1',
      [commodity]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching packages by commodity:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;  // :contentReference[oaicite:22]{index=22}&#8203;:contentReference[oaicite:23]{index=23}
