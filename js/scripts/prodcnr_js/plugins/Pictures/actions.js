/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const NEW_PICTURE = 'PICTURES:NEW';
const CANCEL_EDIT_PICTURE = 'PICTURES:CANCEL_EDIT';
const SAVE_PICTURE = 'PICTURES:SAVE';
const TOGGLE_ADD = 'PICTURES:TOGGLE_ADD';
const UPDATE_PICTURE_GEOMETRY = 'PICTURES:UPDATE_GEOMETRY';
const HIGHLIGHT = 'PICTURES:HIGHLIGHT';
const CLEAN_HIGHLIGHT = 'PICTURES:CLEAN_HIGHLIGHT';
const CLOSE_PICTURES = 'PICTURES:CLOSE';
const CONFIRM_CLOSE_PICTURES = 'PICTURES:CONFIRM_CLOSE';
const CANCEL_CLOSE_PICTURES = 'PICTURES:CANCEL_CLOSE';
const INIT_PICTURE_GEOMETRY = 'INIT_PICTURE_GEOMETRY';

function newPicture(featureType) {
    return {
        type: NEW_PICTURE,
        featureType,
    };
}

function cancelEditPicture() {
    return {
        type: CANCEL_EDIT_PICTURE,
    };
}

function savePicture(id, geometry, picture, comment) {
    return {
        type: SAVE_PICTURE,
        id,
        geometry,
        picture,
        comment,
    };
}

function toggleAdd() {
    return {
        type: TOGGLE_ADD,
    };
}

function updatePictureGeometry(geometry) {
    return {
        type: UPDATE_PICTURE_GEOMETRY,
        geometry,
    };
}

function initPictureGeometry(geometry) {
    return {
        type: INIT_PICTURE_GEOMETRY,
        geometry,
    };
}

function highlight(id) {
    return {
        type: HIGHLIGHT,
        id,
    };
}

function cleanHighlight() {
    return {
        type: CLEAN_HIGHLIGHT,
    };
}

function closePictures() {
    return {
        type: CLOSE_PICTURES,
    };
}

function confirmClosePictures() {
    return {
        type: CONFIRM_CLOSE_PICTURES,
    };
}

function cancelClosePictures() {
    return {
        type: CANCEL_CLOSE_PICTURES,
    };
}

module.exports = {
    NEW_PICTURE,
    CANCEL_EDIT_PICTURE,
    SAVE_PICTURE,
    TOGGLE_ADD,
    UPDATE_PICTURE_GEOMETRY,
    HIGHLIGHT,
    CLEAN_HIGHLIGHT,
    CLOSE_PICTURES,
    CONFIRM_CLOSE_PICTURES,
    CANCEL_CLOSE_PICTURES,
    INIT_PICTURE_GEOMETRY,
    newPicture,
    cancelEditPicture,
    savePicture,
    toggleAdd,
    updatePictureGeometry,
    initPictureGeometry,
    highlight,
    cleanHighlight,
    closePictures,
    confirmClosePictures,
    cancelClosePictures,
};
