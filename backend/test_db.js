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
    const medRes = await client.query(`SELECT * FROM medicines`);
    console.log("Medicines:", medRes.rows.length);
    if (medRes.rows.length > 0) console.log(medRes.rows[0]);

    const pharmRes = await client.query(`SELECT * FROM pharmacies`);
    console.log("Pharmacies:", pharmRes.rows.length);
    if (pharmRes.rows.length > 0) console.log(pharmRes.rows[0]);

    const invRes = await client.query(`SELECT * FROM inventory`);
    console.log("Inventory Rows:", invRes.rows.length);
  } catch (err) {
    console.error("Query Error:", err);
  }

  await client.end();
}

run();
