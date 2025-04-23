// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// —— CORS Setup ——
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
  credentials: true
}));

// —— JSON Body Parser ——
app.use(express.json());

// —— Route Modules (all must use module.exports = router) ——
const customerRoutes      = require('./routes/customer');
const dashboardSummary    = require('./routes/dashboardSummary');
const pendingPayments     = require('./routes/pendingPayments');
const approvePayment      = require('./routes/approvePayment');
const rejectPayment       = require('./routes/rejectPayment');
const submitPayment       = require('./routes/submitPayment');
const assignedClients     = require('./routes/assignedClients');
const executiveFollowUps  = require('./routes/executiveFollowUps');
const paymentRoutes       = require('./routes/payments');
const packageRoutes       = require('./routes/packages');
const authRoutes          = require('./routes/auth');
const trialFollowups      = require('./routes/trialFollowups');
const mainDashboard       = require('./routes/dashboard');

// —— Mounting Routers ——
app.use('/api/customer',           customerRoutes);
app.use('/api/dashboard/summary',  dashboardSummary);
app.use('/api/admin/pending',      pendingPayments);
app.use('/api/admin/approve',      approvePayment);
app.use('/api/admin/reject',       rejectPayment);
app.use('/api/customer/submit',    submitPayment);
app.use('/api/customer/assigned',  assignedClients);
app.use('/api/followups',          executiveFollowUps);
app.use('/api/payments',           paymentRoutes);
app.use('/api/packages',           packageRoutes);
app.use('/api/auth',               authRoutes);
app.use('/api/trial-followups',    trialFollowups);
app.use('/api/dashboard',          mainDashboard);

// —— Health Check ——
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running Successfully!');
});

// —— Start Server ——
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
