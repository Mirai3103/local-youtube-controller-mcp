import browser from 'webextension-polyfill';
import { MessageType, PlaybackAction } from '@shared/types';
import { controlPlayback, seekTo } from '../services/player-controller';
import { getVideoState } from '../services/video-state';
import { doSearchAction, getSearchResult } from '../services/search-scraper';

interface ContentMessage {
  type: MessageType;
  payload?: {
    action?: PlaybackAction;
    query?: string;
    time?: number;
  };
}

/**
 * Handle messages from background script
 */
async function handleMessage(message: ContentMessage): Promise<unknown> {
  console.log('Content script received message:', message);

  switch (message.type) {
    case MessageType.GET_VIDEO_STATE:
      return Promise.resolve(getVideoState());

    case MessageType.CONTROL_PLAYBACK:
      if (message.payload?.action) {
        controlPlayback(message.payload.action);
      }
      // Return updated state after a short delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getVideoState());
        }, 100);
      });

    case MessageType.SEEK_TO:
      if (message.payload?.time !== undefined) {
        seekTo(message.payload.time);
      }
      return Promise.resolve(getVideoState());

    case MessageType.GET_SEARCH_RESULT:
      return getSearchResult();
    case MessageType.DO_SEARCH_ACTION:
      console.log('Doing search action:', message);
      await  doSearchAction(message.payload?.query as string);
      return Promise.resolve(null);

    default:
      return Promise.resolve(null);
  }
}

/**
 * Setup message handler for content script
 */
export function setupMessageHandler(): void {
  browser.runtime.onMessage.addListener(async (message: unknown) => {
    try {
      const result = await handleMessage(message as ContentMessage);
      console.log('Content script sent message:', result);
      return result as any;
    } catch (error) {
      console.error('Error handling message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}

