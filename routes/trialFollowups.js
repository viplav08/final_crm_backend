// routes/trialFollowups.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ GET: Trial follow-ups for a specific executive
router.get("/", async (req, res) => {
  const { executive_id } = req.query;

  if (!executive_id) {
    return res.status(400).json({ error: "executive_id is required" });
  }

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

// ✅ PATCH: Update follow-up outcome
router.patch("/:id", async (req, res) => {
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
    const trialRes = await pool.query("SELECT * FROM trial_followups WHERE id = $1", [id]);
    const data = trialRes.rows[0];
    if (!data) return res.status(404).json({ error: "Trial record not found" });

    const now = new Date();
    const o = outcome?.toLowerCase();

    // 🔁 Handle "follow up"
    if (o === "follow up") {
      if (!client_id || !executive_id) {
        return res.status(400).json({ error: "Missing client_id or executive_id" });
      }

      const custCheck = await pool.query("SELECT id FROM customer_profiles WHERE id = $1", [client_id]);
      if (custCheck.rows.length === 0) {
        return res.status(404).json({ error: "Customer profile not found for follow-up" });
      }

      const mrpInt = Math.round(Number(mrp) || 0);
      const offeredInt = Math.round(Number(offered_price) || 0);
      const nextDate = follow_up_date ? new Date(follow_up_date) : now;

      await pool.query(
        `INSERT INTO follow_ups (
           client_id, executive_id, package_name, mrp,
           offered_price, follow_up_date, outcome, remarks, created_at
         ) VALUES (
           $1, $2, $3, $4,
           $5, $6, 'Follow up', $7, $8
         )`,
        [
          client_id,
          executive_id,
          package_name || "Unknown Package",
          mrpInt,
          offeredInt,
          nextDate,
          remarks || "Auto-follow-up from trial",
          now
        ]
      );

      await pool.query(
        "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
        [outcome, remarks, id]
      );

      return res.json({ success: true, movedTo: "follow_ups" });
    }

    // 🔁 All other outcomes: just update status and remarks
    await pool.query(
      "UPDATE trial_followups SET status = $1, remarks = $2 WHERE id = $3",
      [outcome, remarks, id]
    );
    return res.json({ success: true, updated: true });
  } catch (err) {
    console.error("Update trial error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
