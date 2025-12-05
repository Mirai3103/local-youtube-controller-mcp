import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from '../config';
import { logger } from '../utils/logger';

// Create MCP server instance
export const mcpServer = new McpServer({
  name: config.mcp.name,
  version: config.mcp.version,
});

/**
 * Start the MCP server with stdio transport
 */
export async function startMcpServer(): Promise<void> {
  const transport = new StdioServerTransport();

  try {
    await mcpServer.connect(transport);
    logger.info('MCP server started successfully');
  } catch (err) {
    logger.error(`Failed to start MCP server: ${err}`);
    process.exit(1);
  }
}

