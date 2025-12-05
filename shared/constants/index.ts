// Socket server configuration
export const SOCKET_PORT = 3000;
export const SOCKET_PATH = '/socket.io/';

// Extension reconnection settings
export const RECONNECTION_DELAY = 1000;
export const RECONNECTION_ATTEMPTS = 5;

// YouTube URLs
export const YOUTUBE_BASE_URL = 'https://www.youtube.com';
export const YOUTUBE_SEARCH_URL = `${YOUTUBE_BASE_URL}/results?search_query=`;
export const YOUTUBE_WATCH_URL = `${YOUTUBE_BASE_URL}/watch`;

// Polling intervals (in ms)
export const VIDEO_STATE_UPDATE_INTERVAL = 1000;
export const POPUP_STATE_POLL_INTERVAL = 500;

// Timeouts (in ms)
export const PLAYER_CHECK_TIMEOUT = 10000;
export const SEARCH_RESULT_TIMEOUT = 10000;
export const TAB_LOAD_DELAY = 1000;

