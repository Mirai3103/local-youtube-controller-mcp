import { z } from 'zod';
import type { ToolDefinition } from './types';
import { extensionBridge } from '../services/extension-bridge';
import { BackendCommandType } from '../../shared/types';
import { logger } from '../utils/logger';

const inputSchema = z.object({});

const outputSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const openYoutubeTool: ToolDefinition = {
  name: 'open_youtube',
  title: 'Open YouTube',
  description: 'Open YouTube in a new browser tab',
  inputSchema,
  outputSchema,
  handler: async () => {
    logger.info('Opening YouTube');

    if (!extensionBridge.isConnected) {
      return {
        content: [{ text: 'Error: Browser extension not connected.', type: 'text' }],
        isError: true,
        structuredContent: { success: false, error: 'Extension not connected' },
      };
    }

    const response = await extensionBridge.sendCommand({
      action: BackendCommandType.OPEN_YOUTUBE,
    });

    return {
      content: [{ text: response.success ? 'YouTube opened' : `Error: ${response.error}`, type: 'text' }],
      isError: !response.success,
      structuredContent: response,
    };
  },
};

