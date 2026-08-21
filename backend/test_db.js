const { Client } = require('pg');

const client = new Client({
  host: 'dpg-da3f642jnfac73ccqnig-a.ohio-postgres.render.com',
  port: 5432,
  user: 'medicare',
  password: 'dJb0LB3hNpk5BeEneksdrmT9Nf01Y6CY',
  database: 'medicare_mmiw',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  // Test query
  try {
    const res = await client.query(`
        SELECT i.*, m.name as medicine_name, m.sku, b.batch_number, b.expiry_date 
        FROM inventory i
        JOIN medicines m ON i.medicine_id = m.id
        LEFT JOIN medicine_batches b ON i.batch_id = b.id
        ORDER BY m.name ASC
    `);
    console.log("Success! Rows:", res.rows.length);
    console.log(res.rows);
  } catch (err) {
    console.error("Query Error:", err);
  }

  await client.end();
}

run();
