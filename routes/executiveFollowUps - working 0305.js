// routes/executiveFollowUps.js
const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/executive/follow-ups
// Expects header: executive-id
router.get('/', async (req, res) => {
  const execId = req.headers['executive-id'];
  if (!execId) return res.status(400).json({ error: 'Executive ID header is required' });
  try {
    const result = await db.query(
      `SELECT f.id, f.client_id, f.package_name, f.mrp, f.offered_price,
              TO_CHAR(f.follow_up_date,'YYYY-MM-DD') AS follow_up_date,
              f.outcome, f.remarks,
              COALESCE(c.full_name,'--') AS name,
              COALESCE(c.mobile_number,'--') AS mobile
       FROM follow_ups f
       LEFT JOIN customer_profiles c ON f.client_id = c.id
       WHERE f.executive_id = $1
         AND f.outcome = 'Follow up'
         AND f.is_dropped = false
       ORDER BY f.follow_up_date ASC`,
      [execId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// (unsubscribe/subscribe handlers omitted for brevity)

module.exports = router;
