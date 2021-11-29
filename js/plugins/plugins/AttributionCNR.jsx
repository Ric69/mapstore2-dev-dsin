/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * MODIFY BY CNR (EL) FRANCE - LYON - 2021
 *
 */
import React from 'react';

import PropTypes from 'prop-types';
// import src from '../assets/img/mapstorelogo.png';
import src from "@js/plugins/images/cnr_logo_encapsule _RVB.png";
import assign from 'object-assign';

class Attribution extends React.Component {
    static propTypes = {
        src: PropTypes.string,
        style: PropTypes.object
    };

    static defaultProps = {
        src: src,
        style: {
            position: "absolute",
            width: "124px",
            left: 0,
            bottom: 0
        }
    };

    render() {
        return null;
    }
}

/**
 * Renders the logo of GeoSolutions in the {@link #plugins.NavMenu|NavMenu}
 * @name Attribution
 * @class
 * @memberof plugins
 * @prop {string} [label='GeoSolutions'] the tooltip for the logo
 * @prop {string} [href='https://www.geosolutionsgroup.com/'] the URL to redirect on click
 * @prop {string} [src] URL of the logo image. By default the GeoSolutions logo.
 */
export default {
    AttributionPlugin: assign(Attribution, {
        NavMenu: {
            tool: (props) => ({
                position: 0,
                label: props.label || 'CNR',
                href: props.href || 'https://cnr.tm.fr/',
                img: props.src && <img className="customer-logo" src={props.src} height="30" /> || <img className="customer-logo" src={src} height="30" />,
                logo: true
            })
        }
    })
};
