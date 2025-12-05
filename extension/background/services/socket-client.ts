import { io, Socket } from 'socket.io-client';
import type { BackendCommand, BackendResponse } from '@shared/types';
import {
  SOCKET_PORT,
  RECONNECTION_DELAY,
  RECONNECTION_ATTEMPTS,
} from '@shared/constants';

let socket: Socket | null = null;

/**
 * Get the socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Check if socket is connected
 */
export function isConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Emit video state update to the backend
 */
export function emitVideoStateUpdate(state: unknown): void {
  if (socket?.connected) {
    socket.emit('video_state_update', state);
  }
}

/**
 * Initialize socket client and connect to MCP server
 */
export function initSocketClient(
  onCommand: (command: BackendCommand, callback: (response: BackendResponse) => void) => void
): void {
  socket = io(`http://localhost:${SOCKET_PORT}`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: RECONNECTION_DELAY,
    reconnectionAttempts: RECONNECTION_ATTEMPTS,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to backend server');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from backend server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle commands from backend
  socket.on('command', async (command: BackendCommand, callback: (response: BackendResponse) => void) => {
    console.log('📥 Received command from backend:', command);
    onCommand(command, callback);
  });
}

