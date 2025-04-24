require('dotenv').config(); // If using dotenv
const express = require('express');
const cors = require('cors'); // Single declaration
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
require('./db'); // Adjust path as needed

// Routes
const routes = [
  require('./routes/customer'),
  require('./routes/dashboard'),
  require('./routes/auth')
  // Add other routes
];

// Mount all routes
routes.forEach(route => {
  app.use('/api', route);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app; // For testing