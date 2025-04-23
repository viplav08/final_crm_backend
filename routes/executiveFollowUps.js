// routes/executiveFollowUps.js
const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET all follow-ups
router.get('/', async (req, res) => {
  const execId = req.query.executive_id;
  if (!execId) return res.status(400).json({ error: 'Executive ID is required' });
  try {
    const result = await db.query(
      `SELECT f.id, f.client_id, f.package_name, f.mrp, f.offered_price,
              TO_CHAR(f.follow_up_date,'YYYY-MM-DD') AS follow_up_date,
              f.outcome, f.remarks,
              COALESCE(c.full_name,'--') AS name,
              COALESCE(c.mobile_number,'--') AS mobile
       FROM follow_ups f
       LEFT JOIN customer_profiles c ON f.client_id = c.id
       WHERE f.executive_id=$1 AND f.outcome='Follow up' AND f.is_dropped=false
       ORDER BY f.follow_up_date ASC`,
      [execId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// Unsubscribe
router.post('/:id/unsubscribe', async (req, res) => { /* ... */ });

// Subscribe
router.patch('/:id/subscribe', async (req, res) => { /* ... */ });

module.exports = router;  // :contentReference[oaicite:20]{index=20}&#8203;:contentReference[oaicite:21]{index=21}
