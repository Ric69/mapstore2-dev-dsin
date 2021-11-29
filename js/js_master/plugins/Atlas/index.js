const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');
const { RiMap2Line } = require('react-icons/ri');
const { createSelector } = require('reselect');

const Message = require('../../../MapStore2/web/client/plugins/locale/Message');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const AtlasComponent = require('./components/Atlas');
const {
    selectLayer,
    toggleInserting,
    toggleSelection,
    resetLayers,
    toggleVisible,
} = require('./actions');
const {
    setPrintParameter,
    changeDescriptionLength,
} = require('../../../MapStore2/web/client/actions/print');

/**
 * Liste des variables du store à écouter
 * @type Object
 */
const selector = createSelector(
    [
        (state) => state.atlas || {},
        (state) => (state.layers && state.layers.flat) || [],
        (state) => (state.layers && state.layers.WFS) || [],
        (state) =>
            (state.map &&
                state.map.present &&
                state.map.present.size &&
                state.map.present.size.width) ||
            370,
        (state) => state.print || {},
        (state) =>
            (state.controls &&
                state.controls.atlas &&
                state.controls.atlas.enabled &&
                state.atlas.visible) ||
            false,
    ],
    (atlas, layers, vectors, mapWidth, print, visible) => ({
        atlas,
        layers,
        vectors,
        mapWidth,
        print,
        visible,
    })
);

/**
 * Liste des actions à inclure
 * @type Object
 */
const mapDispatchToProps = {
    toggleControl: toggleControl.bind(null, 'atlas', null),
    selectLayer,
    toggleInserting,
    toggleSelection,
    resetLayers,
    toggleVisible,
    setPrintParameter,
    changeDescriptionLength,
};

const AtlasPlugin = connect(
    selector,
    mapDispatchToProps
)(AtlasComponent);

module.exports = {
    AtlasPlugin: assign(AtlasPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'atlas',
            position: 3,
            panel: false,
            help: <Message msgId="atlas.help" />,
            tooltip: 'atlas.help',
            text: <Message msgId="atlas.title" />,
            icon: <RiMap2Line color="#c8102e" style={{ width: '18px', marginRight: '14px' }} />,
            action: toggleControl.bind(null, 'atlas', null),
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'atlas',
            position: 6,
            tooltip: 'atlas.help',
            tool: connect(
                (state) => ({
                    active:
                        (state.controls &&
                            state.controls.atlas &&
                            state.controls.atlas.enabled &&
                            state.atlas.visible) ||
                        false,
                    icon: <Glyphicon glyph="globe" />,
                    tooltip: 'atlas.help',
                    bsStyle:
                        state.controls &&
                        state.controls.atlas &&
                        state.controls.atlas.enabled &&
                        state.atlas.visible
                            ? 'success'
                            : 'primary',
                }),
                {
                    action: toggleControl.bind(null, 'atlas', null),
                }
            )(require('@js/plugins/BarButton')),
            priority: 1,
            doNotHide: true,
        },
    }),
    reducers: {
        atlas: require('./reducer'),
    },
    epics: require('./epics'),
};
