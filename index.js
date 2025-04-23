// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// — CORS setup — allow local dev + your Netlify front end
const allowedOrigins = [
  'http://localhost:5173',
  'https://commoditiescontrolcrm.netlify.app'
];
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'), false);
    }
  },
  credentials: true,
}));

app.use(express.json());

// — Route imports (all CommonJS, exporting `module.exports = router`) —
// Make sure these filenames exactly match what's on disk!
const customerRoutes       = require('./routes/customer');
const packageRoutes        = require('./routes/packages');
const authRoutes           = require('./routes/auth');
const trialFollowUpsRoutes = require('./routes/trialFollowups');
const execFollowUpsRoutes  = require('./routes/executiveFollowUps');
const dashboardSummary     = require('./routes/dashboardSummary');
const dashboardRoutes      = require('./routes/dashboard');
const pendingPayments      = require('./routes/pendingPayments');
const approvePayment       = require('./routes/approvePayment');
const rejectPayment        = require('./routes/rejectPayment');
const submitPayment        = require('./routes/submitPayment');
const assignedClients      = require('./routes/assignedClients');
const paymentRoutes        = require('./routes/payments');

// — Mounting routers — order doesn’t matter too much as long as paths don’t overlap
app.use('/api/customer',       customerRoutes);
app.use('/api/packages',       packageRoutes);
app.use('/api/auth',           authRoutes);
app.use('/api/trial-followups',trialFollowUpsRoutes);
app.use('/api/followups',      execFollowUpsRoutes);
app.use('/api/dashboard-summary', dashboardSummary);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/admin',          pendingPayments);
app.use('/api/admin',          approvePayment);
app.use('/api/admin',          rejectPayment);
app.use('/api/customer',       submitPayment);
app.use('/api/customer',       assignedClients);
app.use('/api/payments',       paymentRoutes);

// — Health check
app.get('/', (req, res) => res.send('🚀 CRM Backend Running Successfully!'));

// — Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
