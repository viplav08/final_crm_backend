// routes/executiveFollowUps.js

const express = require('express');
const db = require('../db');            // adjust path if your file is named db.js
const router = express.Router();

// ✅ Get all follow‑ups for executive
router.get('/', async (req, res) => {
  const executiveId = req.query.executive_id;
  if (!executiveId) return res.status(400).json({ error: 'Executive ID is required' });

  try {
    const result = await db.query(
      `SELECT f.id, f.client_id, f.package_name, f.mrp, f.offered_price,
              TO_CHAR(f.follow_up_date, 'YYYY-MM-DD') AS follow_up_date,
              f.outcome, f.remarks,
              COALESCE(f.customer_name, c.full_name, '--') AS name,
              COALESCE(f.mobile, c.mobile_number, '--') AS mobile
       FROM follow_ups f
       LEFT JOIN customer_profiles c ON f.client_id = c.id
       WHERE f.executive_id = $1 AND f.outcome = 'Follow up' AND f.is_dropped = false
       ORDER BY f.follow_up_date ASC`,
      [executiveId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch follow‑ups' });
  }
});

// ✅ Unsubscribe a client
router.post('/:id/unsubscribe', async (req, res) => {
  const { id } = req.params;
  const { reason, remarks, source_table } = req.body;
  const executive_id = req.headers['executive-id'];

  try {
    const table = source_table === 'trial' ? 'trial_followups' : 'follow_ups';
    const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lead not found' });

    const lead = result.rows[0];
    let client_id = lead.client_id || null;
    let mobile    = lead.mobile || lead.mobile_number || null;
    let name      = lead.customer_name || lead.name || null;

    // Fallback to customer_profiles if needed
    if (client_id && (!name || !mobile)) {
      const cust = await db.query(
        `SELECT full_name, mobile_number FROM customer_profiles WHERE id = $1`,
        [client_id]
      );
      if (cust.rows[0]) {
        name   = name   || cust.rows[0].full_name;
        mobile = mobile || cust.rows[0].mobile_number;
      }
    }

    // Record unsubscribe
    await db.query(
      `INSERT INTO unsubscribed_clients (
         client_id, executive_id, reason, remarks, name, mobile_number
       ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [client_id, executive_id, reason, remarks, name, mobile]
    );

    // Remove from source table
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    // Also remove from both tables
    await db.query(`
      DELETE FROM follow_ups
      WHERE executive_id = $1
        AND (client_id = $2 OR mobile = $3 OR customer_name = $4)
    `, [executive_id, client_id, mobile, name]);

    await db.query(`
      UPDATE trial_followups
      SET is_dropped = true
      WHERE executive_id = $1
        AND (client_id = $2 OR mobile_number = $3 OR name = $4)
    `, [executive_id, client_id, mobile, name]);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Unsubscribe error:', err.message);
    res.status(500).json({ error: 'Failed to unsubscribe client' });
  }
});

// ✅ Subscribe a client
router.patch('/:id/subscribe', async (req, res) => {
  const {
    client_id, executive_id, commodity, package_name,
    mrp, offered_price, subscription_start,
    subscription_duration_days, payment_mode,
    payment_reference, gst_option,
    name, mobile_number, payment_amount
  } = req.body;
  const { id } = req.params;

  try {
    await db.query(
      `INSERT INTO subscribed_clients (
         client_id, executive_id, commodity, package_name,
         mrp, offered_price, payment_amount,
         subscription_start, subscription_duration_days,
         payment_mode, payment_reference, gst_option,
         source_type, converted_from_table, converted_from_id,
         converted_on, name, mobile_number
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,
         $8,$9,$10,$11,$12,
         'executive','follow_ups',$13,
         CURRENT_TIMESTAMP,$14,$15
       )`,
      [
        client_id, executive_id, commodity, package_name,
        mrp, offered_price, payment_amount,
        subscription_start, subscription_duration_days,
        payment_mode, payment_reference, gst_option,
        id, name, mobile_number
      ]
    );

    await db.query(`DELETE FROM follow_ups WHERE id = $1`, [id]);
    await db.query(`
      UPDATE trial_followups
      SET is_dropped = true
      WHERE client_id = $1
    `, [client_id]);

    res.json({ success: true, message: 'Client subscribed successfully' });
  } catch (err) {
    console.error('❌ Subscription error:', err.message);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

module.exports = router;

