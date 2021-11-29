const { CHANGE_GEOMETRY_ZORTHO, DISABLE_ZORTHO, ENABLE_ZORTHO } = require('./actions');

const defaultState = {
    show: false,
};

// La méthode appelée lors d'une action
function zOrthoReducer(state = defaultState, action) {
    switch (action.type) {
        case CHANGE_GEOMETRY_ZORTHO: {
            return { ...state, geometry: action.geometry };
        }
        case DISABLE_ZORTHO: {
            return defaultState;
        }
        case ENABLE_ZORTHO: {
            return { ...state, show: true };
        }
        default:
            return state;
    }
}

module.exports = zOrthoReducer;
