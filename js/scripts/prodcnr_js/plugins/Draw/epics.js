const Rx = require('rxjs');

const {
    END_DRAWING,
    GEOMETRY_CHANGED,
    drawSupportReset,
} = require('../../../MapStore2/web/client/actions/draw');
const { addDraw, changeDraw } = require('./actions');
const { addLayer, removeLayer } = require('../../../MapStore2/web/client/actions/layers');
const {
    TOGGLE_CONTROL,
    SET_CONTROL_PROPERTY,
    resetControls,
} = require('../../../MapStore2/web/client/actions/controls');

const { generateId, getExtent, groupDrawing } = require('../../utils/DrawUtils').default;
const CoordinatesUtils = require('../../../MapStore2/web/client/utils/CoordinatesUtils');

const addDrawEpic = (action$, store) =>
    action$
        .ofType(END_DRAWING)
        .filter((action) => action.owner && ['drawing'].includes(action.owner))
        .switchMap((action) => {
            const state = store.getState();
            const { coordinates, type } = action.geometry;

            if (type === 'Polygon') {
                coordinates[0].push(coordinates[0][0]);
            }
            const feature = {
                geometry: {
                    coordinates: coordinates,
                    type: type,
                },
                type: 'Feature',
                id: action.geometry.id,
                title: groupDrawing + ' ' + generateId(groupDrawing, state),
            };
            const geometry = action.geometry;
            let geometryExtent = [];
            if (geometry.extent) {
                geometryExtent = geometry.extent;
            } else {
                geometryExtent = getExtent(geometry);
            }

            return Rx.Observable.of(
                addDraw(geometry),
                addLayer({
                    bbox: {
                        bounds: {
                            minx: geometryExtent[0],
                            miny: geometryExtent[1],
                            maxx: geometryExtent[2],
                            maxy: geometryExtent[3],
                        },
                        crs: 'EPSG:3857',
                    },
                    id: feature.id,
                    geoJson: feature,
                    type: 'wfs',
                    title: feature.title,
                    group: groupDrawing,
                    visibility: true,
                    opacity: 1,
                    projection: 'EPSG:4326',
                })
            );
        });

const toggleDrawing = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'drawing')
        .switchMap(() => {
            const state = store.getState();
            if (state.controls && state.controls.drawing && state.controls.drawing.enabled) {
                return Rx.Observable.of(resetControls('drawing'));
            } else {
                return Rx.Observable.of(drawSupportReset('drawing'));
            }
        });

const changeDrawEpic = (action$, store) =>
    action$
        .ofType(GEOMETRY_CHANGED)
        .filter((action) => action.owner && ['TOC'].includes(action.owner))
        .switchMap((action) => {
            const state = store.getState();
            const oldLayer = (state.layers.flat || []).filter(
                (layer) => {
                    if (state.draw.features && !state.draw.features[0]) {
                        return false;
                    }
                    return layer.id === state.draw.features[0].id;
                }
            );
            const GroupAssign = (oldLayer[0] && oldLayer[0].group) || (state.draw.features && state.draw.features.group) || groupDrawing;

            if (
                state.draw.features.group === 'Local shape' ||
                state.draw.features.type === 'FeatureCollection'
            ) {
                const id = state.draw.options.ftId;
                const featureCollection = {
                    ...state.draw.features,
                    group: GroupAssign,
                    title: state.draw.features.title,
                    id: id,
                };

                let features = [...state.draw.features.features];

                features = features.map((feature, key) => {
                    feature.geometry.coordinates = action.features[key].geometry.coordinates;

                    return CoordinatesUtils.reprojectGeoJson(feature, 'EPSG:4326', 'EPSG:3857');
                });

                featureCollection.features = features;
                const geometryExtent = getExtent(features);

                return Rx.Observable.of(
                    addDraw(features),
                    removeLayer(id),
                    addLayer({
                        bbox: {
                            bounds: {
                                maxx: geometryExtent[0],
                                maxy: geometryExtent[1],
                                minx: geometryExtent[2],
                                miny: geometryExtent[3],
                            },
                            crs: 'EPSG:3857',
                        },
                        id: id,
                        geoJson: featureCollection,
                        type: 'wfs',
                        title: featureCollection.title,
                        group: GroupAssign,
                        visibility: true,
                        opacity: 1,
                        projection: 'EPSG:4326',
                    })
                );
            } else {
                const id = state.draw.features[0].id;
                const feature = {
                    geometry: {
                        coordinates: action.features[0].geometry.coordinates,
                        type: action.features[0].geometry.type,
                    },
                    type: 'Feature',
                    group: GroupAssign,
                    id: state.draw.features[0].id,
                    title: state.draw.features[0].title,
                };
                const geometryExtent = getExtent(feature);
                const geom = action.features[0].geometry.coordinates;
                let drawReproject = CoordinatesUtils.reprojectGeoJson(
                    feature,
                    'EPSG:4326',
                    'EPSG:3857'
                );
                let newLayer = {
                    bbox: {
                        bounds: {
                            maxx: geometryExtent[0],
                            maxy: geometryExtent[1],
                            minx: geometryExtent[2],
                            miny: geometryExtent[3],
                        },
                        crs: 'EPSG:4326',
                    },
                    id: id,
                    geoJson: drawReproject,
                    type: 'wfs',
                    title: state.draw.features[0].title,
                    group: GroupAssign,
                    visibility: true,
                    opacity: 1,
                    projection: 'EPSG:4326',
                };

                if (oldLayer.length > 0) {
                    if (oldLayer[0].style) {
                        newLayer.style = oldLayer[0].style;
                    }
                }

                return Rx.Observable.from([
                    removeLayer(id),
                    addLayer(newLayer),
                    changeDraw(geom, id),
                ]);
            }
        });

const startStopDrawing = (action$) =>
    action$.ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY).switchMap(() => {
        return Rx.Observable.of(drawSupportReset('TOC'));
    });

module.exports = { addDrawEpic, changeDrawEpic, startStopDrawing, toggleDrawing };
