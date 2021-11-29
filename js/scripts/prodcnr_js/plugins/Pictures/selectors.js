/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { createSelector } = require('reselect');
const { layersSelector } = require('../../../MapStore2/web/client/selectors/layers');
const { head, get } = require('lodash');
const assign = require('object-assign');
const { userSelector } = require('../../../MapStore2/web/client/selectors/security');

const picturesLayerSelector = createSelector(
    [layersSelector],
    (layers) => head(layers.filter((l) => l.id === 'pictures'))
);
const removingSelector = (state) => get(state, 'pictures.removing');
const closingSelector = (state) => !!get(state, 'pictures.closing');
const editingSelector = (state) => get(state, 'pictures.editing');
const currentSelector = (state) => get(state, 'pictures.current');
const modeSelector = (state) =>
    (editingSelector(state) && 'editing') ||
    (picturesLayerSelector(state) && currentSelector(state) && 'detail') ||
    'list';
const userNameSelector = (state) => {
    let user = userSelector(state);
    return (user && user.name) || '';
};

const picturesInfoSelector = (state) =>
    assign(
        {},
        {
            editing: editingSelector(state),
            drawing: state.pictures && !!state.pictures.drawing,
            mode: modeSelector(state),
            closing: closingSelector(state),
            removing: removingSelector(state),
            errors: state.pictures.validationErrors,
            user: userNameSelector(state),
        },
        state.pictures && state.pictures.config
            ? {
                  config: state.pictures && state.pictures.config,
              }
            : {}
    );

const picturesSelector = (state) => ({
    ...(state.pictures || {}),
});

const picturesListSelector = createSelector(
    [picturesInfoSelector, picturesSelector, modeSelector],
    (info, pictures, mode) =>
        assign(
            {},
            {
                removing: pictures.removing,
                closing: !!pictures.closing,
                mode,
                pictures: pictures.listpictures,
                current: pictures.current || null,
                editing: info.editing,
                filter: pictures.filter || '',
            },
            info.config
                ? {
                      config: info.config,
                  }
                : {}
        )
);

const pictureSelector = createSelector(
    [picturesListSelector],
    (pictures) => {
        const id = pictures.current;
        return {
            picture: head((pictures.pictures || []).filter((a) => a.properties.id === id)),
        };
    }
);

module.exports = {
    modeSelector,
    picturesLayerSelector,
    picturesInfoSelector,
    picturesSelector,
    picturesListSelector,
    pictureSelector,
};
