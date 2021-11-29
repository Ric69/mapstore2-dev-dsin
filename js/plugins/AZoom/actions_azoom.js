const ADD_DRAW = 'ADD_DRAW';
const ADD_MARKER = 'ADD_MARKER';
const CHANGE_COORD = 'CHANGE_COORD';
const CHANGE_DRAW = 'CHANGE_DRAW';
const CHANGE_FORMAT = 'CHANGE_FORMAT';
const CHANGE_PROJECTION = 'CHANGE_PROJECTION';
const CHANGE_TOC_STATE = 'DRAWING:CHANGE_TOC_STATE';
const SET_GEOMETRIES = 'SET_GEOMETRIES';
const UPDATE_RESULTS_STYLE = 'UPDATE_RESULTS_STYLE';
const ZOOM_ADD_POINT = 'ZOOM_ADD_POINT';


function addDraw(geometry) {
    return {
        type: ADD_DRAW,
        geometry,
    };
}

/**
 * add a marker to the search result layer
 * @memberof actions.search
 * @param {object} itemPosition
 */
function addMarker(itemPosition, itemText) {
    return {
        type: ADD_MARKER,
        markerPosition: itemPosition,
        markerLabel: itemText
    };
}

/**
 * Change coordinate
 * @memberof actions.search
 * @param {object} coordinate
 */
function changeCoord(coord, val) {
    return {
        type: CHANGE_COORD,
        coord,
        val
    };
}

function changeDraw(geometry, id) {
    return {
        type: CHANGE_DRAW,
        geometry,
        id,
    };
}

/**
 * @param {string} projections
 * @param {string} value unit of projection
 * @param {object} previous projection object
 */
function changeProjection(projections, value, previousProjection) {
    return {
        type: CHANGE_PROJECTION,
        projections,
        value,
        previousProjection,
    };
}

function setGeometries(geometries) {
    return {
        type: SET_GEOMETRIES,
        geometries,
    };
}

/**
 * Change default style of results geometries
 * @memberof actions.search
 * @param {object} style style of results geometries
 */
function updateResultsStyle(style) {
    return {
        type: UPDATE_RESULTS_STYLE,
        style
    };
}

const updateTOCStatus = (status) => {
    return {
        type: CHANGE_TOC_STATE,
        status,
    };
};

/**
 * zoom to a specific point
 * @memberof actions.search
 * @param {object} pos as array [x, y] or object {x: ..., y:...}
 * @param {number} zoom level to zoom to
 * @param {string} crs of the point
*/
function zoomAndAddPoint(pos, zoom, crs) {
    return {
        type: ZOOM_ADD_POINT,
        pos,
        zoom,
        crs
    };
}

module.exports = {
    ADD_DRAW,
    ADD_MARKER,
    CHANGE_COORD,
    CHANGE_DRAW,
    CHANGE_FORMAT,
    CHANGE_PROJECTION,
    CHANGE_TOC_STATE,
    SET_GEOMETRIES,
    ZOOM_ADD_POINT,
    addDraw,
    addMarker,
    changeCoord,
    changeDraw,
    changeProjection,
    setGeometries,
    updateResultsStyle,
    updateTOCStatus,
    zoomAndAddPoint,
};