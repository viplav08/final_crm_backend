// === routes/trialFollowups.js ===
import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { executive_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM trial_followups WHERE executive_id = $1 AND is_dropped = false ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Trial fetch error:", err);
    res.status(500).json({ error: "Failed to fetch trial followups" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    outcome, remarks, payment_mode, payment_reference,
    client_id, executive_id, name, mobile_number,
    commodity, package_name, mrp, offered_price,
    follow_up_date, subscription_start, subscription_duration_days,
    payment_amount, gst_option
  } = req.body;

  const now = new Date();
  const o = outcome.toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM trial_followups WHERE id = $1", [id]);
    const trial = result.rows[0];
    if (!trial) return res.status(404).json({ error: "Trial not found" });

    if (o === "subscribed") {
      await pool.query(
        `INSERT INTO subscribed_clients (
          client_id, executive_id, commodity, package_name,
          mrp, offered_price, subscription_start, subscription_duration_days,
          payment_mode, payment_reference, gst_option, source_type,
          converted_from_table, converted_from_id, converted_on,
          mobile_number, name, payment_amount
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'executive','trial_followups',$12,NOW(),$13,$14,$15)`,
        [client_id, executive_id, commodity, package_name, mrp, offered_price, subscription_start,
         subscription_duration_days, payment_mode, payment_reference, gst_option, id, mobile_number,
         name, payment_amount]
      );
      await pool.query("UPDATE trial_followups SET is_dropped = true WHERE id = $1", [id]);
      return res.json({ success: true });
    }

    if (o === "unsubscribed") {
      await pool.query(
        `INSERT INTO unsubscribed_clients (client_id, executive_id, reason, remarks, name, mobile_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [client_id, executive_id, outcome, remarks, name, mobile_number]
      );
      await pool.query("UPDATE trial_followups SET is_dropped = true WHERE id = $1", [id]);
      return res.json({ success: true });
    }

    if (o === "follow up") {
      await pool.query(
        `INSERT INTO follow_ups (
          client_id, executive_id, follow_up_date, outcome,
          remarks, created_at, customer_name, mobile,
          commodity, package_name, mrp, offered_price,
          gst_option, trial_days, is_dropped
        ) VALUES (
          $1, $2, $3, 'Follow up',
          $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, false
        )`,
        [client_id, executive_id, follow_up_date || now,
         remarks || "From Trial", now, name || trial.name, mobile_number || trial.mobile_number,
         commodity || trial.commodity, package_name || trial.package_name, Math.round(mrp || trial.mrp),
         Math.round(offered_price || trial.offered_price), gst_option || trial.gst_option,
         trial.trial_days || 15]
      );

      await pool.query("UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3", [outcome, remarks, id]);
      return res.json({ success: true });
    }

    res.status(400).json({ error: "Invalid outcome" });
  } catch (err) {
    console.error("Trial PATCH error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
