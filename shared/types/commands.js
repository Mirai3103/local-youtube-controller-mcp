// Playback control actions
export var PlaybackAction;
(function (PlaybackAction) {
    PlaybackAction["PLAY"] = "PLAY";
    PlaybackAction["PAUSE"] = "PAUSE";
    PlaybackAction["TOGGLE"] = "TOGGLE";
    PlaybackAction["NEXT"] = "NEXT";
})(PlaybackAction || (PlaybackAction = {}));
// Backend command types
export var BackendCommandType;
(function (BackendCommandType) {
    BackendCommandType["PLAY"] = "play";
    BackendCommandType["PAUSE"] = "pause";
    BackendCommandType["TOGGLE"] = "toggle";
    BackendCommandType["NEXT"] = "next";
    BackendCommandType["SEEK"] = "seek";
    BackendCommandType["SEARCH"] = "search";
    BackendCommandType["GET_STATE"] = "get_state";
    BackendCommandType["OPEN_YOUTUBE"] = "open_youtube";
    BackendCommandType["PLAY_VIDEO_ID"] = "play_video_id";
})(BackendCommandType || (BackendCommandType = {}));
