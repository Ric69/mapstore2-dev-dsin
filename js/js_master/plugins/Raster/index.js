const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { get } = require('lodash');
const { Glyphicon } = require('react-bootstrap');
const { createSelector } = require('reselect');

const { activeSelector } = require('../../../MapStore2/web/client/selectors/catalog');
const { mapLayoutValuesSelector } = require('../../../MapStore2/web/client/selectors/maplayout');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const Message = require('../../../MapStore2/web/client/plugins/locale/Message');
const RasterComponent = require('./components/Raster');
const { addLayer } = require('../../../MapStore2/web/client/actions/layers');
const {
    addTile,
    changeEnabledStatus,
    changeExportFormat,
    changeExportGap,
    changeSelectedStatus,
    changeVisibleState,
    removeTile,
    resetTiles,
    setConfig,
    setLayer,
    toggleLoading,
    toggleModal,
    toggleSupport,
    updateResults,
} = require('./actions');

const { BsFillGrid1X2Fill } = require('react-icons/bs');

/**
 * Liste des variables du store à écouter
 * @type Object
 */
const selector = createSelector(
    [
        (state) => (get(state, 'controls.raster.enabled') && state.raster.visible) || false,
        (state) => state.raster || {},
        (state) => mapLayoutValuesSelector(state, { height: true }),
        activeSelector,
    ],
    (active, raster, dockStyle, explorerActive) => ({
        active,
        raster,
        dockStyle,
        explorerActive,
    })
);

/**
 * Liste des actions à inclure
 * @type Object
 */
const mapDispatchToProps = {
    addLayer,
    addTile,
    changeEnabledStatus,
    changeExportFormat,
    changeExportGap,
    changeSelectedStatus,
    changeVisibleState,
    removeTile,
    resetTiles,
    setConfig,
    setLayer,
    toggleControl: toggleControl.bind(null, 'raster', null),
    toggleLoading,
    toggleModal,
    toggleSupport,
    updateResults,
};

const RasterPlugin = connect(
    selector,
    mapDispatchToProps
)(RasterComponent);

module.exports = {
    RasterPlugin: assign(RasterPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'raster',
            position: 35,
            help: <Message msgId="raster.help" />,
            tooltip: 'raster.help',
            text: <Message msgId="raster.title" />,
            icon: (
                <BsFillGrid1X2Fill color="#c8102e" style={{ width: '18px', marginRight: '14px' }} />
            ),
            action: toggleControl.bind(null, 'raster', null),
            priority: 2,
            doNotHide: true,
        },
    }),
    reducers: {
        raster: require('./reducer'),
    },
    epics: require('./epics'),
};
