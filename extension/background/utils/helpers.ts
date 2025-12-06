import browser from 'webextension-polyfill';

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

