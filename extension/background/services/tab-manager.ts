import browser from 'webextension-polyfill';
import {
  GetYouTubeTabsResponse,
  YouTubeTab,
  GetSearchResultResponse,
  MessageType as MT,
} from '@shared/types';
import {
  YOUTUBE_BASE_URL,
  YOUTUBE_SEARCH_URL,
  TAB_LOAD_DELAY,
} from '@shared/constants';
import { delay, isYouTubeTab, isWatchingVideo } from '../utils/helpers';

/**
 * Get all YouTube tabs and find the active one
 */
export async function getYouTubeTabs(): Promise<GetYouTubeTabsResponse> {
  const allTabs = await browser.tabs.query({});
  const youtubeTabs: YouTubeTab[] = allTabs
    .filter((tab) => tab.url && isYouTubeTab(tab.url))
    .map((tab) => ({
      id: tab.id!,
      title: tab.title || 'YouTube',
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

/**
 * Open YouTube in a new tab
 */
export async function openYouTube(): Promise<void> {
  await browser.tabs.create({ url: YOUTUBE_BASE_URL });
}

/**
 * Search YouTube with a query
 */
export async function searchYouTube(
  query: string,
  messageType: MT
): Promise<GetSearchResultResponse> {
  console.debug("[searchYouTube] Start search:", query);

  const searchUrl = `${YOUTUBE_SEARCH_URL}${encodeURIComponent(query)}`;
  console.debug("[searchYouTube] Computed searchUrl:", searchUrl);

  // Try to find an existing YouTube tab and navigate it
  const { tabs } = await getYouTubeTabs();
  console.debug("[searchYouTube] getYouTubeTabs result:", tabs);

  let targetTabId: number;

  if (tabs.length > 0) {
    targetTabId = tabs[0].id!;
    console.debug("[searchYouTube] Reusing existing tab:", targetTabId);

    await browser.tabs.sendMessage(targetTabId, {
      type: MT.DO_SEARCH_ACTION,
      payload: { query },
    });
    console.debug("[searchYouTube] Sent DO_SEARCH_ACTION to tab:", targetTabId);

    await delay(1000);
    console.debug("[searchYouTube] Delay after triggering search done");
  } else {
    console.debug("[searchYouTube] No existing YouTube tab. Creating new one...");
    const newTab = await browser.tabs.create({ url: searchUrl });

    targetTabId = newTab.id!;
    console.debug("[searchYouTube] Created new tab:", targetTabId);
  }

  console.debug("[searchYouTube] Waiting for tab to complete:", targetTabId);
  await delay(1000);
  console.debug("[searchYouTube] Tab reported complete:", targetTabId);

  await delay(TAB_LOAD_DELAY);
  console.debug("[searchYouTube] Final post-load delay done");

  console.debug("[searchYouTube] Requesting GET_SEARCH_RESULT…");
  const result = await browser.tabs.sendMessage(targetTabId, {
    type: MT.GET_SEARCH_RESULT,
    payload: { query },
  });

  console.debug("[searchYouTube] Received result:", result);

  return result;
}


/**
 * Send message to a specific tab
 */
export async function sendMessageToTab(tabId: number, message: unknown): Promise<unknown> {
  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.error('Error sending message to tab:', error);
    return null;
  }
}


/**
 * Play a video by ID
 */
export async function playVideoId(videoId: string): Promise<void> {
  const { tabs } = await getYouTubeTabs();
  let targetTabId: number;
  if (tabs.length > 0) {
    targetTabId = tabs[0].id;
    const url = `${YOUTUBE_BASE_URL}/watch?v=${videoId}`;
    await browser.tabs.update(targetTabId, { url });
  }else{
    const newTab = await browser.tabs.create({ url: `${YOUTUBE_BASE_URL}/watch?v=${videoId}` });
    targetTabId = newTab.id!;
  }
  // forcus on the tab
  await browser.tabs.update(targetTabId, { active: true });
  await delay(TAB_LOAD_DELAY);
}