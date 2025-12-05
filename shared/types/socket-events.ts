import type { BackendCommand, BackendResponse } from './commands';
import type { VideoState } from './video';

// Socket.io event names
export const SocketEvents = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Extension events
  ROLE: 'role',
  COMMAND: 'command',
  VIDEO_STATE_UPDATE: 'video_state_update',
} as const;

// Role assignment payload
export interface RolePayload {
  role: 'EXTENSION';
}

// Socket event handlers types
export interface ServerToClientEvents {
  role: (payload: RolePayload) => void;
  command: (command: BackendCommand, callback: (response: BackendResponse) => void) => void;
}

export interface ClientToServerEvents {
  video_state_update: (state: VideoState) => void;
}

export interface InterServerEvents {
  // Empty for now
}

export interface SocketData {
  // Empty for now
}

