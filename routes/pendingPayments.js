
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/admin/pending-payments
router.get('/pending-payments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, mobile_number, package_name, offered_price, actual_amount_received,
              payment_mode, gst_included, payment_date, invoice_number
       FROM customer_profiles
       WHERE payment_verified = 'Pending'
       ORDER BY payment_date DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

module.exports = router;
