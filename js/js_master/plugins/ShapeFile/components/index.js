/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');

const { editStyleParameter } = require('../../../../MapStore2/web/client/actions/style');

const { getSelectedLayerId, getSelectedLayerStyle } = require('../selector');

const StylePolygon = connect(
    (state) => ({
        shapeStyle: getSelectedLayerStyle(state),
        selectedLayer: getSelectedLayerId(state),
    }),
    {
        editStyleParameter: editStyleParameter,
    }
)(require('./StylePolygon'));

const StylePoint = connect(
    (state) => ({
        shapeStyle: getSelectedLayerStyle(state),
        selectedLayer: getSelectedLayerId(state),
    }),
    {
        editStyleParameter: editStyleParameter,
    }
)(require('./StylePoint'));

const StylePolyline = connect(
    (state) => ({
        shapeStyle: getSelectedLayerStyle(state),
        selectedLayer: getSelectedLayerId(state),
    }),
    {
        editStyleParameter: editStyleParameter,
    }
)(require('./StylePolyline'));

module.exports = {
    StylePolygon,
    StylePolyline,
    StylePoint,
};
