const express = require('express');
const router = express.Router();

// TEMP: Just to verify it's loading correctly
router.get('/', (req, res) => {
  res.json({ message: 'Trial Followups route is working ✅' });
});

module.exports = router;
