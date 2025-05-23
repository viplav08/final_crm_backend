// --- START OF FILE executiveFollowUps.js ---
const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure this path is correct for your db connection

// ✅ GET all follow-ups
router.get('/', async (req, res) => {
  const { executive_id } = req.query;
  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM follow_ups
       WHERE executive_id = $1 AND is_dropped = false
       ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching follow-ups:', err.message);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// ✅ POST a new follow-up
router.post('/add', async (req, res) => {
  const {
    client_id, executive_id, customer_name, mobile,
    commodity, package_name, mrp, offered_price,
    gst_option, trial_days, outcome, remarks,
    next_follow_up_date
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO follow_ups (
        client_id, executive_id, customer_name, mobile,
        commodity, package_name, mrp, offered_price,
        gst_option, trial_days, outcome, remarks,
        next_follow_up_date, is_dropped, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,false,NOW()
      ) RETURNING *`,
      [
        client_id, executive_id, customer_name, mobile,
        commodity, package_name, mrp, offered_price,
        gst_option, trial_days, outcome, remarks,
        next_follow_up_date
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding follow-up:', err.message);
    res.status(500).json({ error: 'Failed to add follow-up' });
  }
});

// ✅ PATCH: Subscribe client (MODIFIED)
router.patch('/:id/subscribe', async (req, res) => {
  const {
    client_id, executive_id, commodity, package_name, package_id,
    mrp, offered_price, subscription_start, subscription_duration_days,
    payment_mode, payment_reference, gst_option,
    name, mobile_number, payment_amount
  } = req.body;
  const { id } = req.params; // This is follow_ups.id, used for converted_from_id

  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required in the request body.' });
  }

  try {
    // Insert into subscribed_clients
    await db.query(
      `INSERT INTO subscribed_clients (
         client_id, executive_id, commodity, package_name,
         mrp, offered_price, payment_amount, subscription_start,
         subscription_duration_days, payment_mode, payment_reference,
         gst_option, source_type, converted_from_table, converted_from_id,
         converted_on, name, mobile_number
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
         $12,'executive','follow_ups',$13, /* Source is follow_ups */
         CURRENT_TIMESTAMP,$14,$15
       )`,
      [
        client_id, executive_id, commodity, package_name,
        mrp, offered_price, payment_amount, subscription_start,
        subscription_duration_days, payment_mode, payment_reference,
        gst_option, id, name, mobile_number
      ]
    );

    // Insert into payments
    await db.query(
      `INSERT INTO payments (
         client_id, executive_id, full_name, mobile_number,
         package_name, package_id, payment_amount, invoice_number,
         payment_date, payment_mode, gst_option, mode_of_service,
         transaction_ref, commodity, remarks, duration_days, is_free
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
         $13,$14,'', $15,false
       )`,
      [
        client_id, executive_id, name, mobile_number,
        package_name, package_id, payment_amount, payment_reference,
        subscription_start, payment_mode, gst_option, 'WhatsApp',
        payment_reference, commodity, subscription_duration_days
      ]
    );

    // Mark all follow-ups for this client_id as dropped
    await db.query(`UPDATE follow_ups SET is_dropped = true WHERE client_id = $1`, [client_id]);
    
    // Mark all trial_followups for this client_id as dropped
    await db.query(`UPDATE trial_followups SET is_dropped = true WHERE client_id = $1`, [client_id]);

    res.json({ success: true, message: 'Client subscribed successfully' });
  } catch (err) {
    console.error('❌ Subscription error (from follow_ups):', err.message);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// ✅ PATCH: Unsubscribe client
router.patch('/:id/unsubscribe', async (req, res) => {
  const { id } = req.params;
  const {
    client_id, executive_id, reason, remarks,
    name, customer_name, mobile_number // customer_name from original, name for consistency
  } = req.body;

  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required in the request body.' });
  }
  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required in the request body.' });
  }


  try {
    await db.query(
      `INSERT INTO unsubscribed_clients (
         client_id, executive_id, name, mobile_number,
         reason, remarks, unsubscribed_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
       )`,
      [
        client_id,
        executive_id,
        name || customer_name || '', 
        mobile_number || '',
        reason || 'Other',
        remarks || ''
      ]
    );

    // Mark all follow-ups for this client_id as dropped
    await db.query(`UPDATE follow_ups SET is_dropped = true WHERE client_id = $1`, [client_id]);
    // Mark all trial_followups for this client_id as dropped
    await db.query(`UPDATE trial_followups SET is_dropped = true WHERE client_id = $1`, [client_id]);


    res.json({ success: true, message: 'Client unsubscribed successfully' });
  } catch (err) {
    console.error('❌ Unsubscribe error (from follow_ups):', err.message);
    res.status(500).json({ error: 'Unsubscribe failed' });
  }
});

module.exports = router;
// --- END OF FILE executiveFollowUps.js ---