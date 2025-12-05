import type {
  BackendCommand,
  BackendResponse,
  MessageType,
  PlaybackAction,
} from "@shared/types";
import { BackendCommandType } from "@shared/types";
import {
  getYouTubeTabs,
  openYouTube,
  playVideoId,
  searchYouTube,
  sendMessageToTab,
} from "../services/tab-manager";

// Import MessageType enum for constructing messages
import { MessageType as MT, PlaybackAction as PA } from "@shared/types";

/**
 * Handle commands from the MCP server backend
 */
export async function handleBackendCommand(
  command: BackendCommand
): Promise<BackendResponse> {
  const { action, args } = command;

  // Get active YouTube tab
  const { activeTab } = await getYouTubeTabs();

  if (
    !activeTab &&
    action !== BackendCommandType.OPEN_YOUTUBE &&
    action !== BackendCommandType.SEARCH
  ) {
    return {
      success: false,
      error: "No YouTube tab found",
    };
  }

  const tabId = activeTab?.id;
  let result: unknown;
  switch (action) {
    case BackendCommandType.PLAY:
      if (!tabId) throw new Error("No tab");
      const playState = await sendMessageToTab(tabId, {
        type: MT.CONTROL_PLAYBACK,
        payload: { action: PA.PLAY },
      });
      result = { success: true, data: playState };
      break;

    case BackendCommandType.PAUSE:
      if (!tabId) throw new Error("No tab");
      const pauseState = await sendMessageToTab(tabId, {
        type: MT.CONTROL_PLAYBACK,
        payload: { action: PA.PAUSE },
      });
      result = { success: true, data: pauseState };
      break;

    case BackendCommandType.TOGGLE:
      if (!tabId) throw new Error("No tab");
      const toggleState = await sendMessageToTab(tabId, {
        type: MT.CONTROL_PLAYBACK,
        payload: { action: PA.TOGGLE },
      });
      result = { success: true, data: toggleState };
      break;

    case BackendCommandType.NEXT:
      if (!tabId) throw new Error("No tab");
      const nextState = await sendMessageToTab(tabId, {
        type: MT.CONTROL_PLAYBACK,
        payload: { action: PA.NEXT },
      });
      result = { success: true, data: nextState };
      break;

    case BackendCommandType.SEEK:
      if (!tabId) throw new Error("No tab");
      if (args?.time === undefined) throw new Error("Time parameter required");
      const seekState = await sendMessageToTab(tabId, {
        type: MT.SEEK_TO,
        payload: { time: args.time as number },
      });
      result = { success: true, data: seekState };
      break;

    case BackendCommandType.GET_STATE:
      if (!tabId) throw new Error("No tab");
      const state = await sendMessageToTab(tabId, {
        type: MT.GET_VIDEO_STATE,
      });
      result = { success: true, data: state };
      break;

    case BackendCommandType.SEARCH:
      if (!args?.query) throw new Error("Query parameter required");
      const searchResult = await searchYouTube(
        args.query as string,
        MT.GET_SEARCH_RESULT
      );
      result = searchResult;
      break;

    case BackendCommandType.OPEN_YOUTUBE:
      await openYouTube();
      result = { success: true, data: { message: "YouTube opened" } };
      break;

    case BackendCommandType.PLAY_VIDEO_ID:
      if (!args?.videoId) throw new Error("Video ID parameter required");
      await playVideoId(args.videoId as string);
      result = { success: true, data: [] };
      break;

    default:
      result = {
        success: false,
        error: `Unknown action: ${action}`,
      };
  }
  console.log('Command handler result:', action, result);
  return result as BackendResponse;
}
