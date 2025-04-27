// index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Clean CORS Configuration
const allowedOrigins = [
  'https://commoditiescontrolcrm.netlify.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Automatic OPTIONS handling (no need for manual app.options)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Debug incoming request logs
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming: ${req.method} ${req.path}`);
  next();
});

// ✅ Test Route
app.get('/test-direct', (req, res) => {
  res.send('✅ Direct test route hit');
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS Origins: ${allowedOrigins.join(', ')}`);
});
