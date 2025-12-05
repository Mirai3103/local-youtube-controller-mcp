import path from 'path';

// Get the directory where the MCP server is located
const MCP_DIR = import.meta.dir;

export const config = {
  // Server
  port: 3000,
  socketPath: '/socket.io/',

  // MCP
  mcp: {
    name: 'youtube-controller-mcp',
    version: '0.0.1',
  },

  // Logging
  logFile: path.join(MCP_DIR, 'mcp.log'),
} as const;

