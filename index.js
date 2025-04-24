// index.js – Final Render + Netlify CORS-Compatible Version
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS SETUP (Placed BEFORE everything else)
app.use(cors({
  origin: ['https://commoditiescontrolcrm.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Preflight support for all routes
app.options('*', cors());

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Route imports
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const trialFollowups = require('./routes/trialFollowups');

// ✅ Route mounting
app.use('/api/customer', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trial-followups', trialFollowups);

// ✅ Health check
app.get('/', (req, res) => {
  res.status(200).send('🚀 CRM Backend Running!');
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ✅ Port binding (CRUCIAL for Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed origins: https://commoditiescontrolcrm.netlify.app, http://localhost:3000`);
});
