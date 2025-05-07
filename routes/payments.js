const express = require('express');
const pool = require('../db');

const router = express.Router();

// ✅ POST /api/payments/add — Render-compatible, full version
router.post('/add', async (req, res) => {
  try {
    const {
      client_id,              // ✅ For Render DB — replaces customer_id
      executive_id,
      full_name,
      mobile_number,
      package_name,
      package_id,             // Optional
      payment_amount,
      invoice_number,
      payment_date,
      payment_mode,
      gst_option,
      mode_of_service,
      transaction_ref,
      commodity,
      remarks,
      duration_days,
      is_free = false         // Optional: default to false
    } = req.body;

    const result = await pool.query(
      `INSERT INTO payments (
        client_id, executive_id, full_name, mobile_number,
        package_name, package_id, payment_amount, invoice_number,
        payment_date, payment_mode, gst_option, mode_of_service,
        transaction_ref, commodity, remarks, duration_days, is_free
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,
        $13,$14,$15,$16,$17
      ) RETURNING *`,
      [
        client_id, executive_id, full_name, mobile_number,
        package_name, package_id || null, payment_amount, invoice_number,
        payment_date, payment_mode, gst_option, mode_of_service,
        transaction_ref, commodity, remarks, duration_days, is_free
      ]
    );

    res.json({ message: "✅ Payment recorded", payment: result.rows[0] });
  } catch (err) {
    console.error("❌ Payment add error:", err.message);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

module.exports = router;
