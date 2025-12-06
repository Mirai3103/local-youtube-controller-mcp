/**
 * YouTube Controller - Background Script
 *
 * Entry point for the extension's background service worker.
 * Handles communication between popup, content scripts, and MCP server.
 */

import { initSocketClient } from './background/services/socket-client';
import { setupMessageHandler } from './background/handlers/message-handler';
import { handleBackendCommand } from './background/handlers/command-handler';
import type { BackendResponse } from '@shared/types';

console.log('YouTube Controller - Background script loaded');

// Initialize socket connection to MCP server
initSocketClient(async (command, callback) => {
  try {
    console.debug("Calling handleBackendCommand");
    const response = await handleBackendCommand(command);
    callback(response);
  } catch (error) {
    console.error('Error handling backend command:', error);
    callback({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as BackendResponse);
  }
});

// Setup message handler for popup communication
setupMessageHandler();
