const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool(
    process.env.DATABASE_URL 
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            host: process.env.PGHOST,
            port: parseInt(process.env.PGPORT || '5432'),
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            ssl: { rejectUnauthorized: false }
        }
);

async function runMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read SQL files
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const seedPath = path.join(__dirname, '../database/seed.sql');
        
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const seed = fs.readFileSync(seedPath, 'utf8');

        console.log('Running Schema...');
        await pool.query(schema);
        console.log('Schema created successfully.');

        console.log('Running Seed Data...');
        await pool.query(seed);
        console.log('Seed data inserted successfully.');
        
        // Add the extra columns from the original migrate.js just in case
        try {
            await pool.query('ALTER TABLE deliveries ADD COLUMN otp VARCHAR(6);');
            console.log('Added otp column to deliveries.');
        } catch (e) {
            // Might already exist
        }

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

runMigration();
