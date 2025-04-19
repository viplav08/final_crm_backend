import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ✅ GET all packages (used for Commodity & Package dropdowns)
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
      business_name, business_type, gst_number, package_name, commodity,
      mrp, offered_price, subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive, follow_up_date, trial_days
    } = req.body;

    const created_at = new Date();

    // 🔹 Save customer
    const customerInsert = `
      INSERT INTO customer_profiles (
        full_name, mobile_number, email, location, state,
        business_name, business_type, gst_number,
        package_name, commodity, mrp, offered_price,
        subscription_duration, subscription_status,
        interest_status, remarks, assigned_executive,
        follow_up_date, trial_days, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14,
        $15, $16, $17,
        $18, $19, $20
      ) RETURNING id
    `;

    const customerValues = [
      full_name, mobile_number, email, location, state,
      business_name, business_type, gst_number,
      package_name, commodity, mrp, offered_price,
      subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive,
      follow_up_date, trial_days, created_at
    ];

    const customerResult = await pool.query(customerInsert, customerValues);
    const customerId = customerResult.rows[0].id;

    // 🔍 Resolve executive ID
    let executiveId = parseInt(assigned_executive);
    if (isNaN(executiveId)) {
      const execRes = await pool.query('SELECT id FROM executives WHERE name = $1 LIMIT 1', [assigned_executive]);
      if (execRes.rows.length > 0) {
        executiveId = execRes.rows[0].id;
      } else {
        const dummyEmail = assigned_executive.toLowerCase().replace(/\s+/g, '_') + '@cc.com';
        const insertExec = await pool.query(
          'INSERT INTO executives (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [assigned_executive, dummyEmail, 'autogen', 'executive']
        );
        executiveId = insertExec.rows[0].id;
      }
    }

    // ✅ Route to follow_ups if interest_status is 'Follow up'
    if (interest_status?.toLowerCase() === 'follow up') {
      await pool.query(`
        INSERT INTO follow_ups (
          client_id, executive_id, follow_up_date, outcome, remarks, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        customerId,
        executiveId,
        follow_up_date || created_at,
        'Follow up',
        remarks || 'Auto-generated from profile form',
        created_at
      ]);
      console.log(`✅ Follow-up created for client ${customerId}`);
    }

    // ✅ Route to trial_followups if subscription_status is 'Trial'
    if (subscription_status?.toLowerCase() === 'trial') {
      await pool.query(`
        INSERT INTO trial_followups (
          client_id, executive_id, name, mobile_number, commodity,
          package_name, mrp, offered_price, trial_days, gst_option,
          follow_up_date, status, remarks, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, 'Trial', $12, $13
        )
      `, [
        customerId,
        executiveId,
        full_name,
        mobile_number,
        commodity,
        package_name,
        mrp,
        offered_price,
        trial_days || 15,
        'With GST',
        follow_up_date || created_at,
        remarks || 'Auto-generated from profile form',
        created_at
      ]);
      console.log(`✅ Trial follow-up created for client ${customerId}`);
    }

    res.status(201).json({ message: 'Customer profile saved and routed successfully.' });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
