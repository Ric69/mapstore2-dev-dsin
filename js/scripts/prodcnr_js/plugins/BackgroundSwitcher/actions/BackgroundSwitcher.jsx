/**
 * @author CapGemini
 */
const CHANGE_BACKGROUND_PROPERTIES = 'CHANGE_BACKGROUND_PROPERTIES';
const REORDER_BACKGROUND = 'REORDER_BACKGROUND';
const REASSIGN_LAYERS = 'REASSIGN_LAYERS';

function changeBackgroundProperties(layer, properties) {
    return {
        type: CHANGE_BACKGROUND_PROPERTIES,
        layer,
        properties,
    };
}

function reorderBackground(orderList) {
    return {
        type: REORDER_BACKGROUND,
        orderList,
    };
}

function reassignLayers(layers) {
    return {
        type: REASSIGN_LAYERS,
        layers,
    };
}

module.exports = {
    CHANGE_BACKGROUND_PROPERTIES,
    REORDER_BACKGROUND,
    REASSIGN_LAYERS,
    changeBackgroundProperties,
    reorderBackground,
    reassignLayers,
};
