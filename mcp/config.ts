import path from "path";
import { fileURLToPath } from "url";

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  // Server
  port:process.env.PORT || 3000,
  socketPath: "/socket.io/",

  // MCP
  mcp: {
    name: "youtube-controller-mcp",
    version: "0.0.1",
  },

  // Logging
  logFile: path.join(__dirname, "mcp.log"),
} as const;
