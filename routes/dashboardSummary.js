
const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection

router.get('/summary', async (req, res) => {
  try {
    const client = await pool.connect();

    const [
      totalClients,
      renewed,
      lapsed,
      reactivated,
      converted,
      unresponsive,
      totalRevenue,
      byCommodity,
      byPackage
    ] = await Promise.all([
      client.query("SELECT COUNT(*) FROM customer_profiles"),
      client.query("SELECT COUNT(*) FROM customer_profiles WHERE customer_flag = 'Renewed'"),
      client.query("SELECT COUNT(*) FROM customer_profiles WHERE customer_flag = 'Lapsed'"),
      client.query("SELECT COUNT(*) FROM customer_profiles WHERE customer_flag = 'Reactivated'"),
      client.query("SELECT COUNT(*) FROM customer_profiles WHERE customer_flag = 'Converted Lead'"),
      client.query("SELECT COUNT(*) FROM customer_profiles WHERE customer_flag = 'Unresponsive'"),
      client.query("SELECT COALESCE(SUM(actual_amount_received), 0) FROM customer_profiles WHERE payment_verified = 'Approved'"),
      client.query("SELECT commodity, COUNT(*) FROM customer_profiles GROUP BY commodity"),
      client.query("SELECT package_name, COUNT(*) FROM customer_profiles GROUP BY package_name")
    ]);

    res.json({
      totalClients: parseInt(totalClients.rows[0].count),
      renewed: parseInt(renewed.rows[0].count),
      lapsed: parseInt(lapsed.rows[0].count),
      reactivated: parseInt(reactivated.rows[0].count),
      converted: parseInt(converted.rows[0].count),
      unresponsive: parseInt(unresponsive.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].coalesce),
      byCommodity: Object.fromEntries(byCommodity.rows.map(r => [r.commodity, parseInt(r.count)])),
      byPackage: Object.fromEntries(byPackage.rows.map(r => [r.package_name, parseInt(r.count)]))
    });

    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
