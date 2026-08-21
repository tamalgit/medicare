"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isLocal = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.includes('localhost')
    : (process.env.PGHOST || '').includes('localhost');
if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    console.error('FATAL ERROR: No database connection details found in environment variables!');
    console.error('Please set either DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE in your Render Dashboard.');
    process.exit(1);
}
exports.pool = new pg_1.Pool(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: isLocal ? false : { rejectUnauthorized: false } }
    : {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: isLocal ? false : { rejectUnauthorized: false },
    });
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const query = (text, params) => exports.pool.query(text, params);
exports.query = query;
//# sourceMappingURL=database.js.map