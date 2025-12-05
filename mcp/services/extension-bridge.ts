import type { Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  VideoState,
  BackendCommand,
  BackendResponse,
} from '../../shared/types';
import { logger } from '../utils/logger';

type ExtensionSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

class ExtensionBridge {
  private socket: ExtensionSocket | null = null;
  private latestVideoState: VideoState | null = null;

  get isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  get videoState(): VideoState | null {
    return this.latestVideoState;
  }

  setSocket(socket: ExtensionSocket): void {
    // Disconnect old socket if exists
    if (this.socket && this.socket.connected) {
      logger.info(`Replacing old extension: ${this.socket.id}`);
      this.socket.disconnect();
    }

    this.socket = socket;
    logger.info(`Extension connected: ${socket.id}`);

    // Notify extension of its role
    socket.emit('role', { role: 'EXTENSION' });

    // Listen for video state updates
    socket.on('video_state_update', (state: VideoState) => {
      this.latestVideoState = state;
      logger.debug(`Video state updated: ${state.title}`);
    });
  }

  clearSocket(socket: ExtensionSocket): void {
    if (this.socket === socket) {
      logger.info(`Extension disconnected: ${socket.id}`);
      this.socket = null;
      this.latestVideoState = null;
    }
  }

  /**
   * Send a command to the extension and wait for response
   */
  sendCommand(command: BackendCommand): Promise<BackendResponse> {
    return new Promise((resolve) => {
      if (!this.isConnected || !this.socket) {
        resolve({
          success: false,
          error: 'Extension not connected. Please open browser first.',
        });
        return;
      }

      this.socket.emit('command', command, (response: BackendResponse) => {
        resolve(response);
      });
    });
  }
}

// Singleton instance
export const extensionBridge = new ExtensionBridge();

