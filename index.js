// index.js – FINAL with logging + CORS + test route debug
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS middleware
app.use(cors({
  origin: ['https://commoditiescontrolcrm.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Preflight fallback for Render
app.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

// ✅ Debug every request path
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming: ${req.method} ${req.path}`);
  next();
});

// ✅ Body parsing
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

// ✅ Health check
app.get('/', (req, res) => {
  res.status(200).send('🚀 CRM Backend Running!');
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ✅ Render-compatible port binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS Origins: https://commoditiescontrolcrm.netlify.app, http://localhost:3000`);
});

app.get('/test-direct', (req, res) => {
  res.send('✅ Direct test route hit');
});
