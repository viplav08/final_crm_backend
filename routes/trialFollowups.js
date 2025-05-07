// routes/trialFollowups.js

const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ GET all trial follow-ups (only active)
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

// ✅ POST from trial tab into follow_ups
router.post("/submit-followup", async (req, res) => {
  const {
    client_id,
    executive_id,
    customer_name,
    mobile,
    commodity,
    package_name,
    mrp,
    offered_price,
    trial_days,
    gst_option,
    follow_up_date,
    outcome,
    remarks
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO follow_ups (
        client_id, executive_id, customer_name, mobile,
        commodity, package_name, mrp, offered_price,
        trial_days, gst_option, next_follow_up_date,
        outcome, remarks, is_dropped, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,false,NOW()
      ) RETURNING *`,
      [
        client_id,
        executive_id,
        customer_name,
        mobile,
        commodity,
        package_name,
        mrp,
        offered_price,
        trial_days,
        gst_option,
        new Date(follow_up_date),
        outcome,
        remarks
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error inserting follow-up from trial:", err.message);
    res.status(500).json({ error: "Failed to insert into follow_ups" });
  }
});

module.exports = router;
