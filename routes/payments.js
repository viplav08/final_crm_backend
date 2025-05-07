// routes/payments.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/payments/add
router.post('/add', async (req, res) => {
  try {
    const {
      client_id,
      executive_id,
      payment_mode,
      payment_amount,
      payment_date,
      invoice_number,
      is_free = false,
      mobile_number,
      package_id,
      package_name,
      mode_of_service,
      full_name,
      gst_option,
      remarks,
      duration_days,
      transaction_ref,
      commodity
    } = req.body;

    const query = `
      INSERT INTO payments (
        client_id, executive_id, payment_mode, payment_amount, payment_date, invoice_number,
        is_free, mobile_number, package_id, package_name, mode_of_service, full_name,
        gst_option, remarks, duration_days, transaction_ref, commodity
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17
      )
      RETURNING *
    `;

    const values = [
      client_id, executive_id, payment_mode, payment_amount, payment_date, invoice_number,
      is_free, mobile_number, package_id, package_name, mode_of_service, full_name,
      gst_option, remarks, duration_days, transaction_ref, commodity
    ];

    const result = await pool.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Payment add error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
