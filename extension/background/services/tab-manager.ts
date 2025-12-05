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
import { delay, waitForTabComplete, isYouTubeTab, isWatchingVideo } from '../utils/helpers';

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
  const searchUrl = `${YOUTUBE_SEARCH_URL}${encodeURIComponent(query)}`;

  // Try to find an existing YouTube tab and navigate it
  const { tabs } = await getYouTubeTabs();
  let targetTabId: number;

  if (tabs.length > 0) {
    targetTabId = tabs[0].id;
    await browser.tabs.sendMessage(targetTabId, {
      type: MT.DO_SEARCH_ACTION,
      payload: { query },
    });
    await delay(1000);
  } else {
    const newTab = await browser.tabs.create({ url: searchUrl });
    targetTabId = newTab.id!;
  }

  await waitForTabComplete(targetTabId);
  await delay(TAB_LOAD_DELAY);

  return (await browser.tabs.sendMessage(targetTabId, {
    type: MT.GET_SEARCH_RESULT,
    payload: { query },
  }));
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