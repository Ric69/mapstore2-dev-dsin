const ADD_3D_LAYER = 'ADD_3D_LAYER';
const REMOVE_3D_LAYER = 'REMOVE_3D_LAYER';
const ZOOM_3D_LAYER = 'ZOOM_3D_LAYER';

function add3DLayer(layer) {
    return {
        type: ADD_3D_LAYER,
        layer: layer,
    };
}

function remove3DLayer(layer) {
    return {
        type: REMOVE_3D_LAYER,
        layer: layer,
    };
}

function zoom3DLayer(layer) {
    return {
        type: ZOOM_3D_LAYER,
        layer: layer,
    };
}

module.exports = {
    ADD_3D_LAYER,
    add3DLayer,
    REMOVE_3D_LAYER,
    remove3DLayer,
    ZOOM_3D_LAYER,
    zoom3DLayer,
};
