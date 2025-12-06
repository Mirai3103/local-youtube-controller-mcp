import type { PlaybackAction } from './commands';

// Message types for extension communication
export enum MessageType {
  GET_YOUTUBE_TABS = 'GET_YOUTUBE_TABS',
  GET_VIDEO_STATE = 'GET_VIDEO_STATE',
  CONTROL_PLAYBACK = 'CONTROL_PLAYBACK',
  SEEK_TO = 'SEEK_TO',
  OPEN_YOUTUBE = 'OPEN_YOUTUBE',
  SEARCH_YOUTUBE = 'SEARCH_YOUTUBE',
  // VIDEO_STATE_UPDATE = 'VIDEO_STATE_UPDATE',
  GET_SEARCH_RESULT = 'GET_SEARCH_RESULT',
  DO_SEARCH_ACTION = 'DO_SEARCH_ACTION',
}

// Base message interface
export interface Message {
  type: MessageType;
  payload?: unknown;
  tabId?: number;
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

