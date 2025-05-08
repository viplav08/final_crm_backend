// --- START OF FILE index.js ---

import express from 'express';
import cors from 'cors';

// Route Imports
import customerRoutes from './routes/customer.js';
import dashboardSummary from './routes/dashboardSummary.js'; // Should contain '/summary' route internally
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
import dashboardRoutes from './routes/dashboard.js'; // For Executive Dashboard (expects GET /)
import subscribedClientsRoutes from './routes/subscribedClients.js'; // <<<--- Added Import

const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://commoditiescontrolcrm.netlify.app',
  'http://localhost:3000', // Common React dev port
  'http://localhost:5173', // Common Vite dev port
];

// CORS Configuration
// Preflight handling first
app.options('*', cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'executive-id'], // Added executive-id if used
}));

// Main CORS middleware
app.use(cors({
   origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'executive-id'], // Added executive-id if used
}));


// Body Parsing Middleware
app.use(express.json());

// --- Route Mounting ---

// Authentication
app.use('/api/auth', authRoutes);

// Customer & Executive specific actions
app.use('/api/customer', customerRoutes);
app.use('/api/customer', submitPayment); // Submit payment is a customer action? Or move to /payments?
app.use('/api/customer', assignedClients); // Getting clients for an executive

// Follow-ups (Trial & Regular)
app.use('/api/followups', executiveFollowUps);
app.use('/api/trial-followups', trialFollowupsRoutes);

// Subscribed Clients (New)
app.use('/api/subscribed-clients', subscribedClientsRoutes); // <<<--- Added Route Mounting

// Payments
app.use('/api/payments', paymentRoutes);

// Packages (General Resource)
app.use('/api/packages', packageRoutes);

// Admin specific actions
app.use('/api/admin', pendingPayments);
app.use('/api/admin', approvePayment);
app.use('/api/admin', rejectPayment);

// Dashboards
// IMPORTANT: Mount the one with more specific sub-routes FIRST if they share a base path
// Assuming dashboardSummary internally handles '/summary' and dashboardRoutes handles '/'
app.use('/api/dashboard', dashboardSummary); // Handles requests to /api/dashboard/summary
app.use('/api/dashboard', dashboardRoutes);  // Handles requests to /api/dashboard?executive_id=...

// Root health check
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running Successfully!');
});

// Basic Error Handling Middleware (Optional but Recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// --- END OF FILE index.js ---