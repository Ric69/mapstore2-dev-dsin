const Rx = require('rxjs');
const { isEmpty } = require('lodash');
const axios = require('../../../MapStore2/web/client/libs/ajax');

const { getConfigProp } = require('../../../MapStore2/web/client/utils/ConfigUtils');
const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');
const {
    changeLayerProperties,
    removeLayer,
} = require('../../../MapStore2/web/client/actions/layers');
const {
    CHANGE_RASTER_ENABLED_STATUS,
    CHANGE_RASTER_SELECTED_STATUS,
    REMOVE_RASTER_TILE,
    RESET_RASTER_ENABLED_STATUS,
    RESET_RASTER_TILES,
    createIndex,
} = require('./actions');
const { MAP_CONFIG_LOADED } = require('../../../MapStore2/web/client/actions/config');
const RasterUtils = require('./utils');
const ConfigUtils = require('../../../MapStore2/web/client/utils/ConfigUtils');
const API = {
    WFS: require('../../../MapStore2/web/client/api/WFS'),
};

/**
 * Après modification du statut de "sélection" ou "d'activation", on modifie la visibility de la couche
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const changeVisibilityLayerAfterSelection = (action$, store) =>
    action$
        .ofType(CHANGE_RASTER_SELECTED_STATUS, CHANGE_RASTER_ENABLED_STATUS)
        .switchMap((action) => {
            const state = store.getState();
            const filterLayer = state.layers.flat.filter((layer) => layer.id === action.rasterId);
            if (isEmpty(filterLayer)) {
                return Rx.Observable.empty();
            }

            return Rx.Observable.of(
                changeLayerProperties(action.rasterId, { visibility: action.status })
            );
        });

/**
 * Lors du chargement de la carte, on charge les features des couches "rasters" pour indexé les données (pour la recherche par nom)
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const loadRasterName = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED).switchMap((action) => {
        const config = getConfigProp('rasterOptions');
        const indexes = [];

        if (config.layers && !isEmpty(config.layers)) {
            config.layers.map((layerName) => {
                const url = API.WFS.getUrl(getConfigProp('georchestraUrl'), {
                    typename: layerName,
                });

                axios
                    .get(url)
                    .then((response) => response.data)
                    .then((data) => {
                        const index = RasterUtils.createIndexes(
                            (data && data.features) || [],
                            layerName
                        );
                        store.dispatch(createIndex(layerName, index));
                    });
            });
        }

        return Rx.Observable.empty();
    });

/**
 * Lors de la suppression d'une dalle, on supprime également la couche temporaire
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const removeLayerAfterTile = (action$, store) =>
    action$.ofType(REMOVE_RASTER_TILE, RESET_RASTER_TILES).switchMap((action) => {
        const state = store.getState();
        const layers = state.layers.flat;

        if (action.type === RESET_RASTER_TILES) {
            layers.map((layer) => {
                if (layer.group === ConfigUtils.getConfigProp('rasterOptions').group) {
                    store.dispatch(removeLayer(layer.id, layer.group));
                }
            });
        } else {
            layers.map((layer) => {
                if (layer.id === action.layerId) {
                    store.dispatch(removeLayer(layer.id, layer.group));
                }
            });
        }

        return Rx.Observable.empty();
    });

/**
 * Lorsqu'on reset les status des dalles, on reset également la visibility de la couche
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const resetVisibilityLayers = (action$, store) =>
    action$.ofType(RESET_RASTER_ENABLED_STATUS).switchMap((action) => {
        const state = store.getState();
        const layers = state.layers.flat;

        layers.map((layer) => {
            if (layer.group === ConfigUtils.getConfigProp('rasterOptions').group) {
                store.dispatch(changeLayerProperties(layer.id, { visibility: true }));
            }
        });

        return Rx.Observable.empty();
    });

/**
 * ToggleControl du widget
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const startStopRaster = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'raster')
        .switchMap(() => {
            const state = store.getState();
            if (state.controls && state.controls.raster && state.controls.raster.enabled) {
                return Rx.Observable.from([resetControls(['raster'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

module.exports = {
    changeVisibilityLayerAfterSelection,
    loadRasterName,
    removeLayerAfterTile,
    resetVisibilityLayers,
    startStopRaster,
};
