const { TOGGLE_FILTER, SET_FILTER_INFOS } = require('./actions');
const assign = require('object-assign');

// La méthode appelée lors d'une action
function geoTagReducer(state = { enabled: false }, action) {
    switch (action.type) {
        case TOGGLE_FILTER: {
            return assign({}, state, { enabled: !state.enabled });
        }
        case SET_FILTER_INFOS: {
            return assign({}, state, { ...action.payload });
        }
        default:
            return state;
    }
}

module.exports = geoTagReducer;
