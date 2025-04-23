// routes/trialFollowups.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

// GET active trial follow-ups
router.get('/', async (req, res) => {
  const execId = req.query.executive_id;
  try {
    const result = await pool.query(
      'SELECT * FROM trial_followups WHERE executive_id=$1 AND is_dropped=false ORDER BY created_at DESC',
      [execId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH update a trial record
router.patch('/:id', async (req, res) => { /* ... */ });

module.exports = router;  // :contentReference[oaicite:24]{index=24}&#8203;:contentReference[oaicite:25]{index=25}
