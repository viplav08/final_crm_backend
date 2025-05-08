// --- START OF FILE trialFollowups.js ---
const express = require("express");
const router = express.Router();
const pool = require("../db"); // Assuming 'pool' is your db connection, change to 'db' if that's what you use

// ✅ GET: Active trial follow-ups
router.get("/", async (req, res) => {
  const { executive_id } = req.query;

  if (!executive_id) {
    return res.status(400).json({ error: "executive_id is required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM trial_followups
       WHERE executive_id = $1 AND is_dropped = false
       ORDER BY created_at DESC`,
      [executive_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching trial follow-ups:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST: Trial → Follow-Up tab (CORRECTED LOGIC)
// When a follow-up is created from a trial, the original trial entry REMAINS ACTIVE.
// It only becomes inactive (is_dropped=true) if the client subscribes or unsubscribes.
router.post("/submit-followup", async (req, res) => {
  const {
    client_id,
    executive_id,
    customer_name, // Ensure frontend sends 'customer_name' or maps 'name' to this
    mobile,
    commodity,
    package_name,
    mrp,
    offered_price,
    trial_days, // This is from the original trial_followups entry
    gst_option,
    follow_up_date, // This is the *new* next_follow_up_date for the follow_ups table
    remarks          // Remarks for the new follow_ups entry
  } = req.body;

  if (!client_id || !executive_id || !customer_name || !mobile || !follow_up_date) {
    return res.status(400).json({ error: "Missing required fields for submitting follow-up." });
  }
  
  let parsedMrp = mrp !== null && mrp !== undefined && String(mrp).trim() !== '' ? parseFloat(mrp) : null;
  let parsedOfferedPrice = offered_price !== null && offered_price !== undefined && String(offered_price).trim() !== '' ? parseFloat(offered_price) : null;

  if ((mrp !== null && mrp !== undefined && String(mrp).trim() !== '' && isNaN(parsedMrp)) || 
      (offered_price !== null && offered_price !== undefined && String(offered_price).trim() !== '' && isNaN(parsedOfferedPrice))) {
    return res.status(400).json({ error: "Invalid MRP or Offered Price format." });
  }

  try {
    // Insert a NEW entry into follow_ups table
    const result = await pool.query(
      `INSERT INTO follow_ups (
        client_id, executive_id, customer_name, mobile,
        commodity, package_name, mrp, offered_price,
        trial_days, gst_option, next_follow_up_date,
        outcome, remarks, is_dropped, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11,
        'Follow up', $12, false, NOW() /* New follow-up is active */
      ) RETURNING *`,
      [
        client_id,
        executive_id,
        customer_name,
        mobile,
        commodity,
        package_name,
        parsedMrp,
        parsedOfferedPrice,
        trial_days ? parseInt(trial_days) : null, // trial_days from the original trial
        gst_option,
        new Date(follow_up_date), // The new follow-up date for this interaction
        remarks
      ]
    );

    // The original trial_followups entry is NOT marked as dropped here.
    // It remains active and visible.

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error inserting follow-up from trial:", err.message);
    res.status(500).json({ error: "Failed to insert into follow_ups" });
  }
});

// ✅ PATCH: Subscribe client from trial_followups
router.patch('/:id/subscribe', async (req, res) => {
  const {
    client_id, executive_id, commodity, package_name, package_id,
    mrp, offered_price, subscription_start, subscription_duration_days,
    payment_mode, payment_reference, gst_option,
    name, mobile_number, payment_amount
  } = req.body;
  const { id } = req.params; // This is trial_followups.id

  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required in the request body.' });
  }
  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required.' });
  }

  try {
    // Insert into subscribed_clients
    await pool.query(
      `INSERT INTO subscribed_clients (
         client_id, executive_id, commodity, package_name,
         mrp, offered_price, payment_amount, subscription_start,
         subscription_duration_days, payment_mode, payment_reference,
         gst_option, source_type, converted_from_table, converted_from_id,
         converted_on, name, mobile_number
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
         $12,'executive','trial_followups',$13, /* Source is trial_followups */
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
    await pool.query(
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
        subscription_start, payment_mode, gst_option, 'WhatsApp', // Default mode_of_service
        payment_reference, commodity, subscription_duration_days
      ]
    );

    // Mark ALL trial_followups for this client_id as dropped
    await pool.query(`UPDATE trial_followups SET is_dropped = true WHERE client_id = $1`, [client_id]);
    
    // Mark ALL regular follow-ups for this client_id as dropped
    await pool.query(`UPDATE follow_ups SET is_dropped = true WHERE client_id = $1`, [client_id]);

    res.json({ success: true, message: 'Client subscribed successfully from trial' });
  } catch (err) {
    console.error('❌ Subscription error (from trial_followups):', err.message);
    res.status(500).json({ error: 'Subscription from trial failed' });
  }
});

// ✅ PATCH: Unsubscribe client from trial_followups
router.patch('/:id/unsubscribe', async (req, res) => {
  const {
    client_id, executive_id, reason, remarks,
    name, mobile_number
  } = req.body;
  // const { id } = req.params; // id of the trial_followups record, not strictly needed for DB updates here but good for logging/context

  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required in the request body.' });
  }
  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required in the request body.' });
  }

  try {
    // Insert into unsubscribed_clients
    await pool.query(
      `INSERT INTO unsubscribed_clients (
         client_id, executive_id, name, mobile_number,
         reason, remarks, unsubscribed_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
       )`,
      [
        client_id, executive_id, name || '', mobile_number || '',
        reason || 'Other', remarks || ''
      ]
    );

    // Mark ALL trial_followups for this client_id as dropped
    await pool.query(`UPDATE trial_followups SET is_dropped = true WHERE client_id = $1`, [client_id]);
    // Mark ALL regular follow-ups for this client_id as dropped
    await pool.query(`UPDATE follow_ups SET is_dropped = true WHERE client_id = $1`, [client_id]);

    res.json({ success: true, message: 'Client unsubscribed successfully from trial' });
  } catch (err) {
    console.error('❌ Unsubscribe error (from trial_followups):', err.message);
    res.status(500).json({ error: 'Unsubscribe from trial failed' });
  }
});


module.exports = router;
// --- END OF FILE trialFollowups.js ---