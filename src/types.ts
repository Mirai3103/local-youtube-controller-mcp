// Message types for extension communication
export enum MessageType {
  GET_YOUTUBE_TABS = 'GET_YOUTUBE_TABS',
  GET_VIDEO_STATE = 'GET_VIDEO_STATE',
  CONTROL_PLAYBACK = 'CONTROL_PLAYBACK',
  SEEK_TO = 'SEEK_TO',
  OPEN_YOUTUBE = 'OPEN_YOUTUBE',
  SEARCH_YOUTUBE = 'SEARCH_YOUTUBE',
  VIDEO_STATE_UPDATE = 'VIDEO_STATE_UPDATE',
  GET_SEARCH_RESULT = 'GET_SEARCH_RESULT',
}

// Playback control actions
export enum PlaybackAction {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  TOGGLE = 'TOGGLE',
  NEXT = 'NEXT',
}

// Video state interface
export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  title: string;
  thumbnail: string;
  channel: string;
  videoId: string;
  url: string;
}

// YouTube tab info
export interface YouTubeTab {
  id: number;
  title: string;
  url: string;
  isPlaying?: boolean;
}

// Message interfaces
export interface Message {
  type: MessageType;
  payload?: any;
  tabId?: number;
}

export interface GetYouTubeTabsResponse {
  tabs: YouTubeTab[];
  activeTab?: YouTubeTab;
}

export interface ControlPlaybackMessage extends Message {
  type: MessageType.CONTROL_PLAYBACK;
  payload: {
    action: PlaybackAction;
  };
  tabId: number;
}

export interface SeekToMessage extends Message {
  type: MessageType.SEEK_TO;
  payload: {
    time: number;
  };
  tabId: number;
}

export interface SearchYouTubeMessage extends Message {
  type: MessageType.SEARCH_YOUTUBE;
  payload: {
    query: string;
  };
}

export interface GetSearchResultMessage extends Message {
  type: MessageType.GET_SEARCH_RESULT;
  payload: {
    query: string;
  };
}

export interface GetSearchResultResponse {
  success: boolean;
  data: {
    title: string;
    videoId: string;
  }[];
}

export interface VideoStateResponse {
  state: VideoState | null;
  tabId: number;
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
}

export interface BackendCommand {
  action: BackendCommandType;
  args?: {
    time?: number;
    query?: string;
    [key: string]: any;
  };
}

export interface BackendResponse {
  success: boolean;
  data?: any;
  error?: string;
}

