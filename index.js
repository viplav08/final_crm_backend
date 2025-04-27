// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// —— CORS Setup ——
const allowedOrigins = [
  'https://commoditiescontrolcrm.netlify.app', // Your Netlify frontend
  'http://localhost:3000',                 // Your local dev frontend (adjust port if needed, e.g., 5173)
  'http://localhost:5173'                  // Added based on original code
];
console.log(`✅ Initializing CORS. Allowed Origins: ${allowedOrigins.join(', ')}`);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or requests from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS Allowed] Origin: ${origin || 'N/A'}`);
      callback(null, true); // Allow the request
    } else {
      console.error(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`)); // Block the request
    }
  },
  credentials: true, // Important: Allows cookies/authorization headers to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow methods, including OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'] // Allow common headers + Authorization for tokens
}));

// —— Request Body Parsers ——
// These MUST come AFTER CORS middleware and BEFORE your routes
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads

// —— Request Logger Middleware ——
// Placed after CORS and body parsers, before routes, to see what reaches the app logic
app.use((req, res, next) => {
  console.log(`[Request Logger] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next(); // Pass control to the next middleware function
});

// —— Route Modules ——
// Ensure these files exist and export an Express router (module.exports = router)
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const trialFollowups = require('./routes/trialFollowups');
// require any other route modules here...

// —— Mount Routers ——
// Define the base path for each set of routes
app.use('/api/customer', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trial-followups', trialFollowups);
// mount any other routers here...


// —— Test Routes (Optional but helpful) ——
app.get('/test-direct', (req, res) => {
    // This bypasses API routing, good for checking if the server base is responding
    res.send('✅ Direct test route (/test-direct) hit successfully!');
});

app.get('/test-cors', (req, res) => {
    // Test if CORS headers are applied correctly to a simple GET route
    res.json({ message: '✅ CORS test route (/test-cors) hit successfully! If you see this cross-origin, CORS is likely working for GET.' });
});


// —— Root Health Check ——
// Simple check to see if the server is alive
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend Running!');
});


// —— Global Error Handler (Basic Example) ——
// Catches errors passed via next(err) from routes
app.use((err, req, res, next) => {
  console.error("[Global Error Handler] Error:", err.stack || err.message || err);
  // Send a generic error response
  // Avoid sending detailed stack traces to the client in production
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    // error: process.env.NODE_ENV === 'development' ? err : {} // Optionally include details in dev
  });
});


// —— Start Server ——
const PORT = process.env.PORT || 10000; // Render provides PORT env var, fallback for flexibility
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Re-log allowed origins after server start for clarity
  console.log(`✅ CORS Middleware Active. Allowed Origins: ${allowedOrigins.join(', ')}`);
});