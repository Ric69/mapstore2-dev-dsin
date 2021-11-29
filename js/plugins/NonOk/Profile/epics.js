const Rx = require('rxjs');

const MapUtils = require('@mapstore/utils/MapUtils');
const CoordinatesUtils = require('@mapstore/utils/CoordinatesUtils');

const {
    DEACTIVATE_PROFILE,
    DRAW_PROFILE,
    CHANGE_GEOMETRY_PROFILE,
    changeGeometryProfile,
    enableProfile,
} = require('./actions');
const { MAP_CONFIG_LOADED } = require('@mapstore/actions/config');
const {
    END_DRAWING,
    changeDrawingStatus,
    drawSupportReset,
    drawSupportStop,
} = require('@mapstore/actions/draw');
const { configurePrintMap } = require('@mapstore/actions/print');
const { addWFSLayer } = require('@mapstore/actions/layers');
const WFS = require('@mapstore/api/WFS');
const { TOGGLE_CONTROL, resetControls } = require('@mapstore/actions/controls');

const importFile = (action$) =>
    action$.ofType(CHANGE_GEOMETRY_PROFILE).switchMap((action) => {
        if (action.geometry.method === 'import-shp' || action.geometry.method === 'import-dxf') {
            const feature = {
                type: 'Feature',
                geometry: {
                    type: action.geometry.type,
                    coordinates: action.geometry.coordinates,
                },
                properties: {},
                id: action.geometry.id,
                crs: action.geometry.projection,
            };
            return Rx.Observable.from([
                enableProfile(['profile', 'resume', 'settings']),
                changeDrawingStatus('drawOrEdit', 'LineString', 'profile', [feature], {
                    featureProjection: 'EPSG:3857',
                    stopAfterDrawing: true,
                    editEnabled: false,
                    drawEnabled: false,
                }),
                addWFSLayer(
                    'profile',
                    WFS.setGeoJson(
                        feature,
                        {
                            name: 'profile',
                        }
                    )
                ),
            ]);
        }

        return Rx.Observable.empty();
    });

const showChartProfile = (action$, store) =>
    action$
        .ofType(END_DRAWING)
        .filter(
            () =>
                (store.getState().controls &&
                    store.getState().controls.profile &&
                    store.getState().controls.profile.enabled) ||
                false
        )
        .switchMap((action) => {
            return Rx.Observable.from([
                changeGeometryProfile(action.geometry),
                enableProfile(['profile', 'resume', 'settings']),
                drawSupportStop('profile'),
                addWFSLayer(
                    'profile',
                    WFS.setGeoJson(
                        {
                            type: 'Feature',
                            geometry: {
                                type: action.geometry.type,
                                coordinates: action.geometry.coordinates,
                            },
                            properties: {},
                        },
                        {
                            name: 'profile',
                        }
                    )
                ),
            ]);
        });

const toggleDrawProfile = (action$, store) =>
    action$.ofType(DRAW_PROFILE).switchMap(() => {
        if (store.getState().draw) {
            return Rx.Observable.from([
                resetControls('profile'),
                changeDrawingStatus('start', 'LineString', 'profile', [], {
                    plugin: 'profile',
                }),
            ]);
        }

        return Rx.Observable.empty();
    });

/**
 * Chargement des configurations par rapport à l'emprise pour l'impression
 * Utilisé également dans le plugin Atlas
 * @param action$
 * @param store
 * @returns {Observable<{currentLocale, center, layers, scale, zoom, projection, type, scaleZoom}|*>}
 */
const showProfile = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED).switchMap(() => {
        const state = store.getState();
        const newMap = state.map.present;
        const mapZoom = newMap.zoom;

        const projection = newMap.projection;
        const resolutions = MapUtils.getResolutions();
        const units = CoordinatesUtils.getUnits(projection);
        const dpm = 96 * (100 / 2.54);
        const scales = resolutions.map(
            (resolution) => resolution * dpm * (units === 'degrees' ? 111194.87428468118 : 1)
        );

        const layers = state.layers.flat.filter((layer) => {
            if (layer.visibility === true) {
                return layer;
            }
        });

        return Rx.Observable.of(
            configurePrintMap(
                newMap.center,
                mapZoom,
                mapZoom,
                scales[mapZoom],
                layers,
                newMap.projection,
                state.locale.current
            )
        );
    });

const toggleProfile = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'profile')
        .switchMap(() => {
            const state = store.getState();
            if (
                (state.controls && state.controls.profile && state.controls.profile.enabled) ||
                false
            ) {
                return Rx.Observable.from([resetControls('profile'), enableProfile(['settings'])]);
            }

            return Rx.Observable.empty();
        });

const disactivateProfile = (action$) =>
    action$
        .ofType(DEACTIVATE_PROFILE)
        .switchMap(() => Rx.Observable.from([drawSupportReset('profile')]));

module.exports = {
    toggleProfile,
    showChartProfile,
    showProfile,
    disactivateProfile,
    toggleDrawProfile,
    importFile,
};
