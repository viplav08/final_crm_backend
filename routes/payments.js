// routes/payments.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Or your db connection variable

// GET /api/payments - Fetch payments with period and executive filtering
router.get('/', async (req, res) => {
  const { executive_id, period = 'today' } = req.query; // Default to 'today'

  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required' });
  }

  let dateFilterClause = '';
  const queryParams = [executive_id];

  // Construct the date filter clause based on the period
  // Assumes payment_date is stored as DATE or TIMESTAMP
  switch (period) {
    case 'today':
      dateFilterClause = `AND payment_date >= CURRENT_DATE AND payment_date < (CURRENT_DATE + INTERVAL '1 day')`;
      break;
    case 'week':
      // For PostgreSQL, date_trunc('week', ...) gives the start of the week (Monday)
      dateFilterClause = `AND payment_date >= date_trunc('week', CURRENT_DATE) AND payment_date < (date_trunc('week', CURRENT_DATE) + INTERVAL '1 week')`;
      break;
    case 'month':
      dateFilterClause = `AND payment_date >= date_trunc('month', CURRENT_DATE) AND payment_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')`;
      break;
    case 'all': // Optional: to fetch all payments for the executive
      dateFilterClause = '';
      break;
    default: // Default to today if period is unrecognized
      console.warn(`Unrecognized period: ${period}, defaulting to today.`);
      dateFilterClause = `AND payment_date >= CURRENT_DATE AND payment_date < (CURRENT_DATE + INTERVAL '1 day')`;
      break;
  }

  try {
    const query = `
      SELECT 
        payment_id, -- Assuming you have a primary key like payment_id
        payment_date, 
        mobile_number, 
        full_name, 
        commodity, 
        package_name, 
        payment_amount,
        is_free, -- This can be used for the 'STATUS' column
        invoice_number -- Useful for keying in React and reference
      FROM payments 
      WHERE executive_id = $1 
      ${dateFilterClause}
      ORDER BY payment_date DESC, payment_id DESC
    `;

    const result = await pool.query(query, queryParams);
    
    // Calculate summary for the fetched (filtered) payments
    const totalAmount = result.rows.reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0);
    const totalCount = result.rows.length;

    res.status(200).json({
      payments: result.rows,
      summary: {
        totalCount,
        totalAmount,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching payments:', error.message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});


// POST /api/payments/add (Your existing endpoint)
router.post('/add', async (req, res) => {
  try {
    const {
      client_id,
      executive_id,
      payment_mode,
      payment_amount,
      payment_date,
      invoice_number,
      is_free = false,
      mobile_number,
      package_id,
      package_name,
      mode_of_service,
      full_name,
      gst_option,
      remarks,
      duration_days,
      transaction_ref,
      commodity
    } = req.body;

    // Basic validation (can be expanded)
    if (!executive_id || !payment_amount || !payment_date || !full_name || !mobile_number) {
        return res.status(400).json({ error: 'Missing required payment fields.' });
    }

    const query = `
      INSERT INTO payments (
        client_id, executive_id, payment_mode, payment_amount, payment_date, invoice_number,
        is_free, mobile_number, package_id, package_name, mode_of_service, full_name,
        gst_option, remarks, duration_days, transaction_ref, commodity, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, NOW()
      )
      RETURNING *
    `;

    const values = [
      client_id, executive_id, payment_mode, payment_amount, payment_date, invoice_number,
      is_free, mobile_number, package_id, package_name, mode_of_service, full_name,
      gst_option, remarks, duration_days, transaction_ref, commodity
    ];

    const result = await pool.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Payment add error:', error.message);
    // Send a more user-friendly error or detailed one based on environment
    res.status(500).json({ error: 'Failed to add payment. ' + error.message });
  }
});

module.exports = router;