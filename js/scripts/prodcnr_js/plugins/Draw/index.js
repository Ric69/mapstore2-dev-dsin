const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');

const drawingToolEpics = require('./epics');
const {
    showWindowDrawing,
    hideWindowDrawing,
    saveDrawing,
    selectDraw,
    displayDraw,
    resetDisplayDraws,
    removeDraws,
    changeProjection,
} = require('./actions');
const {
    changeDrawingStatus,
    drawSupportReset,
} = require('../../../MapStore2/web/client/actions/draw');
const drawingReducer = require('./reducer');
const Message = require('../../../MapStore2/web/client/plugins/locale/Message');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');

const DrawingTool = require('./components/DrawingTool');

const mapStateToProps = (state) => ({
    show: (state.controls && state.controls.drawing && state.controls.drawing.enabled) || false,
    TOC: state.drawing.TOC,
    features: state.drawing.features,
    geometries: state.drawing.geometries,
    active: state.controls && state.controls.drawing && state.controls.drawing.enabled,
    projections: (state.drawing && state.drawing.projections) || {
        defaultProjection: { unit: 'EPSG:4326', label: 'WGS84' },
    },
});

const mapDispatchToProps = {
    hideWindowDrawing,
    drawSupportReset,
    showWindowDrawing,
    changeDrawingStatus,
    saveDrawing,
    selectDraw,
    displayDraw,
    resetDisplayDraws,
    removeDraws,
    onClose: () => toggleControl('drawing'),
    deactivate: () => drawSupportReset('drawing'),
    onChangeProjection: changeProjection,
};

const DrawingPlugin = connect(
    mapStateToProps,
    mapDispatchToProps
)(DrawingTool);

module.exports = {
    DrawingPlugin: assign(DrawingPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: 'drawing',
            position: 13,
            tooltip: 'drawing.tooltip',
            icon: <Glyphicon glyph="pencil-add" />,
            help: <Message msgId="drawing.tooltip" />,
            action: () => toggleControl('drawing'),
            selector: (state) => ({
                bsStyle:
                    state.controls && state.controls.drawing && state.controls.drawing.enabled
                        ? 'success'
                        : 'primary',
                active: !!(
                    state.controls &&
                    state.controls.drawing &&
                    state.controls.drawing.enabled
                ),
            }),
        },
    }),
    reducers: { drawing: drawingReducer },
    epics: { ...drawingToolEpics },
};
