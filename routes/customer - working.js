// routes/customer.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history/:mobile', async (req, res) => {
  const { mobile } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM customer_profiles WHERE mobile_number = $1 ORDER BY created_at DESC',
      [mobile]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const {
      full_name, mobile_number, email, location, state,
      business_name, business_type, gst_number,
      package_name, commodity, mrp, offered_price,
      subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive,
      follow_up_date, trial_days
    } = req.body;

    const created_at = new Date();
    const insertText = `
      INSERT INTO customer_profiles (
        full_name, mobile_number, email, location, state,
        business_name, business_type, gst_number,
        package_name, commodity, mrp, offered_price,
        subscription_duration, subscription_status,
        interest_status, remarks, assigned_executive,
        follow_up_date, trial_days, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,
        $9,$10,$11,$12,
        $13,$14,
        $15,$16,$17,
        $18,$19,$20
      ) RETURNING id
    `;
    const values = [
      full_name, mobile_number, email, location, state,
      business_name, business_type, gst_number,
      package_name, commodity, mrp, offered_price,
      subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive,
      follow_up_date, trial_days, created_at
    ];
    const { rows } = await pool.query(insertText, values);
    const customerId = rows[0].id;

    // ...follow-up & trial routing logic as before...

    res.status(201).json({ message: 'Customer saved and routed successfully.' });
  } catch (error) {
    console.error('Error saving customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;  // :contentReference[oaicite:16]{index=16}&#8203;:contentReference[oaicite:17]{index=17}
