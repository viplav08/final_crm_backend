
const express = require('express');
const router = express.Router();
const pool = require('../db');

// PATCH /api/admin/approve-payment/:id
router.patch('/approve-payment/:id', async (req, res) => {
  const id = req.params.id;
  const verified_by_admin = req.body.verified_by_admin || 'admin'; // placeholder
  try {
    await pool.query(
      `UPDATE customer_profiles
       SET payment_verified = 'Approved',
           verified_by_admin = $1,
           verified_at = NOW()
       WHERE id = $2`,
      [verified_by_admin, id]
    );
    res.json({ message: 'Payment approved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

module.exports = router;
