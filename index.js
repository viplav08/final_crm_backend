const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow local + Netlify frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://commoditiescontrolcrm.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from this origin'), false);
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ Route imports
const customerRoutes = require('./routes/customer');
const dashboardSummary = require('./routes/dashboardSummary');
const pendingPayments = require('./routes/pendingPayments');
const approvePayment = require('./routes/approvePayment');
const rejectPayment = require('./routes/rejectPayment');
const submitPayment = require('./routes/submitPayment');
const assignedClients = require('./routes/assignedClients');
const executiveFollowUps = require('./routes/executiveFollowUps');
const paymentRoutes = require('./routes/payments');
const packageRoutes = require('./routes/packages');
const authRoutes = require('./routes/auth');
const trialFollowUpsRoutes = require('./routes/trialFollowups');
const dashboardRoutes = require('./routes/dashboard');

// ✅ Route bindings
app.use('/api/customer', customerRoutes);
app.use('/api/dashboard', dashboardSummary); // dashboard summary
app.use('/api/admin', pendingPayments);
app.use('/api/admin', approvePayment);
app.use('/api/admin', rejectPayment);
app.use('/api/customer', submitPayment);
app.use('/api/customer', assignedClients);
app.use('/api/followups', executiveFollowUps);
app.use('/api/payments', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trial-followups', trialFollowUpsRoutes);
app.use('/api/dashboard', dashboardRoutes); // main dashboard

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running Successfully!');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
