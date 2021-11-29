const { TOGGLE_STREET_VIEW_STATE } = require('./actions');

const assign = require('object-assign');

function StreetViewReducer(state = { enabled: false }, action) {
    switch (action.type) {
        case TOGGLE_STREET_VIEW_STATE:
            return assign({}, state, {
                enabled: !state.enabled,
            });
        default:
            return state;
    }
}

module.exports = StreetViewReducer;
