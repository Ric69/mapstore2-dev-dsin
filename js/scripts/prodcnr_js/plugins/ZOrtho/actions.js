const CHANGE_GEOMETRY_ZORTHO = 'CHANGE_GEOMETRY_ZORTHO';
const DISABLE_ZORTHO = 'DISABLE_ZORTHO';
const ENABLE_ZORTHO = 'ENABLE_ZORTHO';

function changeGeometryZOrtho(geometry) {
    return {
        type: CHANGE_GEOMETRY_ZORTHO,
        geometry: geometry,
    };
}

function enableZOrtho() {
    return {
        type: ENABLE_ZORTHO,
    };
}

function disableZOrtho() {
    return {
        type: DISABLE_ZORTHO,
    };
}

module.exports = {
    CHANGE_GEOMETRY_ZORTHO,
    DISABLE_ZORTHO,
    ENABLE_ZORTHO,
    changeGeometryZOrtho,
    disableZOrtho,
    enableZOrtho,
};
