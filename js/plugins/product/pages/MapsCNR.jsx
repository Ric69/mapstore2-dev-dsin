/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {resetControls} from '@mapstore/actions/controls';
import {loadMaps} from '@mapstore/actions/maps';
import Page from '@mapstore/containers/Page';
import ConfigUtils from '@mapstore/utils/ConfigUtils';

import("@js/plugins/product/assets/css/mapsCNR.css");

const urlQuery = url.parse(window.location.href, true).query;


/**
  * @name Maps
  * @memberof pages
  * @class
  * @classdesc
  * This is the home page of MapStore.
  * Renders plugins and triggers the initial load action for loading contents in the page.
  */
class MapsPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        reset: PropTypes.func,
        loadMaps: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        reset: () => {}
    };

    // <div class="videoloop-container">
	// 	<video autoplay="autoplay" preload="auto" loop="loop" muted="">
	//   		<source src="https://www.cnr.tm.fr/wp-content/themes/cnr/extra/assets/videos/wind-turbine.webm" type="video/webm">
	// 		<source src="https://www.cnr.tm.fr/wp-content/themes/cnr/extra/assets/videos/wind-turbine.mp4" type="video/mp4">
  	// 	</video>
	// </div>

    UNSAFE_componentWillMount() {
        if (this.props.match.params.mapType && this.props.match.params.mapId) {
            if (this.props.mode === 'mobile') {
                require('@js/plugins/product/assets/css/mobileCNR.css');
            }
            this.props.reset();
        }
    }

    render() {
        return (<Page
            id="maps"
            onMount={this.props.loadMaps}
            plugins={this.props.plugins}
            params={this.props.match.params}
        />);
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    loadMaps: () => loadMaps(
        ConfigUtils.getDefaults().geoStoreUrl,
        ConfigUtils.getDefaults().initialMapFilter || "*"
    ),
    reset: resetControls
})(MapsPage);
