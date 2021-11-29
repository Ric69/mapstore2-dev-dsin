const {
    ACTIVE_DRAWING_SEARCH,
    CHANGE_FULL_TEXT_RESULT_SEARCH,
    CHANGE_GEOMETRY_SEARCH,
    DELETE_GEOMETRY_SEARCH,
    DESACTIVE_DRAWING_SEARCH,
    DESACTIVE_FULL_TEXT_RESULT_SEARCH,
    RESET_SEARCH,
    SHOW_ELEMENT_SEARCH,
    UPDATE_SEARCH,
    CHANGE_DEFAULT_GEOMETRY_SEARCH,
} = require('./actions');

const defaultState = {
    active: false,
    geometry: {},
    defaultGeometry: undefined,
    show: false,
    text: '',
    results: {
        show: false,
        id_selected: undefined,
        data: [],
    },
};

// La méthode appelée lors d'une action
function myConfig(state = defaultState, action) {
    switch (action.type) {
        case ACTIVE_DRAWING_SEARCH: {
            return { ...state, active: true };
        }
        case CHANGE_FULL_TEXT_RESULT_SEARCH: {
            return {
                ...state,
                results: { show: true, data: action.results },
            };
        }
        case CHANGE_GEOMETRY_SEARCH: {
            return { ...state, geometry: action.geometry };
        }
        case CHANGE_DEFAULT_GEOMETRY_SEARCH: {
            return { ...state, defaultGeometry: action.geometry };
        }
        case DELETE_GEOMETRY_SEARCH: {
            return { ...state, geometry: undefined };
        }
        case DESACTIVE_DRAWING_SEARCH: {
            return { ...state, active: false };
        }
        case DESACTIVE_FULL_TEXT_RESULT_SEARCH: {
            return {
                ...state,
                results: { show: false, data: [] },
            };
        }
        case RESET_SEARCH: {
            return { ...state, text: '' };
        }
        case SHOW_ELEMENT_SEARCH: {
            return {
                ...state,
                results: { ...state.results, id_selected: action.id },
            };
        }
        case UPDATE_SEARCH: {
            return { ...state, text: action.text };
        }
        default:
            return state;
    }
}

module.exports = myConfig;
