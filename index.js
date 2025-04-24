const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Apply CORS globally
app.use(cors({
  origin: ['https://commoditiescontrolcrm.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Fallback for OPTIONS preflight that sometimes fails on Render
app.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

// ✅ Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Import routes
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const trialFollowups = require('./routes/trialFollowups');

// ✅ Mount routes
app.use('/api/customer', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trial-followups', trialFollowups);

// ✅ Root route for health check
app.get('/', (req, res) => {
  res.status(200).send('🚀 CRM Backend Running!');
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ✅ Start server (needed for Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed origins: https://commoditiescontrolcrm.netlify.app, http://localhost:3000`);
});
