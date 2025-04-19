// routes/trialFollowups.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all active trial follow‑ups
router.get("/", async (req, res) => {
  const { executive_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT * 
         FROM trial_followups 
        WHERE executive_id = $1 
          AND is_dropped = false 
     ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /:id — handle Subscribe / Unsubscribe / Follow‑Up for a trial
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    outcome,
    remarks,
    payment_mode,
    payment_reference,
    payment_amount,
    subscription_start,
    subscription_duration_days,
    gst_option,
    name: bodyName,
    mobile_number: bodyMobile
  } = req.body;

  try {
    // 1. Load the trial record
    const trialRes = await pool.query(
      "SELECT * FROM trial_followups WHERE id = $1",
      [id]
    );
    const data = trialRes.rows[0];
    if (!data) {
      return res.status(404).json({ error: "Trial record not found" });
    }

    // Normalize outcome
    const o = outcome.toLowerCase();

    // === Subscribed branch ===
    if (o === "subscribed") {
      // 2. Determine final name/mobile
      let finalName = bodyName || data.name || null;
      let finalMobile = bodyMobile || data.mobile_number || null;
      if ((!finalName || !finalMobile) && data.client_id) {
        const cust = await pool.query(
          "SELECT full_name, mobile_number FROM customer_profiles WHERE id = $1",
          [data.client_id]
        );
        if (cust.rows.length) {
          finalName = finalName || cust.rows[0].full_name;
          finalMobile = finalMobile || cust.rows[0].mobile_number;
        }
      }

      // 3. Other fallbacks
      const finalGst = gst_option || data.gst_option || "With GST";
      const finalDuration =
        subscription_duration_days != null
          ? subscription_duration_days
          : data.trial_days || 30;
      const finalStart = subscription_start || new Date();

      // 4. Insert into subscribed_clients, including payment_amount, start, duration
      await pool.query(
        `INSERT INTO subscribed_clients (
           client_id, executive_id, commodity, package_name, mrp, offered_price,
           subscription_duration_days, payment_amount, subscription_start,
           payment_mode, payment_reference, gst_option,
           source_type, converted_from_table, converted_from_id,
           mobile_number, name
         ) VALUES (
           $1,$2,$3,$4,$5,$6,
           $7,$8,$9,
           $10,$11,$12,
           'executive','trial_followups',$13,
           $14,$15
         )`,
        [
          data.client_id,
          data.executive_id,
          data.commodity,
          data.package_name,
          data.mrp,
          data.offered_price,
          finalDuration,
          payment_amount,
          finalStart,
          payment_mode,
          payment_reference,
          finalGst,
          data.id,
          finalMobile,
          finalName
        ]
      );

      // 5. Mark trial record dropped, and remove any follow_ups for this client
      await pool.query(
        "UPDATE trial_followups SET is_dropped = true WHERE id = $1",
        [id]
      );
      await pool.query(
        "DELETE FROM follow_ups WHERE client_id = $1",
        [data.client_id]
      );

      return res.json({ success: true, movedTo: "subscribed_clients" });
    }

    // === Unsubscribed branch ===
    if (o === "unsubscribed") {
      await pool.query(
        `INSERT INTO unsubscribed_clients (
           client_id, executive_id, reason, remarks, name, mobile_number
         ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          data.client_id,
          data.executive_id,
          remarks?.split(" - ")[0] || "No reason",
          remarks,
          data.name,
          data.mobile_number
        ]
      );
      await pool.query(
        "UPDATE trial_followups SET is_dropped = true WHERE id = $1",
        [id]
      );
      await pool.query(
        "DELETE FROM follow_ups WHERE client_id = $1",
        [data.client_id]
      );
      return res.json({ success: true, movedTo: "unsubscribed_clients" });
    }

    // === Follow‑Up branch ===
    if (o === "follow up") {
      const { client_id, executive_id, commodity, package_name, mrp, offered_price } = data;
      const followUpDate = req.body.follow_up_date || new Date();
      await pool.query(
        `INSERT INTO follow_ups (
           client_id, executive_id, commodity, package_name,
           mrp, offered_price, follow_up_date, outcome, remarks, created_at
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,'Follow up',$8,$9
         )`,
        [
          client_id,
          executive_id,
          commodity || "Unknown",
          package_name || "Unknown Package",
          mrp || 0,
          offered_price || 0,
          followUpDate,
          remarks || "Auto-follow-up from trial",
          new Date()
        ]
      );
      // keep the trial record but update its status/remarks
      await pool.query(
        "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
        [outcome, remarks, id]
      );
      return res.json({ success: true, movedTo: "follow_ups" });
    }

    // === default update ===
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

// Separate PATCH just for explicit “unsubscribe” if you prefer
router.patch("/:id/unsubscribe", async (req, res) => {
  const { id } = req.params;
  const { client_id, executive_id, reason, remarks, name, mobile_number } =
    req.body;
  try {
    await pool.query(
      `INSERT INTO unsubscribed_clients (
         client_id, executive_id, reason, remarks, name, mobile_number
       ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [client_id, executive_id, reason, remarks, name, mobile_number]
    );
    await pool.query(
      "UPDATE trial_followups SET is_dropped = true WHERE id = $1",
      [id]
    );
    await pool.query("DELETE FROM follow_ups WHERE client_id = $1", [
      client_id,
    ]);
    res.json({ success: true, message: "Client unsubscribed successfully." });
  } catch (err) {
    console.error("Unsubscribe route error:", err);
    res.status(500).json({ error: "Internal server error during unsubscribe" });
  }
});

export default router;
