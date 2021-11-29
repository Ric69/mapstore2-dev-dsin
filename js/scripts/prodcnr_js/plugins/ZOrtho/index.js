const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');

const zOrthoEpics = require('./epics');
const ZOrtho = require('./components/ZOrtho');
const { disableZOrtho } = require('./actions');
const { changeDrawingStatus } = require('../../../MapStore2/web/client/actions/draw');
const {
    saveAnnotation,
    showAnnotation,
    newAnnotation,
} = require('../../../MapStore2/web/client/actions/annotations');
const {
    addMarker,
    zoomAndAddPoint,
    resultsPurge,
} = require('../../../MapStore2/web/client/actions/search');
const { addLayer } = require('../../../MapStore2/web/client/actions/layers');
const { updateAdditionalLayer } = require('../../../MapStore2/web/client/actions/additionallayers');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const Message = require('../../../MapStore2/web/client/plugins/locale/Message');

const mapStateToProps = (state) => ({
    active: state.controls && state.controls.zOrtho && state.controls.zOrtho.enabled,
    geometry: state.zOrtho.geometry,
    show:
        state.controls &&
        state.controls.zOrtho &&
        state.controls.zOrtho.enabled &&
        state.zOrtho.show,
});

// // La liste des fonctions renvoyant certaines actions
const mapDispatchToProps = {
    toggleControl: toggleControl.bind(null, 'zOrtho', null),
    changeDrawingStatus,
    saveAnnotation,
    showAnnotation,
    newAnnotation,
    addMarker,
    zoomAndAddPoint,
    addLayer,
    updateAdditionalLayer,
    resultsPurge,
    disactivate: disableZOrtho,
};

const ZOrthoPlugin = connect(
    mapStateToProps,
    mapDispatchToProps
)(ZOrtho);

const ZOrthoButton = connect(
    (state) => ({
        active: state.controls && state.controls.zOrtho && state.controls.zOrtho.enabled,
        icon: <Glyphicon glyph="retweet" />,
        tooltip: 'zOrtho.tooltip',
        bsStyle:
            state.controls && state.controls.zOrtho && state.controls.zOrtho.enabled
                ? 'success'
                : 'primary',
    }),
    {
        action: () => toggleControl('zOrtho'),
    }
)(require('@js/plugins/BarButton'));

module.exports = {
    ZOrthoPlugin: assign(ZOrthoPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'zOrtho',
            position: 7,
            panel: false,
            tooltip: 'zOrtho.tooltip',
            text: <Message msgId="zOrtho.tooltip" />,
            icon: <Glyphicon glyph="retweet" />,
            action: toggleControl.bind(null, 'zOrtho', null),
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'zOrtho',
            position: 1,
            tooltip: 'zOrtho.tooltip',
            tool: ZOrthoButton,
            priority: 1,
        },
    }),
    reducers: { zOrtho: require('./reducer') },
    epics: { ...zOrthoEpics },
};
