const CHANGE_SELECTED_GEO_PROCESS = 'CHANGE_SELECTED_GEO_PROCESS';
const CHANGE_LAYER = 'CHANGE_LAYER';

/**
 * Mettre à jour l'outil sélectionné
 * @param tool
 * @returns {{type: string, tool: *}}
 */
const changeSelectedProcess = (tool) => {
    return {
        type: CHANGE_SELECTED_GEO_PROCESS,
        tool,
    };
};

/**
 * Mettre à jour la couche sélectionné
 * @param layer
 * @param key
 * @param name
 * @returns {{name: *, type: *, layer: *, key: *}}
 */
const changeLayer = (layer, key, name) => {
    return {
        type: CHANGE_LAYER,
        layer,
        key,
        name,
    };
};

module.exports = {
    CHANGE_SELECTED_GEO_PROCESS,
    CHANGE_LAYER,
    changeSelectedProcess,
    changeLayer,
};
