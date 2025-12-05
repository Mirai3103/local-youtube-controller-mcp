import { Server as Engine } from '@socket.io/bun-engine';
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

// Create Socket.io server with typed events
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();

const engine = new Engine({ path: config.socketPath });

io.bind(engine);

// Handle connections
io.on('connection', (socket) => {
  logger.info(`New connection: ${socket.id}`);

  // Register this socket as the extension
  extensionBridge.setSocket(socket);

  // Handle disconnect
  socket.on('disconnect', () => {
    extensionBridge.clearSocket(socket);
  });
});

// Export for Bun server
export const socketServerHandler = {
  port: config.port,
  ...engine.handler(),
};

