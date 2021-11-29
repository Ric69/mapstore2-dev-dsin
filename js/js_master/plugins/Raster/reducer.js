const assign = require('object-assign');

const {
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
} = require('./actions');

const initialState = {
    // Configurations
    config: {},
    // Le format d'export sélectionné
    exportFormat: '',
    // Différence entre le nombre de raster sélectionné et les rasters exportable
    exportGap: false,
    // Le nom de la couche en cours
    layerName: '',
    // Etat de chargement
    loading: false,
    // Affichage de la modal
    modal: false,
    // L'index des noms des rasters par couche
    search: {},
    // Les résultats filtré par nom
    searchResults: [],
    // Gestion du "RasterSupport"
    selection: {
        enabled: false,
        type: '',
    },
    // Rasters sélectionnés
    tiles: [],
    // Widget visible
    visible: true,
};

const RasterReducer = (state = initialState, action) => {
    switch (action.type) {
        /**
         * Permet d'ajouter une nouvelle dalle à l'ensemble des dalles sélectionnés
         * On vérifie l'id pour éviter les doublons
         */
        case ADD_RASTER_TILE: {
            const filterTile = state.tiles.filter((tile) => {
                return tile.id === action.tile.id;
            });

            if (filterTile[0]) {
                return state;
            }

            return { ...state, tiles: [...state.tiles, action.tile] };
        }
        /**
         * Modification du format d'export
         */
        case CHANGE_FORMAT: {
            return { ...state, exportFormat: action.format };
        }
        /**
         * Modification du statut de différence entre l'export et les rasters sélectionnés
         */
        case CHANGE_GAP: {
            return { ...state, exportGap: action.gap };
        }
        /**
         * Modifie la valeur
         */
        case CHANGE_RASTER_ENABLED_STATUS: {
            const changeTiles = state.tiles.map((tile) => {
                if (tile.id === action.rasterId) {
                    return { ...tile, enabled: action.status };
                }

                return tile;
            });

            return { ...state, tiles: changeTiles };
        }
        /**
         * Change le status de sélection de la dalle
         * La valeur `selected` permet de savoir si la dalle sera exportée
         */
        case CHANGE_RASTER_SELECTED_STATUS: {
            const changeTiles = state.tiles.map((tile) => {
                if (tile.id === action.rasterId) {
                    return { ...tile, selected: action.status };
                }

                return tile;
            });

            return { ...state, tiles: changeTiles };
        }
        /**
         * Affichage du plugin
         */
        case CHANGE_RASTER_VISIBLE: {
            return { ...state, visible: !state.visible };
        }
        /**
         * Met à jour les noms des rasters par couche
         */
        case CREATE_RASTER_INDEX: {
            return { ...state, search: { ...state.search, [action.layerName]: action.index } };
        }
        /**
         * Affichage du chargement
         */
        case LOADING_RASTER_SELECTION: {
            return { ...state, loading: !state.loading };
        }
        /**
         * Modal
         */
        case MODAL_RASTER: {
            return { ...state, modal: !state.modal };
        }
        /**
         * Suppression d'une tile
         */
        case REMOVE_RASTER_TILE: {
            const tiles = state.tiles.filter((tile) => tile.id !== action.layerId);

            return { ...state, tiles };
        }
        /**
         * Reset les status enabled
         */
        case RESET_RASTER_ENABLED_STATUS: {
            const tiles = state.tiles.map((tile) => ({ ...tile, enabled: true }));

            return { ...state, tiles };
        }
        /**
         * Supprime la sélection des dalles
         */
        case RESET_RASTER_TILES: {
            return { ...state, tiles: [] };
        }
        /**
         * Mise à jour des configurations
         */
        case SET_RASTER_CONFIG: {
            return { ...state, config: action.config };
        }
        /**
         * Défini la couche de sélection
         */
        case SET_RASTER_LAYER: {
            return { ...state, layerName: action.layerName };
        }
        /**
         * Active/Désactive le "Support" sur la carte
         * Permet d'activer l'outil de sélection sur la carte
         * Et défini le mode de sélection
         */
        case TOGGLE_SUPPORT: {
            return {
                ...state,
                selection: {
                    ...state.selection,
                    enabled: !state.selection.enabled,
                    type: action.support,
                },
            };
        }
        case UPDATE_RASTER_INDEX_RESULTS: {
            return { ...state, searchResults: action.results };
        }
        default:
            return state;
    }
};

module.exports = RasterReducer;
