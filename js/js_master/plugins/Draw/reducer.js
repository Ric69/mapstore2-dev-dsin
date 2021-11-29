const assign = require('object-assign');
const { isEmpty } = require('lodash');

const {
    SHOW_WINDOW_DRAWING,
    ADD_DRAW,
    SAVE_DRAWING,
    DISPLAY_DRAW,
    RESET_DISPLAY_DRAWS,
    REMOVE_DRAWS,
    SET_GEOMETRIES,
    CHANGE_PROJECTION,
    CHANGE_DRAW,
    CHANGE_TOC_STATE,
} = require('./actions');
const CoordinatesUtils = require('../../../MapStore2/web/client/utils/CoordinatesUtils');

const defaultState = {
    active: false,
    show: false,
    display: -1,
    geometries: [],
    lengthFormula: 'haversine',
    showLabel: true,
    type: 'Feature',
    features: [],
    projections: {
        defaultProjection: { unit: 'EPSG:4326', label: 'WGS84' },
    },
    TOC: {
        id: undefined,
        active: false,
    },
};

function myConfig(state = defaultState, action) {
    switch (action.type) {
        case SHOW_WINDOW_DRAWING: {
            return assign({}, state, { show: action.show });
        }
        case ADD_DRAW: {
            const newGeometries = state.geometries.concat(action.geometry);
            const newlayer = {
                geometry: {
                    coordinates: action.geometry.coordinates,
                    type: action.geometry.type,
                },
                type: 'Feature',
            };
            return assign({}, state, {
                geometries: newGeometries,
                features: [newlayer],
            });
        }
        case CHANGE_DRAW: {
            const geom = state.geometries;
            const foundIndex = geom.findIndex((x) => x.id === action.id);
            let id =
                !isEmpty(state.geometries) && state.geometries[foundIndex]
                    ? state.geometries[foundIndex].id
                    : false;
            let type =
                !isEmpty(state.geometries) && state.geometries[foundIndex]
                    ? state.geometries[foundIndex].type
                    : 'Polygon';

            let feature = {
                geometry: {
                    coordinates: action.geometry,
                    type,
                },
                type: 'Feature',
            };
            if (id) {
                feature['id'] = id;
            }

            let myFeature = Object.assign({}, feature);

            let drawReproject = CoordinatesUtils.reprojectGeoJson(
                myFeature,
                'EPSG:4326',
                'EPSG:3857'
            );
            return assign({}, state, {
                geometries: state.geometries.map((geometries, index) => {
                    if (index === foundIndex) {
                        return Object.assign({}, geometries, {
                            coordinates: drawReproject.geometry.coordinates,
                        });
                    }
                    return geometries;
                }),
            });
        }
        case CHANGE_TOC_STATE:
            return { ...state, TOC: action.status };
        case DISPLAY_DRAW:
            return assign({}, state, { display: action.key });
        case SAVE_DRAWING: {
            let list = (state.list || [])
                .slice()
                .concat({ name: action.name, id: null, draw: action.geometries });
            return state, { list };
        }
        case CHANGE_PROJECTION: {
            const { value, label } = action.value;
            return assign({}, state, {
                projections: assign({}, action.previousProjection, {
                    defaultProjection: {
                        unit: value,
                        label,
                    },
                }),
            });
        }
        case RESET_DISPLAY_DRAWS:
            return assign({}, state, { display: -1 });
        case REMOVE_DRAWS:
            return assign({}, state, { geometries: [] });
        case SET_GEOMETRIES:
            return assign({}, state, { geometries: action.geometries });
        default:
            return state;
    }
}

module.exports = myConfig;
