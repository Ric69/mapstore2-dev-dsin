/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const { PURGE_MAPINFO_RESULTS } = require('../../../MapStore2/web/client/actions/mapInfo');
const { TOGGLE_CONTROL } = require('../../../MapStore2/web/client/actions/controls');
const {
    CLOSE_PICTURES,
    CONFIRM_CLOSE_PICTURES,
    CANCEL_CLOSE_PICTURES,
    CANCEL_EDIT_PICTURE,
    SAVE_PICTURE,
    TOGGLE_ADD,
    UPDATE_PICTURE_GEOMETRY,
    NEW_PICTURE,
    INIT_PICTURE_GEOMETRY,
} = require('./actions');

const uuid = require('uuid');
const defaultMarker = {
    iconGlyph: 'camera',
    iconShape: 'circle',
    iconColor: 'red',
};

const PictureReducer = (state = { listpictures: [] }, action) => {
    switch (action.type) {
        case NEW_PICTURE:
            const id = uuid.v1();
            return assign({}, state, {
                editing: {
                    type: 'Feature',
                    id,
                    geometry: null,
                    newFeature: true,
                    properties: {
                        id,
                    },
                    style: defaultMarker,
                },
                featureType: action.featureType,
            });
        case CLOSE_PICTURES:
            return assign({}, state, {
                closing: true,
            });
        case CONFIRM_CLOSE_PICTURES:
            return assign({}, state, {
                editing: null,
                drawing: false,
                closing: false,
            });
        case CANCEL_CLOSE_PICTURES:
            return assign({}, state, {
                closing: false,
            });
        case CANCEL_EDIT_PICTURE:
            return assign({}, state, {
                editing: null,
                drawing: false,
            });
        case SAVE_PICTURE:
            let pict = (state.listpictures || []).slice();
            pict.unshift({
                id: action.id,
                picture: action.picture,
                geometry: action.geometry,
                comment: action.comment,
            });
            return assign({}, state, {
                editing: null,
                listpictures: pict,
                drawing: false,
            });
        case PURGE_MAPINFO_RESULTS:
            return assign({}, state, {
                editing: null,
                drawing: false,
                filter: null,
            });
        case UPDATE_PICTURE_GEOMETRY:
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    geometry: action.geometry,
                }),
            });
        case INIT_PICTURE_GEOMETRY:
            if (state.editing.geometry) {
                return state;
            } else {
                return assign({}, state, {
                    editing: assign({}, state.editing, {
                        geometry: action.geometry,
                    }),
                });
            }
        case TOGGLE_ADD:
            return assign({}, state, {
                drawing: !state.drawing,
            });
        case TOGGLE_CONTROL:
            if (action.control === 'pictures') {
                return assign({}, state, {
                    current: null,
                    editing: null,
                    drawing: false,
                    closing: false,
                });
            }
            return state;
        default:
            return state;
    }
};

module.exports = PictureReducer;
