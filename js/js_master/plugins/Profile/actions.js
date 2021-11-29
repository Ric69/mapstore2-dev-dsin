const CHANGE_GEOMETRY_PROFILE = 'CHANGE_GEOMETRY_PROFILE';
const UPDATE_CURRENT_POSITION_PROFILE = 'UPDATE_CURRENT_POSITION_PROFILE';
const DEACTIVATE_PROFILE = 'DEACTIVATE_PROFILE';
const ENABLE_PROFILE = 'ENABLE_PROFILE';
const DRAW_PROFILE = 'DRAW_PROFILE';

function changeGeometryProfile(geometry) {
    return {
        type: CHANGE_GEOMETRY_PROFILE,
        geometry: geometry,
    };
}

function updateCurrentPositionProfile(position) {
    return {
        type: UPDATE_CURRENT_POSITION_PROFILE,
        position: position,
    };
}

function enableProfile(elements) {
    return {
        type: ENABLE_PROFILE,
        elements,
    };
}

function disactivateProfile() {
    return {
        type: DEACTIVATE_PROFILE,
    };
}

function drawProfile(status) {
    return {
        type: DRAW_PROFILE,
        status,
    };
}

module.exports = {
    changeGeometryProfile,
    CHANGE_GEOMETRY_PROFILE,
    UPDATE_CURRENT_POSITION_PROFILE,
    updateCurrentPositionProfile,
    disactivateProfile,
    DEACTIVATE_PROFILE,
    ENABLE_PROFILE,
    enableProfile,
    DRAW_PROFILE,
    drawProfile,
};
