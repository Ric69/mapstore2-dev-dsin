/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { bindActionCreators } = require('redux');
const { connect } = require('react-redux');
const {
    loadMaps,
    attributeUpdated,
    updateMapMetadata,
    deleteMap,
    createThumbnail,
    updateDetails,
    deleteDetails,
    saveDetails,
    toggleDetailsSheet,
    toggleGroupProperties,
    toggleUnsavedChanges,
    setDetailsChanged,
    deleteThumbnail,
    saveMap,
    thumbnailError,
    saveAll,
    onDisplayMetadataEdit,
    resetUpdating,
    backDetails,
    undoDetails,
    updateAttribute,
} = require('../../../../MapStore2/web/client/actions/maps');
const {
    editMap,
    updateCurrentMap,
    errorCurrentMap,
    removeThumbnail,
    resetCurrentMap,
} = require('../../../../MapStore2/web/client/actions/currentMap');

const { success, warning } = require('../../../../MapStore2/web/client/actions/notifications');

const { mapTypeSelector } = require('../../../../MapStore2/web/client/selectors/maptype');
const { showMapDetailsSelector } = require('../../../../MapStore2/web/client/selectors/maps.js');
const { userEmailSelector } = require('../../../../MapStore2/web/client/selectors/security');

const MapsGrid = connect(
    (state) => {
        return {
            bsSize: 'small',
            currentMap: state.currentMap,
            showMapDetails: showMapDetailsSelector(state),
            loading: state.maps && state.maps.loading,
            mapType: mapTypeSelector(state),
            userEmail: userEmailSelector(state),
            widgets: (state.widgets && state.widgets.enabled) || [],
        };
    },
    (dispatch) => {
        return {
            loadMaps: (...params) => dispatch(loadMaps(...params)),
            attributeUpdated: (...params) => dispatch(attributeUpdated(...params)),
            updateMapMetadata: (...params) => dispatch(updateMapMetadata(...params)),
            editMap: (...params) => dispatch(editMap(...params)),
            saveMap: (...params) => dispatch(saveMap(...params)),
            removeThumbnail: (...params) => dispatch(removeThumbnail(...params)),
            onDisplayMetadataEdit: (...params) => dispatch(onDisplayMetadataEdit(...params)),
            resetUpdating: (...params) => dispatch(resetUpdating(...params)),
            saveAll: (...params) => dispatch(saveAll(...params)),
            updateCurrentMap: (...params) => dispatch(updateCurrentMap(...params)),
            errorCurrentMap: (...params) => dispatch(errorCurrentMap(...params)),
            thumbnailError: (...params) => dispatch(thumbnailError(...params)),
            createThumbnail: (...params) => dispatch(createThumbnail(...params)),
            deleteThumbnail: (...params) => dispatch(deleteThumbnail(...params)),
            deleteMap: (...params) => dispatch(deleteMap(...params)),
            resetCurrentMap: (...params) => dispatch(resetCurrentMap(...params)),
            onUpdateAttribute: (...params) => dispatch(updateAttribute(...params)),
            onSuccess: (...params) => dispatch(success(...params)),
            onWarning: (...params) => dispatch(warning(...params)),
            detailsSheetActions: bindActionCreators(
                {
                    onBackDetails: backDetails,
                    onUndoDetails: undoDetails,
                    onToggleDetailsSheet: toggleDetailsSheet,
                    onToggleGroupProperties: toggleGroupProperties,
                    onToggleUnsavedChangesModal: toggleUnsavedChanges,
                    onsetDetailsChanged: setDetailsChanged,
                    onUpdateDetails: updateDetails,
                    onSaveDetails: saveDetails,
                    onDeleteDetails: deleteDetails,
                },
                dispatch
            ),
        };
    }
)(require('./MapGrid'));

module.exports = MapsGrid;
