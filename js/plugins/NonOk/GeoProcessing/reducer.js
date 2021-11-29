const assign = require('object-assign');

const { CHANGE_SELECTED_GEO_PROCESS, CHANGE_LAYER } = require('./actions');
const { TOGGLE_CONTROL } = require('../../../MapStore2/web/client/actions/controls');

const initialState = {
    selectedTool: null,
    sourceLayer: null,
    destLayer: null,
    names: {},
};

const geoProcessing = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_LAYER: {
            let layer = {};
            /**
             * action.key correspond à sourceLayer|destLayer
             */
            layer[action.key] = action.layer;

            return assign({}, state, {
                [action.key]: action.layer,
                names: assign({}, state.names, { [action.key]: action.name }),
            });
        }
        case CHANGE_SELECTED_GEO_PROCESS: {
            if (action.tool !== state.selectedTool) {
                return assign({}, state, {
                    selectedTool: action.tool,
                });
            }
            return state;
        }
        case TOGGLE_CONTROL: {
            if (action.control === 'geoprocessing') {
                return assign({}, state, {
                    selectedTool: null,
                    sourceLayer: null,
                    destLayer: null,
                });
            }
            return state;
        }
        default:
            return state;
    }
};

module.exports = geoProcessing;
