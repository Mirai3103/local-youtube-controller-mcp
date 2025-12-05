import { z } from 'zod';
import type { ToolDefinition } from './types';
import { extensionBridge } from '../services/extension-bridge';
import { BackendCommandType } from '../../shared/types';
import { logger } from '../utils/logger';

const inputSchema = z.object({
  query: z.string().describe('The search query for YouTube'),
});

const outputSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      title: z.string(),
      videoId: z.string(),
    })
  ),
});

export const searchYoutubeTool: ToolDefinition = {
  name: 'search_youtube',
  title: 'Search YouTube',
  description: 'Search YouTube and get search results with video titles and IDs',
  inputSchema,
  outputSchema,
  handler: async ({ query }:z.infer<typeof inputSchema>) => {
    logger.info(`Searching YouTube for: ${query}`);

    if (!extensionBridge.isConnected) {
      return {
        content: [{ text: 'Error: Browser extension not connected. Please open browser first.', type: 'text' }],
        isError: true,
        structuredContent: {
          success: false,
          data: [],
        },
      };
    }

    const response = await extensionBridge.sendCommand({
      action: BackendCommandType.SEARCH,
      args: { query },
    });

    logger.info(`Search result: ${JSON.stringify(response)}`);

    return {
      content: [{ text: JSON.stringify(response), type: 'text' }],
      isError: !response.success,
      structuredContent: response,
    };
  },
};

