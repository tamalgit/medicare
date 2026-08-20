import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
export declare const initSocketServer: (server: HttpServer) => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getIO: () => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
//# sourceMappingURL=sockets.d.ts.map