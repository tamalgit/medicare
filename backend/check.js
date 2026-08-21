const { Pool } = require('pg'); 
const pool = new Pool({ 
    host: process.env.PGHOST, 
    port: 5432, 
    user: process.env.PGUSER, 
    password: process.env.PGPASSWORD, 
    database: process.env.PGDATABASE, 
    ssl: { rejectUnauthorized: false } 
}); 
const newHash = '$2b$10$5ypj9KGef57xZkEErLL73eA7/dUNbiSxosIivhYj1SwfSoPMNQpj.';
pool.query("UPDATE users SET password_hash = $1", [newHash]).then(res => { 
    console.log('Passwords successfully fixed. Rows updated:', res.rowCount); 
    pool.end(); 
}).catch(err => { 
    console.error(err); 
    pool.end(); 
});
