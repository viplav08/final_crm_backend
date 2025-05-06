const express = require('express');
const pool = require('../db');

const router = express.Router(); // ✅ This was missing

// ✅ POST /api/payments/add
router.post('/add', async (req, res) => {
  try {
    const {
      customer_id,
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

    const result = await pool.query(
      `INSERT INTO payments (
        customer_id, executive_id, full_name, mobile_number, package_name,
        payment_amount, invoice_number, payment_date, payment_mode,
        gst_option, mode_of_service, transaction_ref, commodity, remarks, duration_days
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) RETURNING *`,
      [
        customer_id,
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
      ]
    );

    res.json({ message: "Payment recorded", payment: result.rows[0] });
  } catch (err) {
    console.error("❌ Payment add error:", err.message);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// ✅ GET /api/payments/summary
router.get('/summary', async (req, res) => {
  const { executive_id, period } = req.query;

  const periodMap = {
    today: "CURRENT_DATE",
    week: "CURRENT_DATE - INTERVAL '7 days'",
    month: "CURRENT_DATE - INTERVAL '30 days'"
  };

  const fromDate = periodMap[period] || "CURRENT_DATE";

  try {
    const summary = await pool.query(`
      SELECT 
        COUNT(*) AS count,
        COALESCE(SUM(payment_amount), 0) AS total,
        ARRAY_AGG(DISTINCT payment_mode) AS modes
      FROM payments
      WHERE executive_id = $1 AND payment_date >= ${fromDate}
    `, [executive_id]);

    const records = await pool.query(`
      SELECT 
        TO_CHAR(payment_date, 'YYYY-MM-DD') as payment_date,
        mobile_number,
        full_name,
        commodity,
        package_name,
        payment_amount,
        'Pending' AS status
      FROM payments
      WHERE executive_id = $1 AND payment_date >= ${fromDate}
      ORDER BY payment_date DESC
    `, [executive_id]);

    res.json({
      count: parseInt(summary.rows[0].count),
      total: parseFloat(summary.rows[0].total),
      modes: summary.rows[0].modes || [],
      records: records.rows
    });

  } catch (err) {
    console.error('❌ Payment summary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

module.exports = router;
