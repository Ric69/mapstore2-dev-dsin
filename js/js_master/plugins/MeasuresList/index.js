/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { connect } = require('react-redux');
const { Glyphicon } = require('react-bootstrap');

const Message = require('../../../MapStore2/web/client/plugins/locale/Message');

const assign = require('object-assign');
const { createSelector } = require('reselect');
const {
    displayGeometry,
    resetDisplayGeometry,
    removeGeometries,
    removeGeometry,
} = require('./actions');
const {
    changeMeasurement,
    changeUom,
    changeMeasurementState,
    changeGeometry,
} = require('../../../MapStore2/web/client/actions/measurement');

const { removeLayer } = require('../../../MapStore2/web/client/actions/layers');
const { changeProjection } = require('../Draw/actions');

const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const MeasureDialog = require('./components/MeasureDialog');
const MeasuresListEpics = require('./epics');
const { clickOnMap } = require('../../../MapStore2/web/client/actions/map');

const selector = (state) => {
    return {
        measurement: state.measurement || {},
        uom: (state.measurement && state.measurement.uom) || {
            length: { unit: 'm', label: 'm' },
            area: { unit: 'sqm', label: 'm²' },
        },
        lineMeasureEnabled: (state.measurement && state.measurement.lineMeasureEnabled) || false,
        areaMeasureEnabled: (state.measurement && state.measurement.areaMeasureEnabled) || false,
        bearingMeasureEnabled:
            (state.measurement && state.measurement.bearingMeasureEnabled) || false,
        geometries: state.measurement && state.measurement.geometries,
        projections: (state.drawing && state.drawing.projections) || {
            defaultProjection: { unit: 'EPSG:4326', label: 'WGS84' },
        },
    };
};
const toggleMeasureTool = toggleControl.bind(null, 'measure', null);
/**
 * Measure plugin. Allows to show the tool to measure dinstances, areas and bearing.<br>
 * See [Application Configuration](local-config) to understand how to configure lengthFormula, showLabel and uom
 * @class
 * @name Measure
 * @memberof plugins
 * @prop {boolean} showResults shows the measure in the panel itself.
 */
const Measure = connect(
    createSelector(
        [
            selector,
            (state) => (state.layers && state.layers.flat) || [],
            (state) =>
                state && state.controls && state.controls.measure && state.controls.measure.enabled,
        ],
        (measure, layers, show) => ({
            show,
            layers,
            ...measure,
        })
    ),
    {
        toggleMeasure: changeMeasurement,
        onChangeUom: changeUom,
        onClose: toggleMeasureTool,
        changeMeasurementState: changeMeasurementState,
        changeGeometry,
        clickOnMap,
        changeMeasurement,
        displayGeometry,
        resetDisplayGeometry,
        removeGeometries,
        removeGeometry,
        removeLayer,
        onChangeProjection: changeProjection,
    },
    null,
    { pure: false }
)(MeasureDialog);

module.exports = {
    MeasurePlugin: assign(Measure, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: 'measurement',
            position: 6,
            tooltip: 'measureComponent.tooltip',
            icon: <Glyphicon glyph="1-ruler" />,
            help: <Message msgId="helptexts.measureComponent" />,
            action: toggleMeasureTool,
            selector: (state) => ({
                bsStyle:
                    state.controls && state.controls.measure && state.controls.measure.enabled
                        ? 'success'
                        : 'primary',
                active: !!(
                    state.controls &&
                    state.controls.measure &&
                    state.controls.measure.enabled
                ),
            }),
        },
    }),
    reducers: {
        measurement: require('./reducer'),
    },
    epics: {
        ...MeasuresListEpics,
    },
};
