/**
 * YouTube Controller - Content Script
 *
 * Injected into YouTube pages to control video playback
 * and extract video state information.
 */

import { setupMessageHandler } from './content/handlers/message-handler';
import { initPlayerWatcher } from './content/services/player-controller';

console.log('YouTube Controller - Content script loaded');

// Setup message handler for background script communication
setupMessageHandler();

// Initialize player watcher for state updates
initPlayerWatcher();
