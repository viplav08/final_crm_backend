const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,         // Must match Render DB hostname
  port:     parseInt(process.env.DB_PORT, 10), // Usually 5432
  user:     process.env.DB_USER,         // e.g., postgres1
  password: process.env.DB_PASSWORD,     // From Render
  database: process.env.DB_NAME,         // e.g., crm_db_uac4
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  family: 4  // Force IPv4
});

module.exports = pool;
