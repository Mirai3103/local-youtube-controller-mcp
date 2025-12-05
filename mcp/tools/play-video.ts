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

export const playVideoTool: ToolDefinition = {
  name: 'play_video',
  title: 'Play Video',
  description: 'Play the current YouTube video',
  inputSchema,
  outputSchema,
  handler: async () => {
    logger.info('Playing video');

    if (!extensionBridge.isConnected) {
      return {
        content: [{ text: 'Error: Browser extension not connected.', type: 'text' }],
        isError: true,
        structuredContent: { success: false, error: 'Extension not connected' },
      };
    }

    const response = await extensionBridge.sendCommand({
      action: BackendCommandType.PLAY,
    });

    return {
      content: [{ text: response.success ? 'Video playing' : `Error: ${response.error}`, type: 'text' }],
      isError: !response.success,
      structuredContent: response,
    };
  },
};

