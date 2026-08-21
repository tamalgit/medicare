import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isLocal =
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.includes('localhost')
    : (process.env.PGHOST || '').includes('localhost');

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: isLocal ? false : { rejectUnauthorized: false } }
    : {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: isLocal ? false : { rejectUnauthorized: false },
      }
);

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
