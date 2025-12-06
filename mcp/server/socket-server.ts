import http from 'http';
import { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../../shared/types';
import { config } from '../config';
import { logger } from '../utils/logger';
import { extensionBridge } from '../services/extension-bridge';

// Tạo HTTP server thuần Node
const httpServer = http.createServer();

// Tạo Socket.io server
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  path: config.socketPath,
});

// Handle connections
io.on('connection', (socket) => {
  logger.info(`New connection: ${socket.id}`);

  // Register this socket as the extension
  extensionBridge.setSocket(socket);

  socket.on('disconnect', () => {
    extensionBridge.clearSocket(socket);
  });
});

// Export function để start server
export const startSocketServer = () => {
  httpServer.listen(config.port, () => {
    logger.info(`Socket server running on port ${config.port}`);
  });
};
