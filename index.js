const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customer', require('./routes/customer'));
app.use('/api/dashboard', require('./routes/dashboardSummary'));
app.use('/api/admin', require('./routes/pendingPayments'));
app.use('/api/admin', require('./routes/approvePayment'));
app.use('/api/admin', require('./routes/rejectPayment'));
app.use('/api/customer', require('./routes/submitPayment'));
app.use('/api/customer', require('./routes/assignedClients'));
app.use('/api/followups', require('./routes/executiveFollowUps'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trial-followups', require('./routes/trialFollowups'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Basic root route
app.get('/', (req, res) => {
  res.send('CRM Backend Running ✅');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
