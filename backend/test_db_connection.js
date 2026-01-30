require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing PostgreSQL Connection...');
console.log('URL:', process.env.POSTGRES_URL ? 'Found (Hidden for security)' : 'MISSING');

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    console.error('ERROR: No connection string found in .env');
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Try with loose SSL first
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('SUCCESS: Connected to PostgreSQL!');

        // Check if users table exists
        const res = await client.query(`
      SELECT exists (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'users'
      );
    `);

        const tableExists = res.rows[0].exists;
        console.log(`Table 'users' exists: ${tableExists}`);

        if (!tableExists) {
            console.log('\nWARNING: The "users" table is missing.');
            console.log('You need to run the schema.sql file in your Supabase SQL Editor.');
        } else {
            // Check columns to be sure
            const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
            console.log('Columns found:', columns.rows.map(r => r.column_name).join(', '));
        }

        client.release();
        pool.end();
    } catch (err) {
        console.error('CONNECTION ERROR:', err.message);
        pool.end();
    }
}

testConnection();
