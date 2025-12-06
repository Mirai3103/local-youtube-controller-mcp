// Message types for extension communication
export var MessageType;
(function (MessageType) {
    MessageType["GET_YOUTUBE_TABS"] = "GET_YOUTUBE_TABS";
    MessageType["GET_VIDEO_STATE"] = "GET_VIDEO_STATE";
    MessageType["CONTROL_PLAYBACK"] = "CONTROL_PLAYBACK";
    MessageType["SEEK_TO"] = "SEEK_TO";
    MessageType["OPEN_YOUTUBE"] = "OPEN_YOUTUBE";
    MessageType["SEARCH_YOUTUBE"] = "SEARCH_YOUTUBE";
    // VIDEO_STATE_UPDATE = 'VIDEO_STATE_UPDATE',
    MessageType["GET_SEARCH_RESULT"] = "GET_SEARCH_RESULT";
    MessageType["DO_SEARCH_ACTION"] = "DO_SEARCH_ACTION";
    MessageType["CLICK_SEARCH_BY_ID"] = "CLICK_SEARCH_BY_ID";
})(MessageType || (MessageType = {}));
