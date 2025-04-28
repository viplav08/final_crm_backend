const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = [
  'https://commoditiescontrolcrm.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// ✅ Handles all preflight requests FIRST
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Now apply full CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('🚀 Backend Live');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
