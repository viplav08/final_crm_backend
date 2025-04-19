import express from 'express';
import db from '../db.js';

const router = express.Router();

// ✅ New route: /api/followups?executive_id=12
router.get('/', async (req, res) => {
  const executiveId = req.query.executive_id;
  try {
    const result = await db.query(
      `SELECT * FROM follow_ups
       WHERE executive_id = $1 AND outcome IN ('Follow up') AND is_dropped = false
       ORDER BY follow_up_date ASC`,
      [executiveId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching follow-ups via query:', err);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// Existing route: /api/followups/:executiveId
router.get('/:executiveId', async (req, res) => {
  const executiveId = req.params.executiveId;
  try {
    const result = await db.query(
      `SELECT * FROM follow_ups
       WHERE executive_id = $1 AND outcome IN ('Follow up', 'Trial') AND is_dropped = false
       ORDER BY follow_up_date ASC`,
      [executiveId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching follow-ups:', err);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// ✅ Subscribe a lead
router.post('/:id/subscribe', async (req, res) => {
  const followUpId = req.params.id;
  const { source_table } = req.body;
  const executive_id = req.headers['executive-id'];

  try {
    const table = source_table === 'trial' ? 'trial_followups' : 'follow_ups';
    const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [followUpId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });

    const lead = result.rows[0];
    let name = lead.name || lead.customer_name || null;
    let mobile = lead.mobile_number || lead.mobile || null;

    if ((!name || !mobile) && lead.client_id) {
      const customerRes = await db.query(
        `SELECT full_name, mobile_number FROM customer_profiles WHERE id = $1`,
        [lead.client_id]
      );
      if (customerRes.rows.length > 0) {
        name = name || customerRes.rows[0].full_name;
        mobile = mobile || customerRes.rows[0].mobile_number;
      }
    }

    await db.query(
      `INSERT INTO subscribed_clients (
        client_id, executive_id, commodity, package_name, mrp, offered_price,
        subscription_duration_days, payment_mode, payment_reference, gst_option,
        source_type, converted_from_table, converted_from_id, converted_on,
        mobile_number, name
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        'executive', $11, $12, CURRENT_TIMESTAMP,
        $13, $14
      )`,
      [
        lead.client_id,
        executive_id,
        lead.commodity,
        lead.package_name,
        lead.mrp,
        lead.offered_price,
        lead.trial_days || 0,
        lead.payment_mode || null,
        lead.payment_reference || null,
        lead.gst_option || 'With GST',
        table,
        followUpId,
        mobile,
        name
      ]
    );

    await db.query(`DELETE FROM ${table} WHERE id = $1`, [followUpId]);
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('❌ Subscription error:', err);
    res.status(500).json({ error: 'Failed to subscribe lead' });
  }
});

// ✅ Unsubscribe
router.post('/:id/unsubscribe', async (req, res) => {
  const followUpId = req.params.id;
  const { reason, remarks, source_table } = req.body;
  const executive_id = req.headers['executive-id'];
  try {
    const table = source_table === 'trial' ? 'trial_followups' : 'follow_ups';
    const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [followUpId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });

    const lead = result.rows[0];
    let name = lead.name || lead.customer_name || null;
    let mobile = lead.mobile_number || lead.mobile || null;

    if ((!name || !mobile) && lead.client_id) {
      const customerRes = await db.query(
        `SELECT full_name, mobile_number FROM customer_profiles WHERE id = $1`,
        [lead.client_id]
      );
      if (customerRes.rows.length > 0) {
        name = name || customerRes.rows[0].full_name;
        mobile = mobile || customerRes.rows[0].mobile_number;
      }
    }

    await db.query(
      `INSERT INTO unsubscribed_clients (
        client_id, executive_id, reason, remarks, name, mobile_number
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        lead.client_id,
        executive_id,
        reason,
        remarks,
        name,
        mobile
      ]
    );

    await db.query(`DELETE FROM ${table} WHERE id = $1`, [followUpId]);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('❌ Unsubscribe error:', err);
    res.status(500).json({ error: 'Failed to unsubscribe lead' });
  }
});

// ✅ View subscribed clients
router.get('/:executiveId/subscribed', async (req, res) => {
  const executiveId = req.params.executiveId;
  try {
    const result = await db.query(
      `SELECT * FROM subscribed_clients
       WHERE executive_id = $1
       ORDER BY converted_on DESC`,
      [executiveId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching subscribed clients:', err);
    res.status(500).json({ error: 'Failed to fetch subscribed clients' });
  }
});

export default router;
