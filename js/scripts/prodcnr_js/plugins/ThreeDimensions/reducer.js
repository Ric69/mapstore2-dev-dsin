const { ADD_3D_LAYER, REMOVE_3D_LAYER, ZOOM_3D_LAYER } = require('./actions');
const uuid = require('uuid');

const defaultState = {
    elements: [],
    current: {
        layer: undefined,
        uuid: undefined,
    },
};

// La méthode appelée lors d'une action
function myConfig(state = defaultState, action) {
    switch (action.type) {
        case ADD_3D_LAYER: {
            return {
                ...state,
                elements: [...state.elements, action.layer],
            };
        }
        case REMOVE_3D_LAYER: {
            return {
                ...state,
                elements: (state.elements || []).filter((layer) => layer !== action.layer),
            };
        }
        case ZOOM_3D_LAYER: {
            return {
                ...state,
                current: {
                    layer: action.layer,
                    uuid: uuid.v1(),
                },
            };
        }
        default:
            return state;
    }
}

module.exports = myConfig;
