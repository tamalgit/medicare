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
    const medRes = await client.query(`SELECT id, image_url FROM medicines`);
    console.log("Medicines Image URLs:", medRes.rows);

    const presRes = await client.query(`SELECT id, file_url FROM prescriptions`);
    console.log("Prescriptions File URLs:", presRes.rows);
  } catch (err) {
    console.error("Query Error:", err);
  }

  await client.end();
}

run();
