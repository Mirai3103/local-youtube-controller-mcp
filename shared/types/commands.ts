// Playback control actions
export enum PlaybackAction {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  TOGGLE = 'TOGGLE',
  NEXT = 'NEXT',
}

// Backend command types
export enum BackendCommandType {
  PLAY = 'play',
  PAUSE = 'pause',
  TOGGLE = 'toggle',
  NEXT = 'next',
  SEEK = 'seek',
  SEARCH = 'search',
  GET_STATE = 'get_state',
  OPEN_YOUTUBE = 'open_youtube',
  PLAY_VIDEO_ID = 'play_video_id',
}

export interface BackendCommand {
  action: BackendCommandType;
  args?: {
    time?: number;
    query?: string;
    videoId?: string;
    [key: string]: unknown;
  };
}

export interface BackendResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

