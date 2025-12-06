import browser from 'webextension-polyfill';
import { MessageType } from '@shared/types';
import { getYouTubeTabs, openYouTube, searchYouTube, sendMessageToTab } from '../services/tab-manager';
import { emitVideoStateUpdate } from '../services/socket-client';

interface PopupMessage {
  type: MessageType;
  payload?: unknown;
  tabId?: number;
}

/**
 * Handle messages from the popup
 */
function handlePopupMessage(message: PopupMessage): Promise<unknown> | undefined {
  console.log('Background received message:', message);

  switch (message.type) {
    case MessageType.GET_YOUTUBE_TABS:
      return getYouTubeTabs();

    case MessageType.OPEN_YOUTUBE:
      return openYouTube().then(() => undefined);

    case MessageType.SEARCH_YOUTUBE:
      return searchYouTube(
        (message.payload as { query: string }).query,
        MessageType.GET_SEARCH_RESULT
      );

    case MessageType.GET_VIDEO_STATE:
    case MessageType.CONTROL_PLAYBACK:
    case MessageType.SEEK_TO:
      // Forward these messages to the appropriate tab
      if (message.tabId) {
        return sendMessageToTab(message.tabId, message);
      }
      return Promise.resolve(null);

    // case MessageType.VIDEO_STATE_UPDATE:
    //   // Forward video state updates to backend server
    //   emitVideoStateUpdate(message.payload);
    //   return Promise.resolve(null);

    default:
      return Promise.resolve(null);
  }
}

/**
 * Setup the message handler for popup communication
 */
export function setupMessageHandler(): void {
  browser.runtime.onMessage.addListener((message: unknown) => {
    return handlePopupMessage(message as PopupMessage);
  });

  browser.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
  });
}

