// routes/trialFollowups.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ GET: Trial follow-ups for a specific executive
router.get("/", async (req, res) => {
  const { executive_id } = req.query;
  if (!executive_id) return res.status(400).json({ error: "executive_id is required" });

  try {
    const result = await pool.query(
      `SELECT * FROM trial_followups WHERE executive_id = $1 AND is_dropped = false ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ PATCH: Update status and optionally move to follow_ups
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    outcome,
    remarks,
    client_id,
    executive_id,
    package_name,
    mrp,
    offered_price,
    follow_up_date
  } = req.body;

  try {
    const trialRes = await pool.query("SELECT * FROM trial_followups WHERE id = $1", [id]);
    const data = trialRes.rows[0];
    if (!data) return res.status(404).json({ error: "Trial record not found" });

    const now = new Date();
    const o = outcome?.toLowerCase();

    if (o === "follow up") {
      const custCheck = await pool.query("SELECT id FROM customer_profiles WHERE id = $1", [client_id]);
      if (custCheck.rows.length === 0) return res.status(404).json({ error: "Customer not found" });

      await pool.query(
        `INSERT INTO follow_ups (
           client_id, executive_id, package_name, mrp,
           offered_price, follow_up_date, outcome, remarks, created_at,
           customer_name, mobile, commodity, gst_option, trial_days
         ) VALUES (
           $1, $2, $3, $4,
           $5, $6, 'Follow up', $7, $8,
           $9, $10, $11, $12, $13
         )`,
        [
          client_id,
          executive_id,
          package_name || data.package_name,
          Math.round(Number(mrp) || Number(data.mrp) || 0),
          Math.round(Number(offered_price) || Number(data.offered_price) || 0),
          follow_up_date || data.follow_up_date || now,
          remarks || "Auto follow-up",
          now,
          data.name,
          data.mobile_number,
          data.commodity,
          data.gst_option,
          data.trial_days
        ]
      );
    }

    await pool.query(
      "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
      [outcome, remarks, id]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Trial update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
