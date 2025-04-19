import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.gvoowlmoehozxsnejcvb',   // Full username with project ref
  password: 'Lalitha@1705',   // Replace this safely
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
