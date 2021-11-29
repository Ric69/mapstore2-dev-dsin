const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');
const { createSelector } = require('reselect');

const Message = require('../../../MapStore2/web/client/components/I18N/Message');
const WidgetComponent = require('./components/Widgets');

const { goToPage } = require('../../../MapStore2/web/client/actions/router');
const { addWidget, removeWidget, resetWidgets } = require('./actions');
const { saveMapResource, metadataChanged } = require('../../../MapStore2/web/client/actions/maps');
const { resetCurrentMap } = require('../../../MapStore2/web/client/actions/currentMap');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const { mapSelector } = require('../../../MapStore2/web/client/selectors/map');
const { mapOptionsToSaveSelector } = require('../../../MapStore2/web/client/selectors/mapsave');
const {
    layersSelector,
    groupsSelector,
} = require('../../../MapStore2/web/client/selectors/layers');
const textSearchConfigSelector = (state) =>
    state.searchconfig && state.searchconfig.textSearchConfig;

const { AiTwotoneTool } = require('react-icons/ai');

const selector = createSelector(
    [
        mapSelector,
        mapOptionsToSaveSelector,
        layersSelector,
        groupsSelector,
        textSearchConfigSelector,
        (state) => state.controls,
        (state) => state.localConfig,
        (state) => state.router,
        (state) => state.security,
        (state) => state.widgets,
        (state) => state.widgetsPage,
    ],
    (
        map,
        additionalOptions,
        layers,
        groups,
        textSearchConfig,
        controls,
        localConfig,
        router,
        security,
        widgets,
        widgetsPage
    ) => {
        const canEdit = security && security.user && (map && map.info && map.info.canEdit);
        const visibleMap = !['/maps', '/widgets'].includes(router.location.pathname);

        return {
            additionalOptions,
            groups,
            layers,
            map,
            mapId: map && map.mapId,
            textSearchConfig,
            visible:
                (controls &&
                    controls.widgets &&
                    controls.widgets.enabled &&
                    canEdit &&
                    visibleMap) ||
                false,
            selectedWidgets: (widgets && widgets.currentMapWidgets) || [],
            currentUserWidgetList: (widgetsPage && widgetsPage.currentUserWidgetList) || [],
        };
    }
);

/**
 * Liste des actions à inclure
 * @type Object
 */
const mapDispatchToProps = {
    addWidget,
    metadataChanged,
    onMapSave: saveMapResource,
    removeWidget,
    resetWidgets,
    resetCurrentMap,
    toggleControl: toggleControl.bind(null, 'widgets', null),
};

const WidgetsPlugin = connect(
    selector,
    mapDispatchToProps
)(WidgetComponent);

module.exports = {
    WidgetsPlugin: assign(WidgetsPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'widgets',
            position: 3,
            text: <Message msgId="customWidgets.title" />,
            icon: <AiTwotoneTool color="#c8102e" style={{ width: '18px', marginRight: '14px' }} />,
            tooltip: 'customWidgets.tooltip2',
            action: toggleControl.bind(null, 'widgets', null),
            selector: (state) => {
                let map =
                    (state.map && state.map.present) ||
                    state.map ||
                    (state.config && state.config.map) ||
                    null;
                if (map && map.mapId && state && state.security && state.security.user) {
                    if (state.maps && state.maps.results) {
                        let mapId = map.mapId;
                        let currentMap = state.maps.results.filter(
                            (item) => item && '' + item.id === mapId
                        );
                        if (currentMap && currentMap.length > 0 && currentMap[0].canEdit) {
                            return {};
                        }
                    }
                    if (map.info && map.info.canEdit) {
                        return {};
                    }
                }

                return { style: { display: 'none' } };
            },
        },
        OmniBar: {
            name: 'widgets',
            title: 'widgets.title',
            tooltip: 'customWidgets.tooltip',
            position: 1,
            tool: connect(
                (state) => {
                    let canAccess = false;
                    if (
                        state.security &&
                        state.security.user &&
                        state.security.user.role === 'ADMIN'
                    ) {
                        canAccess = true;
                    }

                    return {
                        active: state.router.location.pathname === '/widgets',
                        icon: <Glyphicon glyph="plug" />,
                        tooltip: 'customWidgets.tooltip',
                        visible: canAccess,
                    };
                },
                {
                    action: ({ context }) => {
                        return goToPage('/widgets', context.router);
                    },
                }
            )(require('../BarButton')),
        },
    }),
    reducers: {
        widgets: require('./reducer'),
    },
    epics: require('./epics'),
};
