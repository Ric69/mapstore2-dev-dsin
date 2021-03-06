/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const { connect } = require('react-redux');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

const maptypeEpics = require('../../MapStore2/web/client/epics/maptype');
const mapsEpics = require('../../MapStore2/web/client/epics/maps');
const customMapsEpics = require('@js/plugins/Maps/epics');
const { mapTypeSelector } = require('../../MapStore2/web/client/selectors/maptype');
const { userRoleSelector } = require('../../MapStore2/web/client/selectors/security');
const { totalCountSelector } = require('../../MapStore2/web/client/selectors/maps');
const { isFeaturedMapsEnabled } = require('../../MapStore2/web/client/selectors/featuredmaps');
const { createSelector } = require('reselect');

const MapsGrid = require('./Maps/components/MapsGrid');
const MetadataModal = require('../../MapStore2/web/client/plugins/maps/MetadataModal');

const { loadMaps, setShowMapDetails } = require('../../MapStore2/web/client/actions/maps');

const PaginationToolbar = connect(
    (state) => {
        if (!state.maps) {
            return {};
        }
        let { start, limit, results, loading, totalCount, searchText } = state.maps;
        const total = Math.min(totalCount || 0, limit || 0);
        const page = (results && total && Math.ceil(start / total)) || 0;
        return {
            page: page,
            pageSize: limit,
            items: results,
            total: totalCount,
            searchText,
            loading,
        };
    },
    { onSelect: loadMaps },
    (stateProps, dispatchProps) => {
        return {
            ...stateProps,
            onSelect: (pageNumber) => {
                let start = stateProps.pageSize * pageNumber;
                let limit = stateProps.pageSize;
                dispatchProps.onSelect(ConfigUtils.getDefaults().geoStoreUrl, stateProps.searchText, { start, limit });
            },
        };
    }
)(require('../../MapStore2/web/client/components/misc/PaginationToolbar'));

class Maps extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        title: PropTypes.any,
        onGoToMap: PropTypes.func,
        loadMaps: PropTypes.func,
        setShowMapDetails: PropTypes.func,
        showMapDetails: PropTypes.bool,
        maps: PropTypes.object,
        searchText: PropTypes.string,
        mapsOptions: PropTypes.object,
        colProps: PropTypes.object,
        fluid: PropTypes.bool,
    };

    static contextTypes = {
        router: PropTypes.object,
    };

    static defaultProps = {
        mapType: 'leaflet', // leaflet??
        onGoToMap: () => {},
        loadMaps: () => {},
        setShowMapDetails: () => {},
        fluid: false,
        title: (
            <h3>
                <Message msgId="manager.maps_title" />
            </h3>
        ),
        mapsOptions: { start: 0, limit: 12 },
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 4,
            className: 'ms-map-card-col',
        },
        maps: [],
    };

    componentDidMount() {
        // if there is a change in the search text it uses that before the initialMapFilter
        this.props.loadMaps(
            ConfigUtils.getDefaults().geoStoreUrl,
            this.props.searchText || ConfigUtils.getDefaults().initialMapFilter || '*',
            this.props.mapsOptions
        );
        this.props.setShowMapDetails(this.props.showMapDetails);
    }

    render() {
        return (
            <MapsGrid
                maps={this.props.maps}
                fluid={this.props.fluid}
                title={this.props.title}
                colProps={this.props.colProps}
                viewerUrl={(map) => {
                    this.context.router.history.push('/map/' + map.id);
                }}
                bottom={<PaginationToolbar />}
                metadataModal={MetadataModal}
            />
        );
    }
}

const mapsPluginSelector = createSelector(
    [
        mapTypeSelector,
        (state) => state.maps && state.maps.searchText,
        (state) => (state.maps && state.maps.results ? state.maps.results : []),
        isFeaturedMapsEnabled,
        userRoleSelector,
    ],
    (mapType, searchText, maps, featuredEnabled, role) => ({
        mapType,
        searchText,
        maps: maps.map((map) => ({ ...map, featuredEnabled: featuredEnabled && role === 'ADMIN' })),
    })
);

const MapsPlugin = connect(
    mapsPluginSelector,
    {
        loadMaps,
        setShowMapDetails,
    }
)(Maps);

module.exports = {
    MapsPlugin: assign(MapsPlugin, {
        NavMenu: {
            position: 2,
            label: <Message msgId="manager.maps_title" />,
            linkId: '#mapstore-maps-grid',
            glyph: '1-map',
        },
        ContentTabs: {
            name: 'maps',
            TitleComponent: connect(
                createSelector(
                    totalCountSelector,
                    (count) => ({ count })
                )
            )(({ count = '' }) => <Message msgId="resources.maps.title" msgParams={{ count: count + '' }} />),
            position: 1,
            tool: true,
            priority: 1,
        },
    }),
    epics: {
        ...maptypeEpics,
        ...mapsEpics,
        ...customMapsEpics,
    },
    reducers: {
        currentMap: require('../../MapStore2/web/client/reducers/currentMap'),
        maps: require('../../MapStore2/web/client/reducers/maps'),
        maptype: require('../../MapStore2/web/client/reducers/maptype'),
    },
};
