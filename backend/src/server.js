"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const http_1 = __importDefault(require("http"));
const sockets_1 = require("./sockets");
const PORT = process.env.PORT || 5000;
// Test DB Connection
database_1.pool.connect()
    .then(client => {
    console.log('Connected to PostgreSQL Database');
    client.release();
})
    .catch(err => {
    console.error('Error connecting to the database', err.stack);
});
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
(0, sockets_1.initSocketServer)(server);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map