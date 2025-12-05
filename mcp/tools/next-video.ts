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

export const nextVideoTool: ToolDefinition = {
  name: 'next_video',
  title: 'Next Video',
  description: 'Skip to the next video in the YouTube playlist',
  inputSchema,
  outputSchema,
  handler: async () => {
    logger.info('Skipping to next video');

    if (!extensionBridge.isConnected) {
      return {
        content: [{ text: 'Error: Browser extension not connected.', type: 'text' }],
        isError: true,
        structuredContent: { success: false, error: 'Extension not connected' },
      };
    }

    const response = await extensionBridge.sendCommand({
      action: BackendCommandType.NEXT,
    });

    return {
      content: [{ text: response.success ? 'Skipped to next video' : `Error: ${response.error}`, type: 'text' }],
      isError: !response.success,
      structuredContent: response,
    };
  },
};

