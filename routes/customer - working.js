import express from 'express';
import pool from '../db.js'; // ✅ must include .js

const router = express.Router();

// GET all packages
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// GET customer history by mobile number
router.get('/history/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const result = await pool.query(
      'SELECT * FROM customer_profiles WHERE mobile_number = $1 ORDER BY created_at DESC',
      [mobile]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch customer history' });
  }
});

// POST new customer and follow-up
router.post('/customers', async (req, res) => {
  try {
    const {
      full_name, mobile_number, email, location, state,
      business_name, business_type, gst_number, package_name, commodity,
      mrp, offered_price, subscription_duration, subscription_status,
      interest_status, remarks, assigned_executive, follow_up_date, trial_days
    } = req.body;

    const created_at = new Date();

    // Insert customer profile
    const insertCustomerQuery = `
      INSERT INTO customer_profiles (
        full_name, mobile_number, email, location, state, business_name,
        business_type, gst_number, package_name, commodity, mrp, offered_price,
        subscription_duration, subscription_status, interest_status,
        remarks, assigned_executive, follow_up_date, trial_days, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING id
    `;

    const customerValues = [
      full_name, mobile_number, email, location, state, business_name,
      business_type, gst_number, package_name, commodity, mrp, offered_price,
      subscription_duration, subscription_status, interest_status,
      remarks, assigned_executive, follow_up_date, trial_days, created_at
    ];

    const result = await pool.query(insertCustomerQuery, customerValues);
    const customerId = result.rows[0].id;

    // 🔍 Debug follow-up eligibility
    console.log("🔍 Checking follow-up eligibility:", {
      interest_status,
      follow_up_date,
      assigned_executive
    });

    // If interest is "Follow up", add follow-up entry
    if (
      interest_status?.toLowerCase() === 'follow up' &&
      follow_up_date &&
      assigned_executive
    ) {
      let executiveId = parseInt(assigned_executive);

      if (isNaN(executiveId)) {
        const exec = await pool.query(
          'SELECT id FROM executives WHERE name = $1 LIMIT 1',
          [assigned_executive]
        );

        if (exec.rows.length > 0) {
          executiveId = exec.rows[0].id;
        } else {
          const dummyEmail = assigned_executive.toLowerCase().replace(/\s+/g, '_') + '@cc.com';
          const insertExec = await pool.query(
            'INSERT INTO executives (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [assigned_executive, dummyEmail, 'autogen', 'executive']
          );
          executiveId = insertExec.rows[0].id;
          console.log(`✅ Executive '${assigned_executive}' created with ID ${executiveId}`);
        }
      }

      if (executiveId) {
        await pool.query(
          `INSERT INTO follow_ups (
            client_id, executive_id, follow_up_date, outcome, remarks, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            customerId,
            executiveId,
            follow_up_date,
            'Followed Up',
            remarks || 'Auto-generated from profile form',
            created_at
          ]
        );
        console.log(`✅ Follow-up created for customer ${customerId} by executive ${executiveId}`);
      } else {
        console.warn('⚠️ Executive ID not resolved, follow-up skipped.');
      }
    } else {
      console.warn('🚫 Follow-up not created — missing required fields.', {
        interest_status,
        follow_up_date,
        assigned_executive
      });
    }

    res.status(201).json({ message: 'Customer and follow-up saved successfully.' });
  } catch (error) {
    console.error('❌ Error inserting customer or follow-up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
