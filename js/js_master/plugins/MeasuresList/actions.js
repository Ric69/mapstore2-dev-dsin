const ADD_GEOMETRY = 'ADD_GEOMETRY';
const DISPLAY_GEOMETRY = 'DISPLAY_GEOMETRY';
const RESET_DISPLAY_GEOMETRY = 'RESET_DISPLAY_GEOMETRY';
const REMOVE_GEOMETRIES = 'REMOVE_GEOMETRIES';
const REMOVE_GEOMETRY = 'REMOVE_GEOMETRY';
const SET_GEOMETRIES = 'SET_GEOMETRIES';

function addGeometry(geometry) {
    return {
        type: ADD_GEOMETRY,
        geometry,
    };
}

function displayGeometry(key) {
    return {
        type: DISPLAY_GEOMETRY,
        key,
    };
}

function setGeometries(geometries) {
    return {
        type: SET_GEOMETRIES,
        geometries,
    };
}

function resetDisplayGeometry() {
    return {
        type: RESET_DISPLAY_GEOMETRY,
    };
}

function removeGeometries(id) {
    return {
        type: REMOVE_GEOMETRIES,
        id,
    };
}

function removeGeometry(id) {
    return {
        type: REMOVE_GEOMETRY,
        id,
    };
}

module.exports = {
    ADD_GEOMETRY,
    DISPLAY_GEOMETRY,
    RESET_DISPLAY_GEOMETRY,
    REMOVE_GEOMETRIES,
    REMOVE_GEOMETRY,
    SET_GEOMETRIES,
    addGeometry,
    displayGeometry,
    resetDisplayGeometry,
    removeGeometries,
    removeGeometry,
    setGeometries,
};
