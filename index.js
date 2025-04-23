// index.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// —— CORS Setup —— 
const allowedOrigins = [
  'http://localhost:5173',
  'https://commoditiescontrolcrm.netlify.app'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// —— JSON Body Parser —— 
app.use(express.json());

// —— Route Imports —— 
const authRoutes          = require('./routes/auth');
const packageRoutes       = require('./routes/packages');
const customerRoutes      = require('./routes/customer');
const submitPayment       = require('./routes/submitPayment');
const assignedClients     = require('./routes/assignedClients');
const executiveFollowUps  = require('./routes/executiveFollowUps');
const trialFollowups      = require('./routes/trialFollowups');
const paymentRoutes       = require('./routes/payments');
const dashboardSummary    = require('./routes/dashboardSummary');
const mainDashboard       = require('./routes/dashboard');
const pendingPayments     = require('./routes/pendingPayments');
const approvePayment      = require('./routes/approvePayment');
const rejectPayment       = require('./routes/rejectPayment');

// —— Mount Routers —— 
app.use('/api/auth',               authRoutes);
app.use('/api/packages',           packageRoutes);
app.use('/api/customer',           customerRoutes);
app.use('/api/customer/submit',    submitPayment);
app.use('/api/customer/assigned',  assignedClients);
app.use('/api/followups',          executiveFollowUps);
app.use('/api/trial-followups',    trialFollowups);
app.use('/api/payments',           paymentRoutes);
app.use('/api/dashboard/summary',  dashboardSummary);
app.use('/api/dashboard',          mainDashboard);
app.use('/api/admin/pending',      pendingPayments);
app.use('/api/admin/approve',      approvePayment);
app.use('/api/admin/reject',       rejectPayment);

// —— Health Check —— 
app.get('/', (req, res) => res.send('🚀 CRM Backend Running Successfully!'));

// —— Start Server —— 
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
