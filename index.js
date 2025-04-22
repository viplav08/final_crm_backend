import express from 'express';
import cors from 'cors';

import customerRoutes from './routes/customer.js';
import dashboardSummary from './routes/dashboardSummary.js';
import pendingPayments from './routes/pendingPayments.js';
import approvePayment from './routes/approvePayment.js';
import rejectPayment from './routes/rejectPayment.js';
import submitPayment from './routes/submitPayment.js';
import assignedClients from './routes/assignedClients.js';
import executiveFollowUps from './routes/executiveFollowUps.js';
import paymentRoutes from './routes/payments.js';
import packageRoutes from './routes/packages.js';
import authRoutes from './routes/auth.js';
import trialFollowUpsRoutes from './routes/trialFollowUps.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route usage
app.use('/api/customer', customerRoutes);
app.use('/api/dashboard', dashboardSummary);
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
app.use('/api/dashboard', dashboardRoutes);


// Start server (✅ compatible with Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
