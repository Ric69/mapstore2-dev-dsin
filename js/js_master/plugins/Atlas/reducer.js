const assign = require('object-assign');

const {
    TOGGLE_INSERTING,
    TOGGLE_SELECTION,
    SELECTED_LAYER,
    RESET_LAYERS,
    TOGGLE_VISIBLE,
    TOGGLE_LOADER,
} = require('./actions');

const initialState = {
    visible: true,
    selection: { enabled: false },
    layer: '',
    layers: {},
    loader: false,
};

const AtlasReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_INSERTING: {
            const layers = assign({}, state.layers);
            const id = action.id;
            if (!layers[id]) {
                layers[id] = {
                    id: action.id,
                    crs: action.crs || 'EPSG:2154',
                    extent: action.extent,
                };
            }

            return { ...state, layers };
        }
        case TOGGLE_SELECTION: {
            const selection = {
                enabled:
                    state.selection && state.selection.enabled ? !state.selection.enabled : true,
            };

            return { ...state, selection };
        }
        case SELECTED_LAYER: {
            return { ...state, layer: action.layerId };
        }
        case TOGGLE_VISIBLE: {
            return { ...state, visible: !state.visible };
        }
        case TOGGLE_LOADER: {
            return { ...state, loader: !state.loader };
        }
        case RESET_LAYERS: {
            return { ...state, layers: {} };
        }
        default:
            return state;
    }
};

module.exports = AtlasReducer;
