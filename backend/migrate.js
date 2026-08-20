const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/medicare',
});

async function runMigration() {
    try {
        await pool.query('ALTER TABLE deliveries ADD COLUMN otp VARCHAR(6);');
        console.log('Migration successful: Added otp column to deliveries.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

runMigration();
