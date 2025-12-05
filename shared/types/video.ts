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

export interface VideoStateResponse {
  state: VideoState | null;
  tabId: number;
}

export interface GetYouTubeTabsResponse {
  tabs: YouTubeTab[];
  activeTab?: YouTubeTab;
}

export interface GetSearchResultResponse {
  success: boolean;
  data: SearchResultItem[];
}

export interface SearchResultItem {
  title: string;
  videoId: string;
}

