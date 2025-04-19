const bcrypt = require('bcrypt');
const pool = require('./db'); // make sure you have db.js that exports the PostgreSQL pool

async function insertTestExecutive() {
  const name = 'Test Executive';
  const email = 'test@crm.com';
  const plainPassword = 'test1234';
  const role = 'executive';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const existing = await pool.query('SELECT * FROM executives WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Executive already exists.');
    } else {
      await pool.query(
        `INSERT INTO executives (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        [name, email, hashedPassword, role]
      );
      console.log('Test executive created!');
    }
  } catch (err) {
    console.error('Error inserting executive:', err);
  } finally {
    process.exit();
  }
}

insertTestExecutive();
