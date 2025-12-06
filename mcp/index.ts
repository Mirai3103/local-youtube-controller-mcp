/**
 * MCP YouTube Controller Server
 *
 * Entry point that initializes:
 * - Socket.io server for extension communication
 * - MCP server for AI tool integration
 */

import { startSocketServer } from './server/socket-server';
import { mcpServer, startMcpServer } from './server/mcp-server';
import { registerAllTools } from './tools';
import { logger } from './utils/logger';

// Register all MCP tools
registerAllTools(mcpServer);

// Start MCP server
startMcpServer().then(() => {
  logger.info('YouTube Controller MCP server initialized');
});

// Export Bun server handler for Socket.io
startSocketServer()
