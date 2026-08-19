const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/medicare',
});

async function seedPharmacy() {
  try {
    const users = await pool.query("SELECT id FROM users WHERE email='pharmacy@medicare.com'");
    if (users.rows.length === 0) throw new Error("No pharmacy admin found");
    const userId = users.rows[0].id;

    console.log("Seeding pharmacy...");
    
    // Check if exists
    const existing = await pool.query("SELECT id FROM pharmacies WHERE user_id=$1", [userId]);
    if (existing.rows.length === 0) {
        await pool.query(`
            INSERT INTO pharmacies (user_id, name, address, city, state, pincode, contact_email, contact_phone, is_active)
            VALUES ($1, 'Medicare Central Pharmacy', '123 Health Street', 'Mumbai', 'Maharashtra', '400001', 'pharmacy@medicare.com', '8888888888', true)
        `, [userId]);
        console.log("Pharmacy seeded.");
    } else {
        console.log("Pharmacy already exists.");
    }
  } catch (e) {
    console.error("Error seeding pharmacy:", e.message);
  } finally {
    await pool.end();
  }
}

seedPharmacy();
