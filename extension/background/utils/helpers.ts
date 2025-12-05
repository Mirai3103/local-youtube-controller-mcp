import browser from 'webextension-polyfill';

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a tab to complete loading
 */
export function waitForTabComplete(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    const listener = (
      updatedTabId: number,
      changeInfo: browser.Tabs.OnUpdatedChangeInfoType
    ) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        browser.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    browser.tabs.onUpdated.addListener(listener);
  });
}

/**
 * Check if a URL is a YouTube tab
 */
export function isYouTubeTab(url: string): boolean {
  return url.includes('youtube.com');
}

/**
 * Check if a URL is watching a video
 */
export function isWatchingVideo(url: string): boolean {
  return url.includes('youtube.com/watch');
}

