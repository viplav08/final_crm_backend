import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 📦 Fetch all package options
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// 📜 Fetch customer history by mobile number
router.get('/history/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const result = await pool.query(
      'SELECT * FROM customer_profiles WHERE mobile_number = $1 ORDER BY created_at DESC',
      [mobile]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customer history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 🧾 Save customer profile and auto-insert trial follow-up if needed
router.post('/customers', async (req, res) => {
  const {
    full_name, mobile_number, email, location, state,
    business_name, business_type, gst_number, commodity,
    package_name, mrp, offered_price, subscription_duration,
    subscription_status, trial_days, interest_status, follow_up_date, remarks
  } = req.body;

  const executiveId = req.headers['executive-id'];
  if (!executiveId) return res.status(400).json({ error: 'Executive ID header is required' });

  try {
    const created_at = new Date();

    // 1️⃣ Insert into customer_profiles
    const insertResult = await pool.query(
      `INSERT INTO customer_profiles (
        full_name, mobile_number, email, location, state,
        business_name, business_type, gst_number, commodity,
        package_name, mrp, offered_price, subscription_duration,
        subscription_status, interest_status, follow_up_date, remarks,
        assigned_executive, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20
      ) RETURNING id`,
      [
        full_name, mobile_number, email, location, state,
        business_name, business_type, gst_number, commodity,
        package_name, mrp, offered_price, subscription_duration,
        subscription_status, interest_status,
        follow_up_date ? new Date(follow_up_date) : null,
        remarks, executiveId, created_at
      ]
    );

    const customerId = insertResult.rows[0].id;

    // 2️⃣ If status is Trial, insert into trial_followups
    if (subscription_status === 'Trial') {
      const gst_option = gst_number?.trim() ? 'With GST' : 'Without GST';

      await pool.query(
        `INSERT INTO trial_followups (
          client_id, executive_id, name, mobile_number,
          commodity, package_name, mrp, offered_price,
          trial_days, gst_option, follow_up_date,
          status, remarks, created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
          'Trial',$12,$13
        )`,
        [
          customerId,
          executiveId,
          full_name,
          mobile_number,
          commodity,
          package_name,
          mrp,
          offered_price,
          trial_days || 15,
          gst_option,
          follow_up_date ? new Date(follow_up_date) : created_at,
          remarks || 'Auto-generated from profile form',
          created_at
        ]
      );
    }

    res.status(200).json({ success: true, customer_id: customerId });
  } catch (err) {
    console.error('Error saving customer:', err);
    res.status(500).json({ error: 'Failed to save customer profile' });
  }
});

export default router;
