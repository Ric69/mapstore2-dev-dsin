const {
    CONTENT_WINDOW,
    DATE_WINDOW,
    DISABLE_WINDOW,
    ENABLE_WINDOW,
} = require('@js/plugins/WindowModal/actions');

const initialState = {
    enabled: false,
    content: '',
    updated: -1,
};

const WindowModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case CONTENT_WINDOW: {
            return { ...state, content: action.content };
        }
        case DATE_WINDOW: {
            return { ...state, updated: action.timestamp };
        }
        case DISABLE_WINDOW: {
            return { ...state, enabled: false };
        }
        case ENABLE_WINDOW: {
            return { ...state, enabled: true };
        }
        default:
            return state;
    }
};

module.exports = WindowModalReducer;
