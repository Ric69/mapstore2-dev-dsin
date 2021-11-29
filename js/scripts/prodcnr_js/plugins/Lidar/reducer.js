const assign = require('object-assign');

const { GET_FEATURE_LIDAR } = require('./actions');

const defaultState = {
    features: {},
};

const lidarReducer = (state = defaultState, action) => {
    switch (action.type) {
        case GET_FEATURE_LIDAR: {
            return assign({}, state, { features: assign({}, state.features, action.feature) });
        }
        default:
            return state;
    }
};

module.exports = lidarReducer;
