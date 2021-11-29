const {
    ACTIVE_DRAWING_PROFILE,
    CHANGE_GEOMETRY_PROFILE,
    DESACTIVE_DRAWING_PROFILE,
    HIDE_WINDOW_PROFILE,
    SHOW_WINDOW_PROFILE,
    TOGGLE_WINDOW_PROFILE,
    UPDATE_CURRENT_POSITION_PROFILE,
    DEACTIVATE_PROFILE,
    ENABLE_PROFILE,
    DRAW_PROFILE,
} = require('./actions');

const defaultState = {
    active: false,
    show: false,
    geometry: {},
    position: {},
    draw: false,
};

// La méthode appelée lors d'une action
function myConfig(state = defaultState, action) {
    switch (action.type) {
        case ACTIVE_DRAWING_PROFILE: {
            return { ...state, active: true };
        }
        case CHANGE_GEOMETRY_PROFILE: {
            return { ...state, geometry: action.geometry };
        }
        case DESACTIVE_DRAWING_PROFILE: {
            return { ...state, active: false };
        }
        case DRAW_PROFILE: {
            return { ...state, draw: action.status, show: !action.status };
        }
        case HIDE_WINDOW_PROFILE: {
            return { ...state, show: false, active: false };
        }
        case SHOW_WINDOW_PROFILE: {
            return { ...state, show: true };
        }
        case TOGGLE_WINDOW_PROFILE: {
            return { ...state, show: !state.show };
        }
        case UPDATE_CURRENT_POSITION_PROFILE: {
            return { ...state, position: action.position };
        }
        case ENABLE_PROFILE: {
            return { ...state, active: true, show: true, elements: [...action.elements] };
        }
        case DEACTIVATE_PROFILE: {
            return defaultState;
        }
        default:
            return state;
    }
}

module.exports = myConfig;
