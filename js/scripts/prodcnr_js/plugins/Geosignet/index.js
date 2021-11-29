const React = require('react');
const { connect } = require('react-redux');
const { Glyphicon } = require('react-bootstrap');
const assign = require('object-assign');
const { createSelector } = require('reselect');

const { mapSelector } = require('../../../MapStore2/web/client/selectors/map');
const { mapOwnerSelector } = require('../../../MapStore2/web/client/selectors/maps');
const {
    userSelector,
    isLoggedIn,
    isAdminUserSelector,
} = require('../../../MapStore2/web/client/selectors/security');
const {
    addGeoSignet,
    addGroup,
    updateGeoSignet,
    deleteGeoSignet,
    filterSignets,
    selectSignet,
    deleteGroup,
} = require('./actions');
const geosignetEpics = require('./epics');

const Geosignet = require('./components/Geosignet');

require('./assets/style.css');

const selector = createSelector(
    [mapSelector, (state) => state.geosignets, userSelector, isAdminUserSelector, isLoggedIn],
    (map, geoSignet, user, admin, loggedIn) => {
        const geosignets = (geoSignet.list || []).filter(
            (s) => parseInt(s.mapId || (s.map && s.map.mapId)) === parseInt((map && map.mapId) || 0)
        );

        return {
            map,
            geosignets: geosignets.filter((s) =>
                s.name.toLowerCase().startsWith((geoSignet.filter || '').toLowerCase())
            ),
            group: (geoSignet.group || []).filter(
                (g) => parseInt(g.mapId) === parseInt((map && map.mapId) || 0) && !!g.name && !!g.id
            ),
            filterText: geoSignet.filter || '',
            selectedSignet: geoSignet.selected || {},
            selectedGroup: undefined,
            userName: (user && user.name) || null,
            admin,
            loggedIn,
        };
    }
);

const GeosignetPlugin = connect(
    selector,
    {
        addGeoSignet,
        addGroup,
        updateGeoSignet,
        deleteGeoSignet,
        deleteGroup,
        selectSignet,
        onFilter: filterSignets,
    }
)(Geosignet);

module.exports = {
    GeosignetPlugin: assign(GeosignetPlugin, {
        DrawerMenu: {
            name: 'geosignet',
            position: 3,
            glyph: 'star',
            icon: <Glyphicon glyph="star" />,
            buttonConfig: {
                buttonClassName: 'square-button no-border',
                tooltip: 'geosignet.title',
            },
            priority: 1,
        },
    }),
    reducers: {
        geosignets: require('./reducer'),
    },
    epics: { ...geosignetEpics },
};
