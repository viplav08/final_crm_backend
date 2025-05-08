// --- START OF FILE executiveFollowUps.js ---
// ... (other router methods like GET, POST, PATCH /:id/unsubscribe remain the same) ...

// ✅ PATCH: Subscribe client (MODIFIED)
router.patch('/:id/subscribe', async (req, res) => {
  const {
    client_id, executive_id, commodity, package_name, package_id, // Ensure package_id is passed if needed
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
        package_name, package_id, payment_amount, payment_reference, // Assuming payment_reference is used as invoice_number
        subscription_start, payment_mode, gst_option, 'WhatsApp', // Assuming default mode_of_service
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

// ... (router.patch('/:id/unsubscribe', ...) and module.exports remain the same) ...
// Ensure all parts of the file are included as per the original
// --- END OF FILE executiveFollowUps.js ---