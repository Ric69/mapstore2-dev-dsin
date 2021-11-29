const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');
const { createSelector } = require('reselect');

const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const { changeSelectedProcess, changeLayer } = require('./actions');
const { addLayer, updateGroup } = require('../../../MapStore2/web/client/actions/layers');
const Message = require('../../../MapStore2/web/client/plugins/locale/Message');
const GeoProcessingComponent = require('./components/GeoProcessing');

const { FaTools } = require('react-icons/fa');

/**
 * Liste des variables du store à écouter
 * @type Object
 */
const selector = createSelector(
    [
        (state) => state.controls,
        (state) => state.geoprocessing,
        (state) => state.layers,
        (state) => state.map,
    ],
    (controls, geoprocessing, layers, map) => ({
        visible: (controls && controls.geoprocessing && controls.geoprocessing.enabled) || false,
        geoprocessing: geoprocessing || {},
        layers: layers || {},
        map: (map && map.present) || {},
    })
);

/**
 * Liste des actions à inclure
 * @type Object
 */
const mapDispatchToProps = {
    toggleControl: toggleControl.bind(null, 'geoprocessing', null),
    changeSelectedProcess,
    changeLayer,
    addLayer,
    updateGroup,
};

const GeoProcessingPlugin = connect(
    selector,
    mapDispatchToProps
)(GeoProcessingComponent);

module.exports = {
    GeoProcessingPlugin: assign(GeoProcessingPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'geoprocessing',
            position: 4,
            panel: false,
            help: <Message msgId="geoprocessing.help" />,
            tooltip: 'geoprocessing.tooltip',
            text: <Message msgId="geoprocessing.title" />,
            icon: <FaTools color="#c8102e" style={{ width: '18px', marginRight: '14px' }} />,
            action: toggleControl.bind(null, 'geoprocessing', null),
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'geoprocessing',
            position: 4,
            tooltip: 'geoprocessing.tooltip',
            tool: connect(
                (state) => ({
                    active:
                        state.controls &&
                        state.controls.geoprocessing &&
                        state.controls.geoprocessing.enabled,
                    icon: <Glyphicon glyph="picture" />,
                    tooltip: 'geoprocessing.tooltip',
                    bsStyle:
                        state.controls &&
                        state.controls.geoprocessing &&
                        state.controls.geoprocessing.enabled
                            ? 'success'
                            : 'primary',
                }),
                {
                    action: toggleControl.bind(null, 'geoprocessing', null),
                }
            )(require('@js/plugins/BarButton')),
            priority: 1,
            doNotHide: true,
        },
    }),
    reducers: {
        geoprocessing: require('./reducer'),
    },
    epics: require('./epics'),
};
