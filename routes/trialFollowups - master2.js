
import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all active trial follow-ups
router.get("/", async (req, res) => {
  const { executive_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM trial_followups WHERE executive_id = $1 AND is_dropped = false ORDER BY created_at DESC",
      [executive_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH update for trial follow-up
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    outcome,
    remarks,
    payment_mode,
    payment_reference,
    follow_up_date,
    client_id,
    executive_id,
    commodity,
    package_name,
    mrp,
    offered_price
  } = req.body;

  try {
    const trialRes = await pool.query("SELECT * FROM trial_followups WHERE id = $1", [id]);
    const data = trialRes.rows[0];

    if (!data) {
      return res.status(404).json({ error: "Trial record not found" });
    }

    const now = new Date();

    if (outcome.toLowerCase() === "subscribed") {
      let name = data.name || null;
      let mobile = data.mobile_number || null;

      if ((!name || !mobile) && data.client_id) {
        const res = await pool.query(
          "SELECT full_name, mobile_number FROM customer_profiles WHERE id = $1",
          [data.client_id]
        );
        if (res.rows.length > 0) {
          name = name || res.rows[0].full_name;
          mobile = mobile || res.rows[0].mobile_number;
        }
      }

      await pool.query(
        `INSERT INTO subscribed_clients (
          client_id, executive_id, commodity, package_name, mrp, offered_price,
          subscription_duration_days, payment_mode, payment_reference,
          gst_option, source_type, converted_from_table, converted_from_id,
          mobile_number, name
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, 'executive', 'trial_followups', $11,
          $12, $13
        )`,
        [
          data.client_id, data.executive_id, data.commodity, data.package_name,
          data.mrp, data.offered_price,
          data.trial_days || 30, payment_mode, payment_reference,
          data.gst_option || 'With GST',
          data.id,
          mobile,
          name
        ]
      );

      await pool.query("UPDATE trial_followups SET is_dropped = true WHERE id = $1", [id]);
      await pool.query("DELETE FROM follow_ups WHERE client_id = $1", [data.client_id]);

      return res.json({ success: true, movedTo: "subscribed_clients" });
    }

    if (outcome.toLowerCase() === "unsubscribed") {
      await pool.query(
        `INSERT INTO unsubscribed_clients (client_id, executive_id, reason, remarks)
         VALUES ($1, $2, $3, $4)`,
        [
          data.client_id, data.executive_id,
          remarks?.split(" - ")[0] || "No reason", remarks
        ]
      );

      await pool.query("UPDATE trial_followups SET is_dropped = true WHERE id = $1", [id]);
      await pool.query("DELETE FROM follow_ups WHERE client_id = $1", [data.client_id]);

      return res.json({ success: true, movedTo: "unsubscribed_clients" });
    }

    if (outcome.toLowerCase() === "follow up") {
      if (!client_id || !executive_id) {
        return res.status(400).json({ error: "Missing client_id or executive_id" });
      }

      const customerCheck = await pool.query(
        "SELECT id FROM customer_profiles WHERE id = $1",
        [client_id]
      );
      if (customerCheck.rows.length === 0) {
        return res.status(404).json({ error: "Customer profile not found for follow-up" });
      }

      await pool.query(
        `INSERT INTO follow_ups (
          client_id, executive_id, commodity, package_name,
          mrp, offered_price, follow_up_date, outcome, remarks, created_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, 'Follow up', $8, $9
        )`,
        [
          client_id,
          executive_id,
          commodity || 'Unknown',
          package_name || 'Unknown Package',
          parseFloat(mrp) || 0,
          parseFloat(offered_price) || 0,
          follow_up_date || now,
          remarks || 'Auto-follow-up from trial',
          now
        ]
      );

      await pool.query(
        "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
        [outcome, remarks, id]
      );

      return res.json({ success: true, inserted: "follow_ups" });
    }

    // Default update
    await pool.query(
      "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
      [outcome, remarks, id]
    );

    res.json({ success: true, updated: true });

  } catch (err) {
    console.error("Update trial error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH to unsubscribe a client (specific route)
router.patch("/:id/unsubscribe", async (req, res) => {
  const { id } = req.params;
  const { client_id, executive_id, reason, remarks, name, mobile_number } = req.body;

  try {
    await pool.query(
      `INSERT INTO unsubscribed_clients (
        client_id, executive_id, reason, remarks, name, mobile_number
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [client_id, executive_id, reason, remarks, name, mobile_number]
    );

    await pool.query("UPDATE trial_followups SET is_dropped = true WHERE id = $1", [id]);
    await pool.query("DELETE FROM follow_ups WHERE client_id = $1", [client_id]);

    res.json({ success: true, message: "Client unsubscribed successfully." });
  } catch (err) {
    console.error("Unsubscribe route error:", err);
    res.status(500).json({ error: "Internal server error during unsubscribe" });
  }
});

export default router;
