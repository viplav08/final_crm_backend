
const express = require('express');
const router = express.Router();
const pool = require('../db');

// PATCH /api/customer/submit-payment/:id
router.patch('/submit-payment/:id', async (req, res) => {
  const id = req.params.id;
  const {
    offered_price,
    actual_amount_received,
    payment_mode,
    gst_included,
    payment_date,
    invoice_number,
    submitted_by
  } = req.body;

  try {
    await pool.query(
  `UPDATE customer_profiles
   SET offered_price = $1,
       actual_amount_received = $2,
       payment_mode = $3,
       gst_included = $4,
       payment_date = $5,
       invoice_number = $6,
       payment_verified = 'Pending',
       assigned_executive = $7
   WHERE id = $8`,
  [
    offered_price,
    actual_amount_received,
    payment_mode,
    gst_included,
    payment_date,
    invoice_number,
    submitted_by,
    id
  ]
);
    res.json({ message: 'Payment submitted successfully for review.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit payment.' });
  }
});

module.exports = router;
