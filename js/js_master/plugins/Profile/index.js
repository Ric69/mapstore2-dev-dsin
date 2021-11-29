const React = require('react');
const { connect } = require('react-redux');
const { TiChartAreaOutline } = require('react-icons/ti');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');
const { createSelector } = require('reselect');
const { get } = require('lodash');

const profileEpics = require('./epics');
const profileReducer = require('./reducer');
const Profile = require('./components/Profile');
const {
    updateCurrentPositionProfile,
    disactivateProfile,
    drawProfile,
    changeGeometryProfile,
} = require('./actions');

const { mapSelector } = require('@mapstore/selectors/map');
const { toggleControl } = require('@mapstore/actions/controls');
const { configurePrintMap } = require('@mapstore/actions/print');
const { error } = require('@mapstore/actions/notifications');
const { changeMapView } = require('@mapstore/actions/map');
const Message = require('@mapstore/plugins/locale/Message');

const selector = createSelector(
    [
        mapSelector,
        (state) => get(state, 'controls.profile.enabled', false),
        (state) => get(state, 'profile.geometry', {}),
        (state) => get(state, 'print', {}),
        (state) =>
            (state.controls &&
                state.controls.profile &&
                state.controls.profile.enabled &&
                state.profile.show) ||
            false,
        (state) => get(state, 'profile.draw'),
        (state) => get(state, 'profile.elements', []),
        (state) => get(state, 'layers.flat', []),
        (state) => get(state, 'layers.WFS', []),
        (state) => get(state, 'locale.current', 'fr-FR'),
    ],
    (map, active, geometry, print, show, draw, elements, layers, WFSLayers, currentLocale) => ({
        map,
        active,
        geometry,
        print,
        show,
        draw,
        elements,
        layers,
        WFSLayers,
        currentLocale,
    })
);

// La liste des fonctions renvoyant certaines actions
const mapDispatchToProps = {
    deactivate: disactivateProfile,
    updateCurrentPositionProfile,
    configurePrintMap,
    changeMapView,
    drawProfile,
    toggleControl: toggleControl.bind(null, 'profile', null),
    onError: error,
    changeGeometryProfile,
};

const ProfilePlugin = connect(
    selector,
    mapDispatchToProps
)(Profile);

const ProfileButton = connect(
    (state) => ({
        active: !!(state.controls && state.controls.profile && state.controls.profile.enabled),
        icon: <Glyphicon glyph="stats" />,
        tooltip: 'profile.tooltip',
        bsStyle:
            state.controls && state.controls.profile && state.controls.profile.enabled
                ? 'success'
                : 'primary',
    }),
    {
        action: () => toggleControl('profile'),
    }
)(require('@js/plugins/BarButton'));

module.exports = {
    ProfilePlugin: assign(ProfilePlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'profile',
            position: 7,
            panel: false,
            help: <Message msgId="helptexts.profile" />,
            tooltip: 'profile.tooltip',
            text: <Message msgId="profile.tooltip" />,
            icon: (
                <TiChartAreaOutline
                    color="#c8102e"
                    style={{ width: '18px', marginRight: '14px' }}
                />
            ),
            action: toggleControl.bind(null, 'profile', null),
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'profile',
            position: 2,
            tooltip: 'profile.tooltip',
            help: <Message msgId="helptexts.profile" />,
            tool: ProfileButton,
            priority: 1,
        },
    }),
    reducers: { profile: profileReducer },
    epics: { ...profileEpics },
};
