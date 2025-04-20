const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.gvoowlmoehozxsnejcvb',
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

module.exports = pool;
