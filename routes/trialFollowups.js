// routes/trialFollowups.js
const express = require('express');
const pool    = require('../db');

const router = express.Router();

// GET all active trial follow-ups
router.get('/', async (req, res) => {
  const { executive_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT *
         FROM trial_followups
        WHERE executive_id = $1
          AND is_dropped = false
     ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching trial follow-ups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH, POST, etc… your other trial-follow-up handlers here…

module.exports = router;
