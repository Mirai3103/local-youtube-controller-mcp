import { z } from 'zod';
import type { ToolDefinition } from './types';
import { extensionBridge } from '../services/extension-bridge';
import { BackendCommandType } from '../../shared/types';
import { logger } from '../utils/logger';

const inputSchema = z.object({
  time: z.number().describe('The time in seconds to seek to'),
});

const outputSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const seekVideoTool: ToolDefinition = {
  name: 'seek_video',
  title: 'Seek Video',
  description: 'Seek to a specific time in the current YouTube video',
  inputSchema,
  outputSchema,
  handler: async ({ time }:z.infer<typeof inputSchema>) => {
    logger.info(`Seeking to ${time}s`);

    if (!extensionBridge.isConnected) {
      return {
        content: [{ text: 'Error: Browser extension not connected.', type: 'text' }],
        isError: true,
        structuredContent: { success: false, error: 'Extension not connected' },
      };
    }

    const response = await extensionBridge.sendCommand({
      action: BackendCommandType.SEEK,
      args: { time },
    });

    return {
      content: [{ text: response.success ? `Seeked to ${time}s` : `Error: ${response.error}`, type: 'text' }],
      isError: !response.success,
      structuredContent: response,
    };
  },
};

