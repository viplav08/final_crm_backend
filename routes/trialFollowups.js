// routes/trialFollowups.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ▶️ GET /api/executive/trial-follow-ups
//    List all “Trial” records for this executive
router.get('/', async (req, res) => {
  const execId = req.headers['executive-id'];
  if (!execId) {
    return res.status(400).json({ error: 'Executive ID header is required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT *
         FROM trial_followups
        WHERE executive_id = $1
          AND is_dropped = false
     ORDER BY created_at DESC`,
      [execId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ▶️ PATCH /api/executive/trial-follow-ups/:id
//    Update a trial record’s outcome—if “Follow up”, move into follow_ups
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    outcome,
    remarks,
    payment_mode,
    payment_reference,
    client_id,
    executive_id,
    package_name,
    mrp,
    offered_price,
    follow_up_date
  } = req.body;

  try {
    // 1) Fetch existing trial
    const trialRes = await pool.query(
      'SELECT * FROM trial_followups WHERE id = $1',
      [id]
    );
    const trial = trialRes.rows[0];
    if (!trial) {
      return res.status(404).json({ error: 'Trial record not found' });
    }

    const now = new Date();
    const o = outcome?.toLowerCase();

    // 2) If executive marks “Follow up”, insert into follow_ups table
    if (o === 'follow up') {
      if (!client_id || !executive_id) {
        return res.status(400).json({ error: 'Missing client_id or executive_id' });
      }

      // Verify customer exists
      const cust = await pool.query(
        'SELECT id FROM customer_profiles WHERE id = $1',
        [client_id]
      );
      if (cust.rows.length === 0) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      const mrpInt     = Math.round(Number(mrp) || Number(trial.mrp) || 0);
      const offeredInt = Math.round(Number(offered_price) || Number(trial.offered_price) || 0);
      const nextDate   = follow_up_date ? new Date(follow_up_date) : now;

      // Insert into follow_ups
      await pool.query(
        `INSERT INTO follow_ups (
           client_id, executive_id, package_name, mrp,
           offered_price, follow_up_date, outcome, remarks, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,'Follow up',$7,$8)`,
        [
          client_id,
          executive_id,
          package_name || trial.package_name,
          mrpInt,
          offeredInt,
          nextDate,
          remarks || 'Auto-follow-up from trial',
          now
        ]
      );

      // Update the trial record’s status & remarks
      await pool.query(
        'UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3',
        [outcome, remarks, id]
      );

      return res.json({ success: true, movedTo: 'follow-ups' });
    }

    // 3) Otherwise just update status & remarks on the trial record
    await pool.query(
      'UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3',
      [outcome, remarks, id]
    );
    res.json({ success: true, updated: true });
  } catch (err) {
    console.error('Update trial error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
