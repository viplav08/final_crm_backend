const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: [
    'https://commoditiescontrolcrm.netlify.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Preflight handling
app.options('*', cors(corsOptions));

app.use(express.json());
