import app from './app';
import { pool } from './config/database';
import http from 'http';
import { initSocketServer } from './sockets';

const PORT = process.env.PORT || 5000;

// Test DB Connection
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL Database');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to the database', err.stack);
  });

const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
