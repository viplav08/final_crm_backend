// ✅ POST new payment (used in SubscribedModal.jsx)
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
