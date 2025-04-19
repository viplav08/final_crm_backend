const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const {
      customer_id,
      executive_id,
      full_name,
      mobile_number,
      package_name,
      commodity,
      mode_of_service,
      payment_mode,
      payment_amount,
      payment_date,
      gst_option,
      invoice_number,
      transaction_ref,
      duration_days,
      remarks
    } = req.body;

    const result = await pool.query(
      `INSERT INTO payments (
        customer_id, executive_id, full_name, mobile_number, package_name,
        commodity, mode_of_service, payment_mode, payment_amount, payment_date,
        gst_option, invoice_number, transaction_ref, duration_days, remarks,
        captured_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        NOW()
      ) RETURNING *`,
      [
        customer_id,
        executive_id,
        full_name,
        mobile_number,
        package_name,
        commodity,
        mode_of_service,
        payment_mode,
        payment_amount,
        payment_date,
        gst_option,
        invoice_number,
        transaction_ref,
        duration_days,
        remarks
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Error inserting payment:', err);
    res.status(500).json({ success: false, error: 'Failed to save payment' });
  }
});

module.exports = router; // <-- ensure this line
