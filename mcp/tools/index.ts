import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolDefinition } from './types';

// Import all tools
import { searchYoutubeTool } from './search-youtube';
import { playVideoTool } from './play-video';
import { pauseVideoTool } from './pause-video';
import { getStateTool } from './get-state';
import { seekVideoTool } from './seek-video';
import { togglePlaybackTool } from './toggle-playback';
import { nextVideoTool } from './next-video';
import { playVideoIdTool } from './play-video-id';
import { openYoutubeTool } from './open-youtube';

// All available tools
const tools: ToolDefinition[] = [
  searchYoutubeTool,
  playVideoTool,
  pauseVideoTool,
  getStateTool,
  seekVideoTool,
  togglePlaybackTool,
  nextVideoTool,
  openYoutubeTool,
  playVideoIdTool,
];

/**
 * Register all tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  for (const tool of tools) {
    server.registerTool(
      tool.name!,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        
      },
      tool.handler
    );
  }
}

