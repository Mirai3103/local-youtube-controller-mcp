import browser from "webextension-polyfill";
import { MessageType, GetYouTubeTabsResponse, YouTubeTab, BackendCommand, BackendCommandType, BackendResponse, PlaybackAction, GetSearchResultResponse } from "./types";
import { io } from "socket.io-client";

console.log("YouTube Controller - Background script loaded");

// Connect to backend server
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Connected to backend server");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend server");
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Handle commands from backend
socket.on("command", async (command: BackendCommand, callback: (response: BackendResponse) => void) => {
  console.log("-=-=-=-=-=-=-=-=-=-=-=Received command from backend:", command,callback);
  console.log("📥 Received command from backend:", command);
  
  try {
    const response = await handleBackendCommand(command);
    console.log("=-=-=-=-=-=-=-=-=-=-=Sending response to backend:", response);
    callback(response);
  } catch (error) {
    console.error("Error handling backend command:", error);
    callback({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Handle backend commands
async function handleBackendCommand(command: BackendCommand): Promise<BackendResponse> {
  const { action, args } = command;
  console.log("-=-=-=-=-=-=-=-=-=-=-=Handling backend command:", command);
  
  // Get active YouTube tab
  const { tabs, activeTab } = await getYouTubeTabs();
  
  if (!activeTab && action !== BackendCommandType.OPEN_YOUTUBE && action !== BackendCommandType.SEARCH) {
    return {
      success: false,
      error: "No YouTube tab found",
    };
  }
  
  const tabId = activeTab?.id;
  
  switch (action) {
    case BackendCommandType.PLAY:
      if (!tabId) throw new Error("No tab");
      const playState = await sendMessageToTab(tabId, {
        type: MessageType.CONTROL_PLAYBACK,
        payload: { action: PlaybackAction.PLAY },
      });
      return { success: true, data: playState };
    
    case BackendCommandType.PAUSE:
      if (!tabId) throw new Error("No tab");
      const pauseState = await sendMessageToTab(tabId, {
        type: MessageType.CONTROL_PLAYBACK,
        payload: { action: PlaybackAction.PAUSE },
      });
      return { success: true, data: pauseState };
    
    case BackendCommandType.TOGGLE:
      if (!tabId) throw new Error("No tab");
      const toggleState = await sendMessageToTab(tabId, {
        type: MessageType.CONTROL_PLAYBACK,
        payload: { action: PlaybackAction.TOGGLE },
      });
      return { success: true, data: toggleState };
    
    case BackendCommandType.NEXT:
      if (!tabId) throw new Error("No tab");
      const nextState = await sendMessageToTab(tabId, {
        type: MessageType.CONTROL_PLAYBACK,
        payload: { action: PlaybackAction.NEXT },
      });
      return { success: true, data: nextState };
    
    case BackendCommandType.SEEK:
      if (!tabId) throw new Error("No tab");
      if (args?.time === undefined) throw new Error("Time parameter required");
      const seekState = await sendMessageToTab(tabId, {
        type: MessageType.SEEK_TO,
        payload: { time: args.time },
      });
      return { success: true, data: seekState };
    
    case BackendCommandType.GET_STATE:
      if (!tabId) throw new Error("No tab");
      const state = await sendMessageToTab(tabId, {
        type: MessageType.GET_VIDEO_STATE,
      });
      return { success: true, data: state };
    
    case BackendCommandType.SEARCH:
      if (!args?.query) throw new Error("Query parameter required");
      const searchResult = await searchYouTube(args.query);
      console.log("=-=-=-=-=-=-=-=-=-=-=Search result:", searchResult);
      return searchResult;
    
    case BackendCommandType.OPEN_YOUTUBE:
      await openYouTube();
      return { success: true, data: { message: "YouTube opened" } };
    
    default:
      return {
        success: false,
        error: `Unknown action: ${action}`,
      };
  }
}
browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});

// Check if a tab is a YouTube tab
function isYouTubeTab(url: string): boolean {
  return url.includes("youtube.com");
}

// Check if a tab is watching a video
function isWatchingVideo(url: string): boolean {
  return url.includes("youtube.com/watch");
}

// Get all YouTube tabs
async function getYouTubeTabs(): Promise<GetYouTubeTabsResponse> {
  const allTabs = await browser.tabs.query({});
  const youtubeTabs: YouTubeTab[] = allTabs
    .filter((tab) => tab.url && isYouTubeTab(tab.url))
    .map((tab) => ({
      id: tab.id!,
      title: tab.title || "YouTube",
      url: tab.url!,
    }));

  // Find the best tab to use (playing video or first one)
  let activeTab: YouTubeTab | undefined;
  
  if (youtubeTabs.length > 0) {
    // Priority 1: Find a tab that's playing audio (audible)
    const allTabsDetails = await browser.tabs.query({});
    const audibleYouTubeTab = allTabsDetails.find(
      (tab) => tab.url && isYouTubeTab(tab.url) && tab.audible
    );
    
    if (audibleYouTubeTab && audibleYouTubeTab.id) {
      activeTab = youtubeTabs.find((t) => t.id === audibleYouTubeTab.id);
    }
    
    // Priority 2: Find a tab watching a video (has /watch in URL)
    if (!activeTab) {
      const watchTab = youtubeTabs.find((tab) => isWatchingVideo(tab.url));
      if (watchTab) {
        activeTab = watchTab;
      }
    }
    
    // Priority 3: Use the first YouTube tab
    if (!activeTab) {
      activeTab = youtubeTabs[0];
    }
  }

  return { tabs: youtubeTabs, activeTab };
}

// Open YouTube in a new tab
async function openYouTube(): Promise<void> {
  await browser.tabs.create({ url: "https://www.youtube.com" });
}

// Search YouTube
interface SearchYouTubeResponse {
  success: boolean;
  data: {
    title: string;
    videoId: string;
  }[];
}
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function waitForTabComplete(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    const listener = (updatedTabId: number, changeInfo: any) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        browser.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    browser.tabs.onUpdated.addListener(listener);
  });
}

async function searchYouTube(query: string): Promise<SearchYouTubeResponse> {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  // Try to find an existing YouTube tab and navigate it
  const { tabs } = await getYouTubeTabs();
  if (tabs.length > 0) {
    await browser.tabs.update(tabs[0].id, { url: searchUrl, active: true });
  } else {
    await browser.tabs.create({ url: searchUrl });
  }
  await waitForTabComplete(tabs[0].id);
  await delay(1000);
  return await browser.tabs.sendMessage(tabs[0].id, {
    type: MessageType.GET_SEARCH_RESULT,
    payload: { query },
  }) as GetSearchResultResponse;
}

// Send message to a specific tab
async function sendMessageToTab(tabId: number, message: any): Promise<any> {
  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.error("Error sending message to tab:", error);
    return null;
  }
}

// Handle messages from popup
browser.runtime.onMessage.addListener((message, sender) => {
  console.log("Background received message:", message);

  switch (message.type) {
    case MessageType.GET_YOUTUBE_TABS:
      return getYouTubeTabs();

    case MessageType.OPEN_YOUTUBE:
      return openYouTube();

    case MessageType.SEARCH_YOUTUBE:
      console.log("Searching YouTube:", message);
      return searchYouTube(message.payload.query);

    case MessageType.GET_VIDEO_STATE:
    case MessageType.CONTROL_PLAYBACK:
    case MessageType.SEEK_TO:
      // Forward these messages to the appropriate tab
      if (message.tabId) {
        return sendMessageToTab(message.tabId, message);
      }
      return Promise.resolve(null);

    case MessageType.VIDEO_STATE_UPDATE:
      // Forward video state updates to backend server
      if (socket.connected) {
        socket.emit("video_state_update", message.payload);
      }
      console.log("Video state update:", message.payload);
      return Promise.resolve(null);

    default:
      return Promise.resolve(null);
  }
});
