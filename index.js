const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// —— CORS Setup ——
const allowedOrigins = [
  'https://commoditiescontrolcrm.netlify.app', // Netlify frontend
  'http://localhost:3000',
  'http://localhost:5173'
];
console.log(`✅ Initializing CORS. Allowed Origins: ${allowedOrigins.join(', ')}`);

// ✅✅✅ Handle Preflight OPTIONS requests explicitly
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS Allowed] Origin: ${origin || 'N/A'}`);
      callback(null, true);
    } else {
      console.error(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// —— Request Parsers ——
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// —— Request Logger ——
app.use((req, res, next) => {
  console.log(`[Request Logger] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// —— Routers ——
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const trialFollowups = require('./routes/trialFollowups');

app.use('/api/customer', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trial-followups', trialFollowups);

// —— Test Routes ——
app.get('/test-direct', (req, res) => {
  res.send('✅ Direct test route (/test-direct) hit successfully!');
});

app.get('/test-cors', (req, res) => {
  res.json({ message: '✅ CORS test route (/test-cors) hit successfully!' });
});

app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running!');
});

// —— Global Error Handler ——
app.use((err, req, res, next) => {
  console.error("[Global Error Handler] Error:", err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

// —— Start Server ——
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS Middleware Active. Allowed Origins: ${allowedOrigins.join(', ')}`);
});
