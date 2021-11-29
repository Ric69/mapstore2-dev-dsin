const React = require('react');
const { connect } = require('react-redux');
const { createSelector } = require('reselect');
const { Glyphicon } = require('react-bootstrap');
const assign = require('object-assign');

const { toggleMapInfoTempoState } = require('../../../MapStore2/web/client/actions/mapInfo');

const selector = createSelector(
    [(state) => (state.mapInfo && state.mapInfo.enabledTempo) || false],
    (enabledTempo) => ({
        enabledTempo,
    })
);

class Empty extends React.Component {
    render() {
        return null;
    }
}

const TempoPlugin = connect(selector)(Empty);

module.exports = {
    TempoPlugin: assign(TempoPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: 'tempo',
            position: 12,
            tooltip: 'tempoOption',
            icon: <Glyphicon glyph="time" />,
            action: toggleMapInfoTempoState,
            selector: (state) => ({
                bsStyle: state.mapInfo && state.mapInfo.enabledTempo ? 'success' : 'primary',
                active: state.mapInfo && state.mapInfo.enabledTempo,
            }),
        },
    }),
};
