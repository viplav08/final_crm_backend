// === routes/executiveFollowUps.js ===
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all follow-up entries for an executive
router.get("/", async (req, res) => {
  const { executive_id } = req.query;
  if (!executive_id) return res.status(400).json({ error: "Executive ID required" });

  try {
    const result = await pool.query(
      `SELECT * FROM follow_ups WHERE executive_id = $1 AND is_dropped = false ORDER BY created_at DESC`,
      [executive_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch follow-ups error:", err);
    res.status(500).json({ error: "Failed to fetch follow-ups" });
  }
});

export default router;
