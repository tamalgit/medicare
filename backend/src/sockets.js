"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let io;
const initSocketServer = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            socket.user = decoded;
            next();
        }
        catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`User connected: ${user.id} (${user.role})`);
        // Customer joining their order tracking room
        socket.on('join_order_room', (orderId) => {
            if (user.role === 'CUSTOMER') {
                socket.join(`order_${orderId}`);
                console.log(`Customer ${user.id} joined room order_${orderId}`);
            }
        });
        // Delivery Agent sending location updates
        socket.on('update_location', (data) => {
            if (user.role === 'DELIVERY_AGENT') {
                // Broadcast to the order room
                io.to(`order_${data.orderId}`).emit('location_update', {
                    lat: data.lat,
                    lng: data.lng,
                    timestamp: new Date().toISOString()
                });
            }
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.id}`);
        });
    });
    return io;
};
exports.initSocketServer = initSocketServer;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=sockets.js.map