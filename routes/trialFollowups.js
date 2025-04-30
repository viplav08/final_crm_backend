import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all trial follow-ups for an executive
router.get("/", async (req, res) => {
  const { executive_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM trial_followups
        WHERE executive_id = $1 AND is_dropped = false
        ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH: handle Subscribed / Unsubscribed / Follow up
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    outcome,
    remarks,
    payment_mode,
    payment_reference,
    client_id,
    executive_id,
    name,
    mobile_number,
    commodity,
    package_name,
    mrp,
    offered_price,
    follow_up_date,
    subscription_start,
    subscription_duration_days,
    payment_amount,
    gst_option
  } = req.body;

  const now = new Date();
  const o = outcome.toLowerCase();

  try {
    const trialRes = await pool.query("SELECT * FROM trial_followups WHERE id = $1", [id]);
    const trial = trialRes.rows[0];
    if (!trial) return res.status(404).json({ error: "Trial follow-up not found" });

    if (o === "subscribed") {
      await pool.query(
        `INSERT INTO subscribed_clients (
          client_id, executive_id, commodity, package_name,
          mrp, offered_price, payment_amount,
          subscription_start, subscription_duration_days,
          payment_mode, payment_reference, gst_option,
          source_type, converted_from_table, converted_from_id,
          converted_on, name, mobile_number
        ) VALUES (
          $1,$2,$3,$4,
          $5,$6,$7,
          $8,$9,$10,$11,$12,
          'executive','trial_followups',$13,
          CURRENT_TIMESTAMP,$14,$15
        )`,
        [
          client_id,
          executive_id,
          commodity || trial.commodity,
          package_name || trial.package_name,
          mrp || trial.mrp,
          offered_price || trial.offered_price,
          payment_amount || trial.offered_price,
          subscription_start || new Date(),
          subscription_duration_days || 30,
          payment_mode || 'Cash',
          payment_reference || '',
          gst_option || trial.gst_option,
          id,
          name || trial.name,
          mobile_number || trial.mobile_number,
        ]
      );

      await pool.query(`UPDATE trial_followups SET is_dropped = true WHERE id = $1`, [id]);
      return res.json({ success: true, message: "Client marked as subscribed" });
    }

    if (o === "unsubscribed") {
      await pool.query(
        `INSERT INTO unsubscribed_clients (
          client_id, executive_id, reason, remarks, name, mobile_number
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          client_id,
          executive_id,
          outcome,
          remarks || 'Not Interested',
          name || trial.name,
          mobile_number || trial.mobile_number,
        ]
      );

      await pool.query(`UPDATE trial_followups SET is_dropped = true WHERE id = $1`, [id]);
      return res.json({ success: true, message: "Client marked as unsubscribed" });
    }

    if (o === "follow up") {
      const nextDate = follow_up_date ? new Date(follow_up_date) : now;

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
        [
          client_id,
          executive_id,
          nextDate,
          remarks || "Auto-follow-up from trial",
          now,
          name || trial.name,
          mobile_number || trial.mobile_number,
          commodity || trial.commodity,
          package_name || trial.package_name,
          Math.round(mrp || trial.mrp),
          Math.round(offered_price || trial.offered_price),
          gst_option || trial.gst_option,
          trial.trial_days || 15,
        ]
      );

      await pool.query(
        "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
        [outcome, remarks || 'Converted to Follow Up', id]
      );

      return res.json({ success: true, movedTo: "follow_ups" });
    }

    // Default: update status and remarks only
    await pool.query(
      "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
      [outcome, remarks || '-', id]
    );
    res.json({ success: true, updated: true });

  } catch (err) {
    console.error("Update trial error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
