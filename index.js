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
import trialFollowupsRoutes from './routes/trialFollowups.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

// ✅ Define allowed origins (Render + Local Dev)
const allowedOrigins = [
  'https://commoditiescontrolcrm.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

// ✅ Preflight handling (must be before routes)
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ PATCH added
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Route mounting
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
app.use('/api/trial-followups', trialFollowupsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ Root health check
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running Successfully!');
});

// ✅ Start server (Render-compatible port)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
