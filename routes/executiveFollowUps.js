// routes/executiveFollowUps.js
router.get('/', async (req, res) => {
  const { executive_id } = req.query;
  if (!executive_id) return res.status(400).json({ error: 'executive_id is required' });

  try {
    const result = await pool.query(`
      SELECT 
        id,
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
      FROM follow_ups
      WHERE executive_id = $1
      ORDER BY created_at DESC
    `, [executive_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
