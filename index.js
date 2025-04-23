// index.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// — CORS setup —
const allowedOrigins = [
  'http://localhost:5173',
  'https://commoditiescontrolcrm.netlify.app'
];
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

// — JSON parser —
app.use(express.json());

// — Route modules (all CommonJS) —
const customerRoutes     = require('./routes/customer');
const dashboardSummary   = require('./routes/dashboardSummary');
const pendingPayments    = require('./routes/pendingPayments');
const approvePayment     = require('./routes/approvePayment');
const rejectPayment      = require('./routes/rejectPayment');
const submitPayment      = require('./routes/submitPayment');
const assignedClients    = require('./routes/assignedClients');
const execFollowUps      = require('./routes/executiveFollowUps');
const paymentRoutes      = require('./routes/payments');
const packageRoutes      = require('./routes/packages');
const authRoutes         = require('./routes/auth');
const trialFollowups     = require('./routes/trialFollowups');    // exact filename match
const mainDashboard      = require('./routes/dashboard');

// — Mount routers —
app.use('/api/auth',               authRoutes);
app.use('/api/customer',           customerRoutes);
app.use('/api/dashboard/summary',  dashboardSummary);
app.use('/api/admin/pending',      pendingPayments);
app.use('/api/admin/approve',      approvePayment);
app.use('/api/admin/reject',       rejectPayment);
app.use('/api/customer/submit',    submitPayment);
app.use('/api/customer/assigned',  assignedClients);
app.use('/api/followups',          execFollowUps);
app.use('/api/payments',           paymentRoutes);
app.use('/api/packages',           packageRoutes);
app.use('/api/trial-followups',    trialFollowups);
app.use('/api/dashboard',          mainDashboard);

// — Health check —
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running Successfully!');
});

// — Start server —
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
