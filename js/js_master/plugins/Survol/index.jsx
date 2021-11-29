const React = require('react');
const { connect } = require('react-redux');
const { createSelector } = require('reselect');
const { Glyphicon } = require('react-bootstrap');
const assign = require('object-assign');

const { toggleMapInfoSurvolState } = require('../../../MapStore2/web/client/actions/mapInfo');

require('./survolOption.css');

const selector = createSelector(
    [(state) => (state.mapInfo && state.mapInfo.enabledSurvol) || false],
    (enabledSurvol) => ({
        enabledSurvol,
    })
);

class Empty extends React.Component {
    render() {
        return null;
    }
}

const SurvolPlugin = connect(selector)(Empty);

module.exports = {
    SurvolPlugin: assign(SurvolPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: 'survol',
            position: 10,
            tooltip: 'survolOption',
            icon: <Glyphicon glyph="hand-up" />,
            action: toggleMapInfoSurvolState,
            selector: (state) => ({
                bsStyle: state.mapInfo && state.mapInfo.enabledSurvol ? 'success' : 'primary',
                active: state.mapInfo && state.mapInfo.enabledSurvol,
            }),
        },
    }),
    epics: { ...require('./epics') },
};
