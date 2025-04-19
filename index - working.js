const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const customerRoutes = require('./routes/customer');
const dashboardSummary = require('./routes/dashboardSummary');
const pendingPayments = require('./routes/pendingPayments');
const approvePayment = require('./routes/approvePayment');
const rejectPayment = require('./routes/rejectPayment');
const submitPayment = require('./routes/submitPayment');
const assignedClients = require('./routes/assignedClients');
const executiveFollowUps = require('./routes/executiveFollowUps');
const paymentRoutes = require('./routes/payments');
const packageRoutes = require('./routes/packages'); // ✅ Correct package route
const authRoutes = require('./routes/auth');         // ✅ Add this


// Route usage
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardSummary);
app.use('/api/admin', pendingPayments);
app.use('/api/admin', approvePayment);
app.use('/api/admin', rejectPayment);
app.use('/api/customer', submitPayment);
app.use('/api/customer', assignedClients);
app.use('/api/followups', executiveFollowUps);
app.use('/api/payments', paymentRoutes);
app.use('/api/packages', packageRoutes); // ✅ This enables GET /api/packages
app.use('/api/auth', authRoutes);                    // ✅ Mounts the login route


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
