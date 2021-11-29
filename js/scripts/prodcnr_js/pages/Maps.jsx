/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const url = require('url');

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const Page = require('../../MapStore2/web/client/containers/Page');
const { loadMaps } = require('../../MapStore2/web/client/actions/maps');
const { resetControls } = require('../../MapStore2/web/client/actions/controls');

const urlQuery = url.parse(window.location.href, true).query;

require('../../MapStore2/web/client/product/assets/css/maps.css');

class MapsPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMaps: PropTypes.func,
        plugins: PropTypes.object,
    };

    static defaultProps = {
        mode: 'desktop',
        reset: () => {},
    };

    UNSAFE_componentWillMount() {
        if (this.props.match.params.mapType && this.props.match.params.mapId) {
            if (this.props.mode === 'mobile') {
                require('../../MapStore2/web/client/product/assets/css/mobile.css');
            }
            this.props.reset();
        }
    }

    render() {
        return <Page id="maps" onMount={this.props.loadMaps} plugins={this.props.plugins} params={this.props.match.params} />;
    }
}

module.exports = connect(
    (state) => ({
        mode: urlQuery.mobile || (state.browser && state.browser.mobile) ? 'mobile' : 'desktop',
    }),
    {
        loadMaps: () => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || '*'),
        reset: resetControls,
    }
)(MapsPage);
