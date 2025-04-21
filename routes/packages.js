// routes/packages.js
const express = require("express");
const pool    = require("../db");

const router = express.Router();

// GET all packages
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM packages");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all packages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET packages by commodity
router.get("/:commodity", async (req, res) => {
  try {
    const { commodity } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM packages WHERE commodity = $1",
      [commodity]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching packages by commodity:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
