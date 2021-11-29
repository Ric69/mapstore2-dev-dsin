const SHOW_WINDOW_DRAWING = 'SHOW_WINDOW_DRAWING';
const HIDE_WINDOW_DRAWING = 'HIDE_WINDOW_DRAWING';
const ADD_DRAW = 'ADD_DRAW';
const DISPLAY_DRAW = 'DISPLAY_DRAW';
const SAVE_DRAWING = 'SAVE_DRAWING';
const SELECT_DRAW = 'SELECT_DRAW';
const RESET_DISPLAY_DRAWS = 'RESET_DISPLAY_DRAWS';
const REMOVE_DRAWS = 'REMOVE_DRAWS';
const SET_GEOMETRIES = 'SET_GEOMETRIES';
const CHANGE_PROJECTION = 'CHANGE_PROJECTION';
const CHANGE_DRAW = 'CHANGE_DRAW';
const CHANGE_TOC_STATE = 'DRAWING:CHANGE_TOC_STATE';

function showWindowDrawing() {
    return {
        type: SHOW_WINDOW_DRAWING,
        show: true,
    };
}

function hideWindowDrawing() {
    return {
        type: SHOW_WINDOW_DRAWING,
        show: false,
    };
}

function addDraw(geometry) {
    return {
        type: ADD_DRAW,
        geometry,
    };
}
function changeDraw(geometry, id) {
    return {
        type: CHANGE_DRAW,
        geometry,
        id,
    };
}

function displayDraw(key) {
    return {
        type: DISPLAY_DRAW,
        key,
    };
}

function saveDrawing(name, geometries) {
    return {
        type: SAVE_DRAWING,
        name,
        geometries,
    };
}

function selectDraw(draw) {
    return {
        type: SELECT_DRAW,
        draw,
    };
}

function resetDisplayDraws() {
    return {
        type: RESET_DISPLAY_DRAWS,
    };
}

function removeDraws() {
    return {
        type: REMOVE_DRAWS,
    };
}

function setGeometries(geometries) {
    return {
        type: SET_GEOMETRIES,
        geometries,
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

const updateTOCStatus = (status) => {
    return {
        type: CHANGE_TOC_STATE,
        status,
    };
};

module.exports = {
    ADD_DRAW,
    CHANGE_PROJECTION,
    CHANGE_DRAW,
    DISPLAY_DRAW,
    HIDE_WINDOW_DRAWING,
    REMOVE_DRAWS,
    RESET_DISPLAY_DRAWS,
    SAVE_DRAWING,
    SELECT_DRAW,
    SET_GEOMETRIES,
    SHOW_WINDOW_DRAWING,
    CHANGE_TOC_STATE,
    addDraw,
    changeProjection,
    changeDraw,
    displayDraw,
    hideWindowDrawing,
    removeDraws,
    resetDisplayDraws,
    saveDrawing,
    selectDraw,
    setGeometries,
    showWindowDrawing,
    updateTOCStatus,
};
