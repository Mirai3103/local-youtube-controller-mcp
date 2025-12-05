import { z } from 'zod';
import type { ToolDefinition } from './types';
import { logger } from 'mcp/utils/logger';
import { extensionBridge } from 'mcp/services/extension-bridge';
import { BackendCommandType } from '@shared/types';

const inputSchema = z.object({
  videoId: z.string().describe('The ID of the YouTube video to play'),
});

const outputSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const playVideoIdTool: ToolDefinition = {
    name: 'play_video_id',
    title: 'Play Video ID',
    description: 'Play a YouTube video by ID',
    inputSchema,
    outputSchema,
    handler: async ({ videoId }:z.infer<typeof inputSchema>) => {
        logger.info(`Playing video ID: ${videoId}`);
        const response = await extensionBridge.sendCommand({
            action: BackendCommandType.PLAY_VIDEO_ID,
            args: { videoId },
        });
        return {
            content: [{ text: response.success ? 'Video playing' : `Error: ${response.error}`, type: 'text' }],
            isError: !response.success,
            structuredContent: response,
        };
    },
};
    