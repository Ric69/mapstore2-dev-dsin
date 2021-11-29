const TOGGLE_INSERTING = 'ATLAS:TOGGLE_INSERTING';
const TOGGLE_SELECTION = 'ATLAS:TOGGLE_SELECTION';
const SELECTED_LAYER = 'ATLAS:SELECTED_LAYER';
const RESET_LAYERS = 'ATLAS:RESET_LAYERS';
const TOGGLE_VISIBLE = 'ATLAS:TOGGLE_VISIBLE';
const TOGGLE_LOADER = 'ATLAS:TOGGLE_LOADER';

const toggleInserting = (id, extent, crs) => {
    return {
        type: TOGGLE_INSERTING,
        id,
        extent,
        crs,
    };
};

const toggleSelection = () => {
    return {
        type: TOGGLE_SELECTION,
    };
};

const selectLayer = (layerId) => {
    return {
        type: SELECTED_LAYER,
        layerId,
    };
};

const resetLayers = () => {
    return {
        type: RESET_LAYERS,
    };
};

const toggleVisible = () => {
    return {
        type: TOGGLE_VISIBLE,
    };
};

const toggleLoader = () => {
    return {
        type: TOGGLE_LOADER,
    };
};

module.exports = {
    TOGGLE_INSERTING,
    TOGGLE_SELECTION,
    SELECTED_LAYER,
    RESET_LAYERS,
    TOGGLE_VISIBLE,
    TOGGLE_LOADER,
    toggleVisible,
    toggleInserting,
    toggleSelection,
    selectLayer,
    resetLayers,
    toggleLoader,
};
