/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    CHANGE_MEASUREMENT_TOOL,
    CHANGE_MEASUREMENT_STATE,
    CHANGE_UOM,
    CHANGED_GEOMETRY,
} = require('../../../MapStore2/web/client/actions/measurement');

const {
    TOGGLE_CONTROL,
    RESET_CONTROLS,
} = require('../../../MapStore2/web/client/actions/controls');

const {
    ADD_GEOMETRY,
    DISPLAY_GEOMETRY,
    RESET_DISPLAY_GEOMETRY,
    REMOVE_GEOMETRIES,
    REMOVE_GEOMETRY,
    SET_GEOMETRIES,
} = require('./actions');

const assign = require('object-assign');
const defaultState = {
    lineMeasureEnabled: false,
    areaMeasureEnabled: false,
    bearingMeasureEnabled: false,
    geometries: [],
    display: -1,
    uom: {
        length: { unit: 'm', label: 'm' },
        area: { unit: 'sqm', label: 'm²' },
    },
    lengthFormula: 'haversine',
    showLabel: true,
};

function measurement(state = defaultState, action) {
    switch (action.type) {
        case ADD_GEOMETRY:
            const newGeometries = state.geometries.concat(action.geometry);
            return assign({}, state, { geometries: newGeometries });
        case DISPLAY_GEOMETRY:
            return assign({}, state, { display: action.key });
        case RESET_DISPLAY_GEOMETRY:
            return assign({}, state, { active: state.display, display: -1 });
        case REMOVE_GEOMETRIES:
            let geom = [...state.geometries];
            const foundIndex = state.geometries.findIndex((x) => x.id === action.id);
            geom.splice(foundIndex, 1);
            return assign({}, state, { geometries: geom });
        case REMOVE_GEOMETRY:
            return assign({}, state, {
                geometries: state.geometries
                    ? state.geometries.filter((geometry) => geometry.id !== action.id)
                    : [],
            });
        case SET_GEOMETRIES:
            return assign({}, state, { geometries: action.geometries });
        case CHANGE_MEASUREMENT_TOOL: {
            return assign({}, state, {
                active: -1,
                lineMeasureEnabled:
                    action.geomType !== state.geomType && action.geomType === 'LineString',
                areaMeasureEnabled:
                    action.geomType !== state.geomType && action.geomType === 'Polygon',
                bearingMeasureEnabled:
                    action.geomType !== state.geomType && action.geomType === 'Bearing',
                geomType: action.geomType === state.geomType ? null : action.geomType,
                len: 0,
                area: 0,
                bearing: 0,
                feature: {},
            });
        }
        case CHANGE_MEASUREMENT_STATE:
            return assign({}, state, {
                lineMeasureEnabled: action.lineMeasureEnabled,
                areaMeasureEnabled: action.areaMeasureEnabled,
                bearingMeasureEnabled: action.bearingMeasureEnabled,
                geomType: action.geomType,
                point: action.point,
                len: action.len,
                area: action.area,
                bearing: action.bearing,
                lenUnit: action.lenUnit,
                areaUnit: action.areaUnit,
                feature: action.feature,
            });
        case CHANGE_UOM: {
            const prop = action.uom === 'length' ? 'lenUnit' : 'lenArea';
            const { value, label } = action.value;
            return assign({}, state, {
                [prop]: value,
                uom: assign({}, action.previousUom, {
                    [action.uom]: {
                        unit: value,
                        label,
                    },
                }),
            });
        }
        case CHANGED_GEOMETRY: {
            const { feature } = action;
            return assign({}, state, {
                feature,
            });
        }
        case TOGGLE_CONTROL: {
            // TODO: remove this when the controls will be able to be mutually exclusive
            if (action.control === 'info') {
                return {
                    ...state,
                    len: 0,
                    area: 0,
                    bearing: 0,
                    lineMeasureEnabled: false,
                    areaMeasureEnabled: false,
                    bearingMeasureEnabled: false,
                    feature: {},
                    geomType: '',
                };
            }
        }
        case RESET_CONTROLS: {
            return {
                ...state,
                len: 0,
                area: 0,
                bearing: 0,
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false,
                feature: {},
                geomType: '',
            };
        }
        default:
            return state;
    }
}

module.exports = measurement;
