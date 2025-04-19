// routes/customer.js
const express = require('express');
const pool    = require('../db');   // adjust to '../db.js' if your file is named db.js

const router = express.Router();

// ✅ GET all packages (for your dropdowns)
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching packages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ GET customer history by mobile number
router.get('/history/:mobile', async (req, res) => {
  const { mobile } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM customer_profiles WHERE mobile_number = $1 ORDER BY created_at DESC',
      [mobile]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ POST: Add new customer + route to follow_ups or trial_followups
router.post('/customers', async (req, res) => {
  try {
    const {
      full_name, mobile_number, email, location, state,
      business_name, business_type, gst_number,
      package_name, commodity, mrp, offered_price,
      subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive,
      follow_up_date, trial_days
    } = req.body;

    const created_at = new Date();

    // Insert into customer_profiles
    const insertText = `
      INSERT INTO customer_profiles (
        full_name, mobile_number, email, location, state,
        business_name, business_type, gst_number,
        package_name, commodity, mrp, offered_price,
        subscription_duration, subscription_status,
        interest_status, remarks, assigned_executive,
        follow_up_date, trial_days, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,
        $9,$10,$11,$12,
        $13,$14,
        $15,$16,$17,
        $18,$19,$20
      ) RETURNING id
    `;
    const values = [
      full_name, mobile_number, email, location, state,
      business_name, business_type, gst_number,
      package_name, commodity, mrp, offered_price,
      subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive,
      follow_up_date, trial_days, created_at
    ];
    const { rows } = await pool.query(insertText, values);
    const customerId = rows[0].id;

    // Resolve or create executive
    let executiveId = parseInt(assigned_executive);
    if (isNaN(executiveId)) {
      const execRes = await pool.query(
        'SELECT id FROM executives WHERE name = $1 LIMIT 1',
        [assigned_executive]
      );
      if (execRes.rows.length) {
        executiveId = execRes.rows[0].id;
      } else {
        const dummyEmail = assigned_executive
          .toLowerCase()
          .replace(/\s+/g, '_') + '@cc.com';
        const newExec = await pool.query(
          `INSERT INTO executives (name, email, password_hash, role)
           VALUES ($1,$2,$3,$4) RETURNING id`,
          [assigned_executive, dummyEmail, 'autogen', 'executive']
        );
        executiveId = newExec.rows[0].id;
      }
    }

    // Route to follow_ups if needed
    if (interest_status?.toLowerCase() === 'follow up') {
      await pool.query(
        `INSERT INTO follow_ups (
           client_id, executive_id, follow_up_date,
           outcome, remarks, created_at
         ) VALUES ($1,$2,$3,'Follow up',$4,$5)`,
        [
          customerId,
          executiveId,
          follow_up_date || created_at,
          remarks || 'Auto-generated from profile form',
          created_at
        ]
      );
    }

    // Route to trial_followups if needed
    if (subscription_status?.toLowerCase() === 'trial') {
      await pool.query(
        `INSERT INTO trial_followups (
           client_id, executive_id, name, mobile_number,
           commodity, package_name, mrp, offered_price,
           trial_days, gst_option, follow_up_date,
           status, remarks, created_at
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,'With GST',$10,'Trial',$11,$12
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
          follow_up_date || created_at,
          remarks || 'Auto-generated from profile form',
          created_at
        ]
      );
    }

    res.status(201).json({ message: 'Customer saved and routed successfully.' });
  } catch (error) {
    console.error('❌ Error saving customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

