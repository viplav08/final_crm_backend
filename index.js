// index.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://commoditiescontrolcrm.netlify.app'
];
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

app.use(express.json());

// Routes (all must use module.exports = router)
const customerRoutes     = require('./routes/customer');
const authRoutes         = require('./routes/auth');
const trialFollowups     = require('./routes/trialFollowups');
// …and the rest…

app.use('/api/customer',       customerRoutes);
app.use('/api/auth',           authRoutes);
app.use('/api/trial-followups', trialFollowups);
// …mount the rest at their correct paths…

// Health check
app.get('/', (req, res) => res.send('🚀 CRM Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
