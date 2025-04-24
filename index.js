// index.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// —— CORS Setup ——
const cors = require('cors');

app.use(cors({
  origin: 'https://commoditiescontrolcrm.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// —— Route Modules ——
// All of these must export via `module.exports = router`
const customerRoutes     = require('./routes/customer');
const authRoutes         = require('./routes/auth');
const trialFollowups     = require('./routes/trialFollowups');
// …require any other routes here…

// —— Mount Routers ——
app.use('/api/customer',        customerRoutes);
app.use('/api/auth',            authRoutes);
app.use('/api/trial-followups', trialFollowups);
// …mount the rest at their respective paths…

// —— Health Check ——
app.get('/', (req, res) => res.send('🚀 CRM Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
