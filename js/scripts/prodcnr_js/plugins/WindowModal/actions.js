const CONTENT_WINDOW = 'WINDOW_MODAL:CONTENT';
const DATE_WINDOW = 'WINDOW_MODAL:DATE';
const DISABLE_MAP_WINDOW = 'WINDOW_MODAL:DISABLE_MAP';
const DISABLE_WINDOW = 'WINDOW_MODAL:DISABLE';
const ENABLE_MAP_WINDOW = 'WINDOW_MODAL:ENABLE_MAP';
const ENABLE_WINDOW = 'WINDOW_MODAL:ENABLE';

const changeWindowContent = (content) => ({
    type: CONTENT_WINDOW,
    content,
});

const changeWindowDate = (timestamp) => ({
    type: DATE_WINDOW,
    timestamp,
});

const disableMapWindow = (mapId, timestamp) => ({
    type: DISABLE_MAP_WINDOW,
    mapId,
    timestamp,
});

const disableWindow = () => ({
    type: DISABLE_WINDOW,
});

const enableMapWindow = (mapId) => ({
    type: ENABLE_MAP_WINDOW,
    mapId,
});

const enableWindow = () => ({
    type: ENABLE_WINDOW,
});

module.exports = {
    CONTENT_WINDOW,
    DATE_WINDOW,
    DISABLE_MAP_WINDOW,
    DISABLE_WINDOW,
    ENABLE_MAP_WINDOW,
    ENABLE_WINDOW,
    changeWindowContent,
    changeWindowDate,
    disableMapWindow,
    disableWindow,
    enableMapWindow,
    enableWindow,
};
