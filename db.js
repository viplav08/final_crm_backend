import pkg from 'pg';
const { Pool } = pkg;

// Create and export a pool instance
const pool = new Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.gvoowlmoehozxsnejcvb',
  password: '<YOUR_SUPABASE_PASSWORD>', // Replace this!
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
