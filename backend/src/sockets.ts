import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export const initSocketServer = (server: HttpServer) => {
    io = new SocketIOServer(server, {
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            (socket as any).user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        console.log(`User connected: ${user.id} (${user.role})`);

        // Customer joining their order tracking room
        socket.on('join_order_room', (orderId: string) => {
            if (user.role === 'CUSTOMER') {
                socket.join(`order_${orderId}`);
                console.log(`Customer ${user.id} joined room order_${orderId}`);
            }
        });

        // Delivery Agent sending location updates
        socket.on('update_location', (data: { orderId: string, lat: number, lng: number }) => {
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

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
