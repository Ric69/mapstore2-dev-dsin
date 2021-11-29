const ADD_RASTER_TILE = 'RASTER:ADD';
const CHANGE_FORMAT = 'RASTER:FORMAT';
const CHANGE_GAP = 'RASTER:GAP';
const CHANGE_RASTER_ENABLED_STATUS = 'RASTER:CHANGE_ENABLED';
const CHANGE_RASTER_SELECTED_STATUS = 'RASTER:CHANGE_SELECTED';
const CHANGE_RASTER_VISIBLE = 'RASTER:VISIBLE';
const CREATE_RASTER_INDEX = 'RASTER:INDEX';
const LOADING_RASTER_SELECTION = 'RASTER:LOADING';
const MODAL_RASTER = 'RASTER:MODAL';
const REMOVE_RASTER_TILE = 'RASTER:REMOVE';
const RESET_RASTER_ENABLED_STATUS = 'RASTER:RESET_ENABLED';
const RESET_RASTER_TILES = 'RASTER:RESET_TILES';
const SET_RASTER_CONFIG = 'RASTER:CONFIG';
const SET_RASTER_LAYER = 'RASET:LAYER';
const TOGGLE_SUPPORT = 'RASTER:SUPPORT';
const UPDATE_RASTER_INDEX_RESULTS = 'RASTER:INDEX_RESULTS';

/**
 * Permet d'ajouter une nouvelle dalle à l'ensemble des dalles sélectionnés
 * @param tile
 * @returns object
 */
const addTile = (tile) => ({
    type: ADD_RASTER_TILE,
    tile: {
        enabled: true,
        geometry: tile.geometry,
        id: tile.id,
        id_assemblage: (tile.properties && tile.properties.ID_ASSEMBL) || '',
        layer: tile.layer,
        name: (tile.properties && tile.properties.NOM) || tile.id,
        properties: tile.properties,
        selected: true,
    },
});

/**
 * Modifier le status qui permet de dire si le raster existe dans le format voulu
 * @param rasterId
 * @param status
 * @returns object
 */
const changeEnabledStatus = (rasterId, status) => ({
    type: CHANGE_RASTER_ENABLED_STATUS,
    rasterId,
    status,
});

/**
 * Changement du format d'export
 * @param format
 * @returns {{format: *, type: string}}
 */
const changeExportFormat = (format) => ({
    type: CHANGE_FORMAT,
    format,
});

/**
 * Changement du statut de différence entre l'export et les rasters sélectionnés
 * @param gap boolean
 * @returns {{format: *, type: string}}
 */
const changeExportGap = (gap) => ({
    type: CHANGE_GAP,
    gap,
});

/**
 * Change le status de sélection de la dalle
 * @param rasterId
 * @param status
 * @returns object
 */
const changeSelectedStatus = (rasterId, status) => ({
    type: CHANGE_RASTER_SELECTED_STATUS,
    rasterId,
    status,
});

/**
 * Affichage du plugin
 * @returns object
 */
const changeVisibleState = () => ({
    type: CHANGE_RASTER_VISIBLE,
});

/**
 * Met à jour les nom des tuiles par couche
 * @param layerName
 * @param index
 * @returns object
 */
const createIndex = (layerName, index) => ({
    type: CREATE_RASTER_INDEX,
    layerName,
    index,
});

/**
 * Suppression d'une tile
 * @param layerId
 * @returns object
 */
const removeTile = (layerId) => ({
    type: REMOVE_RASTER_TILE,
    layerId,
});

/**
 * Reset les status enabled
 * @returns object
 */
const resetEnabledStatus = () => ({
    type: RESET_RASTER_ENABLED_STATUS,
});

/**
 * Supprime la sélection
 * @returns object
 */
const resetTiles = () => ({
    type: RESET_RASTER_TILES,
});

/**
 * Mise à jour des configurations
 * @param config
 * @returns object
 */
const setConfig = (config) => ({
    type: SET_RASTER_CONFIG,
    config,
});

/**
 * Défini la couche de sélection
 * @param layerName
 * @returns object
 */
const setLayer = (layerName) => ({
    type: SET_RASTER_LAYER,
    layerName,
});

/**
 * Modifie le status de chargement
 * @returns object
 */
const toggleLoading = () => ({
    type: LOADING_RASTER_SELECTION,
});

/**
 * Affiche ou non la modal
 * @returns object
 */
const toggleModal = () => ({
    type: MODAL_RASTER,
});

/**
 * Active/Désactive le "Support" sur la carte
 * @param support
 * @returns object
 */
const toggleSupport = (support) => ({
    type: TOGGLE_SUPPORT,
    support,
});

/**
 * Mise à jour des résultats de recherche sur l'index
 * @param results
 * @returns {{type: string, results: *}}
 */
const updateResults = (results) => ({
    type: UPDATE_RASTER_INDEX_RESULTS,
    results,
});

module.exports = {
    ADD_RASTER_TILE,
    CHANGE_FORMAT,
    CHANGE_GAP,
    CHANGE_RASTER_ENABLED_STATUS,
    CHANGE_RASTER_SELECTED_STATUS,
    CHANGE_RASTER_VISIBLE,
    CREATE_RASTER_INDEX,
    LOADING_RASTER_SELECTION,
    MODAL_RASTER,
    REMOVE_RASTER_TILE,
    RESET_RASTER_ENABLED_STATUS,
    RESET_RASTER_TILES,
    SET_RASTER_CONFIG,
    SET_RASTER_LAYER,
    TOGGLE_SUPPORT,
    UPDATE_RASTER_INDEX_RESULTS,
    addTile,
    changeEnabledStatus,
    changeExportFormat,
    changeExportGap,
    changeSelectedStatus,
    changeVisibleState,
    createIndex,
    removeTile,
    resetEnabledStatus,
    resetTiles,
    setConfig,
    setLayer,
    toggleLoading,
    toggleModal,
    toggleSupport,
    updateResults,
};
