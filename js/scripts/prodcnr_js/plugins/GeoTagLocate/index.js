const React = require('react');
const { connect } = require('react-redux');
const { Glyphicon } = require('react-bootstrap');
const assign = require('object-assign');
const Message = require('../../../MapStore2/web/client/plugins/locale/Message');

const { toggleFilter } = require('./actions');

const mapStateToProps = (state) => ({});

// La liste des actions
const mapDispatchToProps = {
    toggleFilter: toggleFilter,
};

class Empty extends React.Component {
    render() {
        return null;
    }
}

const GeoTagLocatePlugin = connect(
    mapStateToProps,
    mapDispatchToProps
)(Empty);

module.exports = {
    GeoTagLocatePlugin: assign(GeoTagLocatePlugin, {
        disablePluginIf: "{state('mapType') === 'cesium' }",
        Toolbar: {
            name: 'geotaglocate',
            position: 50,
            tooltip: 'geotag.tooltip',
            icon: <Glyphicon glyph="user" />,
            help: <Message msgId="geotag.tooltip" />,
            action: toggleFilter,
            selector: (state) => ({
                bsStyle: !!(state.userFilter && state.userFilter.enabled) ? 'success' : 'primary',
                active: !!(
                    state.security &&
                    state.security.user &&
                    state.userFilter &&
                    state.userFilter.enabled
                ),
                visible: !!(state.security && state.security.user),
                hidden: !(state.security && state.security.user),
            }),
        },
    }),
    reducers: { userFilter: require('./reducer') },
    epics: require('./epics'),
};
