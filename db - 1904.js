import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'crm_app_db',
  password: 'vip123',
  port: 5432,
});

export default pool;
