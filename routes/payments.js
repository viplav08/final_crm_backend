// routes/payments.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Or your db connection variable

// GET /api/payments - Fetch payments with period and executive filtering
router.get('/', async (req, res) => {
  const { executive_id, period = 'today' } = req.query;

  if (!executive_id) {
    return res.status(400).json({ error: 'executive_id is required' });
  }

  let dateFilterClause = '';
  const queryParams = [executive_id];

  switch (period) {
    case 'today':
      dateFilterClause = `AND payment_date >= CURRENT_DATE AND payment_date < (CURRENT_DATE + INTERVAL '1 day')`;
      break;
    case 'week':
      dateFilterClause = `AND payment_date >= date_trunc('week', CURRENT_DATE) AND payment_date < (date_trunc('week', CURRENT_DATE) + INTERVAL '1 week')`;
      break;
    case 'month':
      dateFilterClause = `AND payment_date >= date_trunc('month', CURRENT_DATE) AND payment_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')`;
      break;
    case 'all':
      dateFilterClause = '';
      break;
    default:
      console.warn(`Unrecognized period: ${period}, defaulting to today.`);
      dateFilterClause = `AND payment_date >= CURRENT_DATE AND payment_date < (CURRENT_DATE + INTERVAL '1 day')`;
      break;
  }

  try {
    const query = `
      SELECT 
        id AS payment_id, -- ***** THIS IS THE FIX *****
        payment_date, 
        mobile_number, 
        full_name, 
        commodity, 
        package_name, 
        payment_amount,
        is_free,
        invoice_number 
      FROM payments 
      WHERE executive_id = $1 
      ${dateFilterClause}
      ORDER BY payment_date DESC, id DESC -- Order by original 'id' if payment_id is an alias
    `;

    const result = await pool.query(query, queryParams);
    
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
    console.error('❌ Error fetching payments:', error.message); // This will now show other errors if they occur
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/payments/add (Your existing endpoint - keep it as is)
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

    if (!executive_id || !payment_amount || !payment_date || !full_name || !mobile_number) {
        return res.status(400).json({ error: 'Missing required payment fields.' });
    }

    const query = `
      INSERT INTO payments (
        client_id, executive_id, payment_mode, payment_amount, payment_date, invoice_number,
        is_free, mobile_number, package_id, package_name, mode_of_service, full_name,
        gst_option, remarks, duration_days, transaction_ref, commodity, captured_at -- Renamed created_at to captured_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, NOW() 
      )
      RETURNING * 
    `;
    // In RETURNING *, it will return 'id', not 'payment_id'. If frontend needs payment_id from POST, you'd alias here too or adjust frontend.
    // For now, the GET request is the primary concern for display.

    const values = [
      client_id, executive_id, payment_mode, payment_amount, payment_date, invoice_number,
      is_free, mobile_number, package_id, package_name, mode_of_service, full_name,
      gst_option, remarks, duration_days, transaction_ref, commodity
    ];

    const result = await pool.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Payment add error:', error.message);
    res.status(500).json({ error: 'Failed to add payment. ' + error.message });
  }
});


module.exports = router;