const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/summary', async (req, res) => {
  const { executive_id, period } = req.query;

  const periodMap = {
    today: "CURRENT_DATE",
    week: "CURRENT_DATE - INTERVAL '7 days'",
    month: "CURRENT_DATE - INTERVAL '30 days'"
  };

  const fromDate = periodMap[period] || "CURRENT_DATE";

  try {
    // Summary part
    const summary = await pool.query(`
      SELECT 
        COUNT(*) AS count,
        COALESCE(SUM(payment_amount), 0) AS total,
        ARRAY_AGG(DISTINCT payment_mode) AS modes
      FROM payments
      WHERE executive_id = $1 AND payment_date >= ${fromDate}
    `, [executive_id]);

    // Table records part
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
