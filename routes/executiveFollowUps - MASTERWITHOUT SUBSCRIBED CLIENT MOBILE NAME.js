import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all current follow-ups
router.get('/', async (req, res) => {
  const executiveId = req.query.executive_id;

  try {
    const result = await pool.query(
      `SELECT f.*, 
              c.full_name AS name, 
              c.mobile_number AS mobile, 
              c.package_name AS package,
              c.mrp, 
              c.offered_price 
       FROM follow_ups f
       JOIN customer_profiles c ON f.client_id = c.id
       WHERE f.executive_id = $1
         AND f.outcome = 'Follow up'
       ORDER BY f.follow_up_date DESC`,
      [executiveId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching follow-ups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Subscribe and move to subscribed_clients
router.patch('/:followupId/subscribe', async (req, res) => {
  const { followupId } = req.params;
  const {
    client_id,
    executive_id,
    commodity,
    package_name,
    mrp,
    offered_price,
    subscription_start,
    subscription_duration_days,
    payment_mode,
    payment_reference,
    gst_option,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO subscribed_clients (
        client_id, executive_id, commodity, package_name, mrp, offered_price,
        subscription_start, subscription_duration_days, payment_mode,
        payment_reference, gst_option, source_type, converted_from_table,
        converted_from_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, 'executive', 'follow_ups',
        $12
      )`,
      [
        client_id, executive_id, commodity, package_name, mrp, offered_price,
        subscription_start, subscription_duration_days, payment_mode,
        payment_reference, gst_option, followupId
      ]
    );

    await pool.query(`DELETE FROM follow_ups WHERE id = $1`, [followupId]);

    // ✅ Also mark corresponding trial entry as dropped
    await pool.query("UPDATE trial_followups SET is_dropped = true WHERE client_id = $1", [client_id]);

    // ✅ Also mark corresponding trial entry as dropped
    await pool.query("UPDATE trial_followups SET is_dropped = true WHERE client_id = $1", [client_id]);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Subscription update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Unsubscribe and move to unsubscribed_clients
router.patch('/:followupId/unsubscribe', async (req, res) => {
  const { followupId } = req.params;
  const {
    client_id,
    executive_id,
    reason,
    remarks,
    name,
    mobile_number,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO unsubscribed_clients (client_id, executive_id, reason, remarks, name, mobile_number)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [client_id, executive_id, reason, remarks, name, mobile_number]
    );

    await pool.query(`DELETE FROM follow_ups WHERE id = $1`, [followupId]);

    // ✅ Also mark corresponding trial entry as dropped
    await pool.query("UPDATE trial_followups SET is_dropped = true WHERE client_id = $1", [client_id]);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Unsubscribe update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Move to Follow-Up again (update follow_up_date + remarks)
router.patch('/:followupId/follow-up', async (req, res) => {
  const { followupId } = req.params;
  const { follow_up_date, remarks } = req.body;

  try {
    await pool.query(
      `UPDATE follow_ups
       SET follow_up_date = $1,
           remarks = $2
       WHERE id = $3`,
      [follow_up_date, remarks, followupId]
    );

    res.status(200).json({ message: "Follow-up updated" });
  } catch (error) {
    console.error('❌ Follow-up update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
