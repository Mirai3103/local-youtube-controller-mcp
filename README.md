# YouTube Controller MCP

Control your YouTube experience directly from your AI agent using the Model Context Protocol (MCP).

This project consists of two parts:

1.  **Chrome Extension**: Runs in your browser to control the YouTube tab.
2.  **MCP Server**: Connects your AI agent (like Claude Desktop, Cursor, etc.) to the extension via Socket.io.

## Features

- **Remote Control**: Play, pause, and toggle playback.
- **Navigation**: Seek to specific times, play next video.
- **Search**: Search for videos and play them by ID.
- **State Monitoring**: Get current playback status (time, volume, video info).
- **Smart Connection**: Automatically connects to the active YouTube tab.

## Installation

### 1. Install the Extension

1.  Download the latest release `.zip` from the [Releases page](../../releases) (if available) or build from source.
2.  Unzip the file.
3.  Open your browser and go to `chrome://extensions`.
4.  Enable **Developer mode** in the top right.
5.  Click **Load unpacked** and select the unzipped folder (it should contain `manifest.json`).
6.  Open a YouTube tab to initialize the connection.

### 2. Run the MCP Server

You can run the MCP server directly using `npx` without installing anything:

```bash
npx local-ytb-controller-mcp
```

Or add it to your agent's configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "youtube-controller": {
      "command": "npx",
      "args": ["-y", "local-ytb-controller-mcp"]
    }
  }
}
```

## Available Tools

The MCP server exposes the following tools to your AI agent:

| Tool Name         | Description                                             |
| :---------------- | :------------------------------------------------------ |
| `open_youtube`    | Open YouTube in a new tab.                              |
| `search_youtube`  | Search for videos on YouTube.                           |
| `play_video`      | Continue playing the current video.                     |
| `play_video_id`   | Play a specific video by its ID.                        |
| `pause_video`     | Pause the current video.                                |
| `toggle_playback` | Toggle between play and pause.                          |
| `next_video`      | Skip to the next video.                                 |
| `seek_video`      | Seek to a specific time (in seconds).                   |
| `get_state`       | Get current playback state (time, volume, title, etc.). |

## Development

### Prerequisites

- Node.js

### Build from Source

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/youtube-controller.git
    cd youtube-controller
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    # or
    bun install
    ```

3.  **Build everything**:
    ```bash
    npm run build
    ```
    - The extension will be built to `dist/`.
    - The MCP server will be built to `mcp/build/`.

### Local Development

- **Extension**:

  ```bash
  npm run dev
  ```

  Load the `dist` folder in `chrome://extensions`.

- **MCP Server**:
  ```bash
  npm run server
  ```
  This runs the MCP server locally for testing.

## Troubleshooting

- **Extension not connecting**: Ensure the MCP server is running and you have a YouTube tab open. Refresh the YouTube tab.
- **"Socket connection failed"**: The extension attempts to connect to `http://localhost:3000`. Ensure port 3000 is available.
