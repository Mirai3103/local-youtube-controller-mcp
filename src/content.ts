import browser from "webextension-polyfill";
import {
  GetSearchResultResponse,
  MessageType,
  PlaybackAction,
  VideoState,
} from "./types";

console.log("YouTube Controller - Content script loaded");

// Get YouTube player element
function getPlayer(): HTMLVideoElement | null {
  return document.querySelector("video.html5-main-video");
}

// Get video ID from URL
function getVideoId(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v") || "";
}

// Get video thumbnail
function getThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

// Get video title
function getTitle(): string {
  const titleElement =
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
    document.querySelector("h1.title");
  return titleElement?.textContent?.trim() || "Unknown Title";
}

// Get channel name
function getChannelName(): string {
  const channelElement =
    document.querySelector("ytd-channel-name a") ||
    document.querySelector("#channel-name a") ||
    document.querySelector("#owner-name a");
  return channelElement?.textContent?.trim() || "Unknown Channel";
}

// Extract current video state
function getVideoState(): VideoState | null {
  const player = getPlayer();
  if (!player) {
    return null;
  }

  const videoId = getVideoId();

  return {
    isPlaying: !player.paused,
    currentTime: player.currentTime,
    duration: player.duration || 0,
    title: getTitle(),
    thumbnail: getThumbnail(videoId),
    channel: getChannelName(),
    videoId: videoId,
    url: window.location.href,
  };
}

// Control playback
function controlPlayback(action: PlaybackAction): void {
  const player = getPlayer();
  if (!player) {
    console.warn("YouTube player not found");
    return;
  }

  switch (action) {
    case PlaybackAction.PLAY:
      player.play();
      break;
    case PlaybackAction.PAUSE:
      player.pause();
      break;
    case PlaybackAction.TOGGLE:
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
      break;
    case PlaybackAction.NEXT:
      // Click the next button
      const nextButton = document.querySelector(
        ".ytp-next-button"
      ) as HTMLButtonElement;
      if (nextButton) {
        nextButton.click();
      }
      break;
  }
}

// Seek to specific time
function seekTo(time: number): void {
  const player = getPlayer();
  if (player) {
    player.currentTime = time;
  }
}

// Listen for messages from popup/background
browser.runtime.onMessage.addListener((message, sender) => {
  console.log("Content script received message:", message);

  switch (message.type) {
    case MessageType.GET_VIDEO_STATE:
      return Promise.resolve(getVideoState());

    case MessageType.CONTROL_PLAYBACK:
      controlPlayback(message.payload.action);
      // Return updated state after a short delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getVideoState());
        }, 100);
      });

    case MessageType.SEEK_TO:
      seekTo(message.payload.time);
      return Promise.resolve(getVideoState());

    case MessageType.GET_SEARCH_RESULT:
      return getSearchResult();

    default:
      return Promise.resolve(null);
  }
});
function waitForSelectorExists(selector: string, timeout: number): Promise<Element | null> {
  return new Promise((resolve) => {
    const check = () => document.querySelector(selector);

    // Check ngay lần đầu xem đã có chưa
    const initial = check();
    if (initial) {
      resolve(initial);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = check();
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

async function getSearchResult(): Promise<GetSearchResultResponse> {
  // get search result from youtube
  // check if search page url is https://www.youtube.com/results?search_query=...
  if (
    !window.location.href.includes(
      "https://www.youtube.com/results?search_query="
    )
  ) {
    return {
      success: false,
      data: [],
    };
  }
  const searchResultCards = await waitForSelectorExists("ytd-video-renderer.style-scope.ytd-item-section-renderer", 10000);
  if (!searchResultCards) {
    return {
      success: false,
      data: [],
    };
  }

  const allResultCards = Array.from(
    document.querySelectorAll(
      "ytd-video-renderer.style-scope.ytd-item-section-renderer"
    )
  );
  const searchResult = allResultCards.map((card) => {
    const title = card.querySelector("#video-title")?.textContent.trim();
    // lấy video id từ href
    const href = card.querySelector("#video-title")?.getAttribute("href") || "";
    const videoId = new URLSearchParams(href.split("?")[1]).get("v");
    return {
      title: title!,
      videoId: videoId!,
    };
  });
  return {
    success: true,
    data: searchResult,
  };
}

// Send state updates periodically when video is playing
let updateInterval: number | null = null;

function startStateUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = window.setInterval(() => {
    const state = getVideoState();
    if (state && state.isPlaying) {
      browser.runtime.sendMessage({
        type: MessageType.VIDEO_STATE_UPDATE,
        payload: state,
      });
    }
  }, 1000);
}

// Listen for player events
function attachPlayerListeners() {
  const player = getPlayer();
  if (player) {
    player.addEventListener("play", () => {
      console.log("Video started playing");
      startStateUpdates();
    });

    player.addEventListener("pause", () => {
      console.log("Video paused");
    });

    player.addEventListener("ended", () => {
      console.log("Video ended");
    });
  }
}

// Initialize
function init() {
  // Wait for player to be available
  const checkPlayer = setInterval(() => {
    const player = getPlayer();
    if (player) {
      clearInterval(checkPlayer);
      attachPlayerListeners();
      startStateUpdates();
      console.log("YouTube player found and listeners attached");
    }
  }, 500);

  // Clear check after 10 seconds
  setTimeout(() => clearInterval(checkPlayer), 10000);
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Re-initialize on navigation (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("Navigation detected, reinitializing...");
    init();
  }
}).observe(document, { subtree: true, childList: true });
