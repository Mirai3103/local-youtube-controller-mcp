import type { VideoState } from '@shared/types';
import { getPlayer } from '../utils/dom-helpers';

/**
 * Get video ID from URL
 */
function getVideoId(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v') || '';
}

/**
 * Get video thumbnail URL
 */
function getThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Get video title from page
 */
function getTitle(): string {
  const titleElement =
    document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
    document.querySelector('h1.title');
  return titleElement?.textContent?.trim() || 'Unknown Title';
}

/**
 * Get channel name from page
 */
function getChannelName(): string {
  const channelElement =
    document.querySelector('ytd-channel-name a') ||
    document.querySelector('#channel-name a') ||
    document.querySelector('#owner-name a');
  return channelElement?.textContent?.trim() || 'Unknown Channel';
}

/**
 * Extract current video state
 */
export function getVideoState(): VideoState | null {
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

