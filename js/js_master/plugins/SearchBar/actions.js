const ACTIVE_DRAWING_SEARCH = 'ACTIVE_DROWING_SEARCH';
const CHANGE_FULL_TEXT_RESULT_SEARCH = 'CHANGE_FULL_TEXT_RESULT_SEARCH';
const CHANGE_GEOMETRY_SEARCH = 'CHANGE_GEOMETRY_SEARCH';
const CHANGE_DEFAULT_GEOMETRY_SEARCH = 'CHANGE_DEFAULT_GEOMETRY_SEARCH';
const DELETE_GEOMETRY_SEARCH = 'DELETE_GEOMETRY_SEARCH';
const DESACTIVE_DRAWING_SEARCH = 'DESACTIVE_DRAWING_SEARCH';
const DESACTIVE_FULL_TEXT_RESULT_SEARCH = 'DESACTIVE_FULL_TEXT_RESULT_SEARCH';
const RESET_SEARCH = 'RESET_SEARCH';
const SHOW_ELEMENT_SEARCH = 'SHOW_ELEMENT_SEARCH';
const UPDATE_SEARCH = 'UPDATE_SEARCH';

function activeDrawingSearch() {
    return {
        type: ACTIVE_DRAWING_SEARCH,
    };
}

function changeFullTextResultSearch(results) {
    return {
        type: CHANGE_FULL_TEXT_RESULT_SEARCH,
        results: results,
    };
}

function changeGeometrySearch(geometry) {
    return {
        type: CHANGE_GEOMETRY_SEARCH,
        geometry: geometry,
    };
}

function setDefaultGeometry(geometry) {
    return {
        type: CHANGE_DEFAULT_GEOMETRY_SEARCH,
        geometry: geometry,
    };
}

function deleteGeometrySearch() {
    return {
        type: DELETE_GEOMETRY_SEARCH,
    };
}

function desactiveDrawingSearch() {
    return {
        type: DESACTIVE_DRAWING_SEARCH,
    };
}

function desactiveFullTextResultSearch() {
    return {
        type: DESACTIVE_FULL_TEXT_RESULT_SEARCH,
    };
}

function searchFullTextReset() {
    return {
        type: RESET_SEARCH,
    };
}

function showElementSearch(id) {
    return {
        type: SHOW_ELEMENT_SEARCH,
        id: id,
    };
}

function updateSearch(text) {
    return {
        type: UPDATE_SEARCH,
        text: text,
    };
}

module.exports = {
    ACTIVE_DRAWING_SEARCH,
    activeDrawingSearch,
    CHANGE_FULL_TEXT_RESULT_SEARCH,
    changeFullTextResultSearch,
    CHANGE_GEOMETRY_SEARCH,
    changeGeometrySearch,
    DELETE_GEOMETRY_SEARCH,
    deleteGeometrySearch,
    DESACTIVE_DRAWING_SEARCH,
    desactiveDrawingSearch,
    desactiveFullTextResultSearch,
    DESACTIVE_FULL_TEXT_RESULT_SEARCH,
    RESET_SEARCH,
    searchFullTextReset,
    SHOW_ELEMENT_SEARCH,
    showElementSearch,
    UPDATE_SEARCH,
    updateSearch,
    CHANGE_DEFAULT_GEOMETRY_SEARCH,
    setDefaultGeometry,
};
