import { Server as Engine } from "@socket.io/bun-engine";
import { Server, Socket, type DefaultEventsMap } from "socket.io";

const io = new Server();
const engine = new Engine({ path: "/socket.io/" });

io.bind(engine);

let extensionSocket: Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> | null = null;
let latestVideoState: any = null;

io.on("connection", (socket) => {
  logFile.write(`New connection: ${socket.id}\n`);

  // Nếu chưa có extension → gán socket này là extension
  if (!extensionSocket) {
    extensionSocket = socket;
    socket.emit("role", { role: "EXTENSION" });
    logFile.write(`Extension connected: ${socket.id}\n`);
  }
  // Nếu đã có extension → thay thế
  else {
    logFile.write(
      `Replacing old extension with new connection: ${socket.id}\n`
    );
    if (extensionSocket.connected) {
      extensionSocket.disconnect();
    }
    extensionSocket = socket;
    socket.emit("role", { role: "EXTENSION" });
  }

  // Listen for video state updates from extension
  socket.on("video_state_update", (state) => {
    latestVideoState = state;
    logFile.write(`Video state updated: ${state.title}\n`);
  });

  // Khi extension disconnect → reset
  socket.on("disconnect", () => {
    if (socket === extensionSocket) {
      logFile.write(`Extension disconnected: ${socket.id}\n`);
      extensionSocket = null;
      latestVideoState = null;
    }
  });
});

import * as z from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs";
const server = new McpServer({
  name: "youtube-controller-mcp",
  version: "0.0.1",
});
const logFile = fs.createWriteStream(
  "/home/laffy/Desktop/source-code/local-youtube-controller-mcp/mcp/search_youtube.log",
  { flags: "a" }
);
server.registerTool(
  "search_youtube",
  {
    title: "Search YouTube and get search result",
    description: "Search YouTube and get search result",
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      data: z.array(z.any()),
    }),
  },
  async ({ query }) => {
    logFile.write(`Searching YouTube for: ${query}\n`);
    if (!extensionSocket || !extensionSocket.connected) {
      return {
        content: [{ text: "Error: User not open browser yet", type: "text" }],
        isError: true,
        structuredContent: {
          success: false,
          data: [],
        },
      };
    }
    return new Promise((resolve) => {
      extensionSocket!.emit(
        "command",
        { action: "search", args: { query } },
        (response: any) => {
          logFile.write(`Search result: ${JSON.stringify(response)}\n`);
          resolve({
            content: [{ text: JSON.stringify(response), type: "text" }],
            isError: false,
            structuredContent: response,
          } as any);
        }
      );
    });
  }
);
const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  logFile.write(`Failed to start MCP server: ${err}\n`);
  process.exit(1);
});

export default {
  port: 3000,
  ...engine.handler(),
};
