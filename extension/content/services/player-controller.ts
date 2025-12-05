import browser from 'webextension-polyfill';
import { PlaybackAction, MessageType } from '@shared/types';
import { VIDEO_STATE_UPDATE_INTERVAL, PLAYER_CHECK_TIMEOUT } from '@shared/constants';
import { getPlayer } from '../utils/dom-helpers';
import { getVideoState } from './video-state';

let updateInterval: number | null = null;

/**
 * Control video playback
 */
export function controlPlayback(action: PlaybackAction): void {
  const player = getPlayer();
  if (!player) {
    console.warn('YouTube player not found');
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
      const nextButton = document.querySelector('.ytp-next-button') as HTMLButtonElement;
      if (nextButton) {
        nextButton.click();
      }
      break;
  }
}

/**
 * Seek to specific time
 */
export function seekTo(time: number): void {
  const player = getPlayer();
  if (player) {
    player.currentTime = time;
  }
}

/**
 * Start sending periodic state updates when video is playing
 */
function startStateUpdates(): void {
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
  }, VIDEO_STATE_UPDATE_INTERVAL);
}

/**
 * Attach event listeners to the player
 */
function attachPlayerListeners(): void {
  const player = getPlayer();
  if (player) {
    player.addEventListener('play', () => {
      console.log('Video started playing');
      startStateUpdates();
    });

    player.addEventListener('pause', () => {
      console.log('Video paused');
    });

    player.addEventListener('ended', () => {
      console.log('Video ended');
    });
  }
}

/**
 * Initialize player watching
 */
function init(): void {
  // Wait for player to be available
  const checkPlayer = setInterval(() => {
    const player = getPlayer();
    if (player) {
      clearInterval(checkPlayer);
      attachPlayerListeners();
      startStateUpdates();
      console.log('YouTube player found and listeners attached');
    }
  }, 500);

  // Clear check after timeout
  setTimeout(() => clearInterval(checkPlayer), PLAYER_CHECK_TIMEOUT);
}

/**
 * Initialize player watcher with SPA navigation support
 */
export function initPlayerWatcher(): void {
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on navigation (YouTube is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('Navigation detected, reinitializing...');
      init();
    }
  }).observe(document, { subtree: true, childList: true });
}

