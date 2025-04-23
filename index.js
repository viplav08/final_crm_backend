// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// —— CORS Setup ——
// Allow your local dev server and your Netlify frontend
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

// —— Route Modules ——
const customerRoutes      = require('./routes/customer');           // :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
const authRoutes          = require('./routes/auth');               // :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
const paymentRoutes       = require('./routes/payments');
const assignedClients     = require('./routes/assignedClients');
const executiveFollowUps  = require('./routes/executiveFollowUps'); // :contentReference[oaicite:4]{index=4}&#8203;:contentReference[oaicite:5]{index=5}
const trialFollowups      = require('./routes/trialFollowups');     // :contentReference[oaicite:6]{index=6}&#8203;:contentReference[oaicite:7]{index=7}
const packagesRoutes      = require('./routes/packages');           // :contentReference[oaicite:8]{index=8}&#8203;:contentReference[oaicite:9]{index=9}
const dashboardRoutes     = require('./routes/dashboard');          // :contentReference[oaicite:10]{index=10}&#8203;:contentReference[oaicite:11]{index=11}

// —— Mounting Routers ——
app.use('/api/auth',               authRoutes);
app.use('/api/customer',           customerRoutes);
app.use('/api/payments',           paymentRoutes);
app.use('/api/customer/assigned',  assignedClients);
app.use('/api/followups',          executiveFollowUps);
app.use('/api/trial-followups',    trialFollowups);
app.use('/api/packages',           packagesRoutes);
app.use('/api/dashboard',          dashboardRoutes);

// —— Health Check ——
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running Successfully!');
});

// —— Start Server ——
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
