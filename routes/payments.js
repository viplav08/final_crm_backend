const express = require('express');
const pool = require('../db');

const router = express.Router();

// ✅ POST /api/payments/add
router.post('/add', async (req, res) => {
  try {
    const {
      customer_id, // Optional
      executive_id,
      full_name,
      mobile_number,
      package_name,
      payment_amount,
      invoice_number,
      payment_date,
      payment_mode,
      gst_option,
      mode_of_service,
      transaction_ref,
      commodity,
      remarks,
      duration_days
    } = req.body;

    const query = customer_id
      ? `INSERT INTO payments (
          customer_id, executive_id, full_name, mobile_number, package_name,
          payment_amount, invoice_number, payment_date, payment_mode,
          gst_option, mode_of_service, transaction_ref, commodity, remarks, duration_days
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
        ) RETURNING *`
      : `INSERT INTO payments (
          executive_id, full_name, mobile_number, package_name,
          payment_amount, invoice_number, payment_date, payment_mode,
          gst_option, mode_of_service, transaction_ref, commodity, remarks, duration_days
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
        ) RETURNING *`;

    const values = customer_id
      ? [
          customer_id, executive_id, full_name, mobile_number, package_name,
          payment_amount, invoice_number, payment_date, payment_mode,
          gst_option, mode_of_service, transaction_ref, commodity, remarks, duration_days
        ]
      : [
          executive_id, full_name, mobile_number, package_name,
          payment_amount, invoice_number, payment_date, payment_mode,
          gst_option, mode_of_service, transaction_ref, commodity, remarks, duration_days
        ];

    const result = await pool.query(query, values);

    res.json({ message: "Payment recorded", payment: result.rows[0] });
  } catch (err) {
    console.error("❌ Payment add error:", err.message);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

module.exports = router;
