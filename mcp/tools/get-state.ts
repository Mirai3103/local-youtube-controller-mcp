import { z } from 'zod';
import type { ToolDefinition } from './types';
import { extensionBridge } from '../services/extension-bridge';
import { BackendCommandType } from '../../shared/types';
import { logger } from '../utils/logger';

const inputSchema = z.object({});

const outputSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      isPlaying: z.boolean(),
      currentTime: z.number(),
      duration: z.number(),
      title: z.string(),
      thumbnail: z.string(),
      channel: z.string(),
      videoId: z.string(),
      url: z.string(),
    })
    .optional(),
  error: z.string().optional(),
});

export const getStateTool: ToolDefinition = {
  name: 'get_video_state',
  title: 'Get Video State',
  description: 'Get the current state of the YouTube video (playing status, time, title, etc.)',
  inputSchema,
  outputSchema,
  handler: async () => {
    logger.info('Getting video state');

    if (!extensionBridge.isConnected) {
      return {
        content: [{ text: 'Error: Browser extension not connected.', type: 'text' }],
        isError: true,
        structuredContent: { success: false, error: 'Extension not connected' },
      };
    }

    const response = await extensionBridge.sendCommand({
      action: BackendCommandType.GET_STATE,
    });

    return {
      content: [{ text: JSON.stringify(response, null, 2), type: 'text' }],
      isError: !response.success,
      structuredContent: response,
    };
  },
};

