// routes/executiveFollowUps.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET follow-ups by executive_id
router.get('/', async (req, res) => {
  const { executive_id } = req.query;
  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required' });
  }

  try {
    const result = await pool.query(
      `SELECT 
        id, customer_name, mobile, commodity, package_name, mrp, offered_price,
        trial_days, gst_option, next_follow_up_date, outcome, remarks
       FROM follow_ups
       WHERE executive_id = $1
       ORDER BY next_follow_up_date ASC`,
      [executive_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new follow-up
router.post('/add', async (req, res) => {
  const {
    customer_id,
    executive_id,
    outcome,
    reason,
    mode_of_service,
    next_follow_up_date,
    customer_name,
    mobile,
    commodity,
    package_name,
    mrp,
    offered_price,
    trial_days,
    gst_option,
    remarks
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO follow_ups (
        customer_id, executive_id, outcome, reason, mode_of_service, next_follow_up_date,
        customer_name, mobile, commodity, package_name, mrp, offered_price, trial_days, gst_option, remarks
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        customer_id,
        executive_id,
        outcome,
        reason,
        mode_of_service,
        next_follow_up_date,
        customer_name,
        mobile,
        commodity,
        package_name,
        mrp,
        offered_price,
        trial_days,
        gst_option,
        remarks
      ]
    );

    res.json({ message: 'Follow-up saved', follow_up: result.rows[0] });
  } catch (err) {
    console.error('Error saving follow-up:', err);
    res.status(500).json({ error: 'Failed to save follow-up' });
  }
});

module.exports = router;
