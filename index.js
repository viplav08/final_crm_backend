// index.js
const express = require('express');
const cors = require('cors'); // Only declare this once
require('dotenv').config();

const app = express();

// —— Enhanced CORS Setup ——
const corsOptions = {
  origin: [
    'https://commoditiescontrolcrm.netlify.app',
    'http://localhost:3000' // For local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// —— Route Modules ——
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const trialFollowups = require('./routes/trialFollowups');
// ... other route imports ...

// —— Mount Routers ——
app.use(express.json()); // Parse JSON bodies
app.use('/api/customer', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trial-followups', trialFollowups);
// ... mount other routes ...

// —— Health Check ——
app.get('/', (req, res) => res.send('🚀 CRM Backend Running!'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));