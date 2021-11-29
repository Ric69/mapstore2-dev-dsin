/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {
    TOGGLE_ADD,
    SAVE_PICTURE,
    HIGHLIGHT,
    CLEAN_HIGHLIGHT,
    CANCEL_EDIT_PICTURE,
    INIT_PICTURE_GEOMETRY,
    updatePictureGeometry,
    toggleAdd,
} = require('./actions');
const assign = require('object-assign');
const {
    changeDrawingStatus,
    drawSupportReset,
    geometryChanged,
    GEOMETRY_CHANGED,
} = require('../../../MapStore2/web/client/actions/draw');
const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');
const { getMarkerStyle } = require('@mapstore/components/map/openlayers/VectorStyle');

const defaultMarker = {
    iconGlyph: 'camera',
    iconShape: 'circle',
    iconColor: 'red',
};

const toggleDrawOrEdit = (state) => {
    const drawing = state.pictures.drawing;
    const feature = state.pictures.editing;
    const drawOptions = {
        featureProjection: 'EPSG:4326',
        stopAfterDrawing: true,
        editEnabled: !drawing,
        drawEnabled: drawing,
    };
    return changeDrawingStatus(
        'drawOrEdit',
        'Point',
        'pictures',
        [feature],
        drawOptions,
        assign({}, feature.style, {
            highlight: false,
        })
    );
};

module.exports = {
    startDrawMarkerPictureEpic: (action$, store) =>
        action$.ofType(TOGGLE_ADD).switchMap(() => {
            return Rx.Observable.of(toggleDrawOrEdit(store.getState()));
        }),
    endDrawMarkerPictureEpic: (action$, store) =>
        action$
            .ofType(GEOMETRY_CHANGED)
            .filter((action) => action.owner === 'pictures')
            .switchMap((action) => {
                return Rx.Observable.from([
                    updatePictureGeometry(action.features[0].geometry),
                    toggleAdd(),
                ]);
            }),
    removeMarkersPictureEpic: (action$) =>
        action$
            .ofType(CLEAN_HIGHLIGHT, SAVE_PICTURE, CANCEL_EDIT_PICTURE)
            .switchMap(() => Rx.Observable.of(drawSupportReset('pictures'))),
    removeMarkersWhenAbordPictureEpic: (action$) =>
        action$
            .ofType(TOGGLE_CONTROL)
            .filter((action) => action.control === 'pictures')
            .switchMap(() => Rx.Observable.from([resetControls(['pictures'])])),
    highlightPictureEpic: (action$, store) =>
        action$.ofType(HIGHLIGHT).switchMap((action) => {
            let feature = {
                type: 'Feature',
                id: action.id,
                geometry: store.getState().pictures.listpictures.find((p) => p.id === action.id)
                    .geometry,
                newFeature: false,
                properties: { id: action.id },
                style: defaultMarker,
            };
            const drawOptions = {
                featureProjection: 'EPSG:4326',
                stopAfterDrawing: true,
                editEnabled: false,
                drawEnabled: true,
                styleEnabled: getMarkerStyle(defaultMarker),
            };
            return Rx.Observable.of(
                changeDrawingStatus(
                    'drawOrEdit',
                    'Point',
                    'pictures',
                    [feature],
                    drawOptions,
                    defaultMarker
                )
            );
        }),
    createPointFromGPSTag: (action$, store) =>
        action$.ofType(INIT_PICTURE_GEOMETRY).switchMap((action) => {
            let featureDraw = {
                type: 'Feature',
                id: store.getState().pictures.editing.id,
                geometry: action.geometry,
                newFeature: true,
                properties: { id: store.getState().pictures.editing.id },
                style: defaultMarker,
            };
            let featureGeometry = {
                type: 'Feature',
                geometry: action.geometry,
                properties: { id: store.getState().pictures.editing.id },
            };
            const drawOptions = {
                featureProjection: 'EPSG:4326',
                stopAfterDrawing: true,
                editEnabled: false,
                drawEnabled: true,
            };
            return Rx.Observable.from([
                changeDrawingStatus(
                    'drawOrEdit',
                    'Point',
                    'pictures',
                    [featureDraw],
                    drawOptions,
                    assign({}, defaultMarker, { highlight: false })
                ),
                geometryChanged([featureGeometry], 'picture', 'enterEditMode'),
            ]);
        }),
};
