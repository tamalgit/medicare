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
  
  try {
    const medRes = await client.query(`SELECT id FROM medicines`);
    const invRes = await client.query(`SELECT medicine_id FROM inventory`);
    const invMedIds = invRes.rows.map(r => r.medicine_id);
    
    let added = 0;
    for (const med of medRes.rows) {
      if (!invMedIds.includes(med.id)) {
        await client.query(
          'INSERT INTO inventory (pharmacy_id, medicine_id, quantity) VALUES ($1, $2, $3)',
          [null, med.id, 0]
        );
        added++;
      }
    }
    console.log(`Successfully synced ${added} medicines to the inventory!`);
  } catch (err) {
    console.error("Query Error:", err);
  }

  await client.end();
}

run();
