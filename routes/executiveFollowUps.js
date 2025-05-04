const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET follow-ups for an executive
router.get('/', async (req, res) => {
  const { executive_id } = req.query;
  if (!executive_id) return res.status(400).json({ error: 'executive_id is required' });

  try {
    const result = await pool.query(
      `SELECT id, customer_name, mobile, commodity, package_name,
              mrp, offered_price, trial_days, gst_option,
              follow_up_date, outcome, remarks
       FROM follow_ups
       WHERE executive_id = $1 AND is_dropped = false AND outcome = 'Follow up'
       ORDER BY follow_up_date ASC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new follow-up from Trial Tab or Customer Profile
router.post('/add', async (req, res) => {
  const {
    client_id,
    executive_id,
    follow_up_date,
    outcome,
    remarks,
    customer_name,
    mobile,
    commodity,
    package_name,
    mrp,
    offered_price,
    gst_option,
    trial_days
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO follow_ups (
        client_id, executive_id, follow_up_date, outcome, remarks,
        customer_name, mobile, commodity, package_name, mrp,
        offered_price, gst_option, trial_days
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        client_id,
        executive_id,
        follow_up_date,
        outcome,
        remarks,
        customer_name,
        mobile,
        commodity,
        package_name,
        mrp,
        offered_price,
        gst_option,
        trial_days
      ]
    );
    res.json({ message: 'Follow-up saved successfully', follow_up: result.rows[0] });
  } catch (err) {
    console.error('Error saving follow-up:', err);
    res.status(500).json({ error: 'Failed to save follow-up' });
  }
});

module.exports = router;
