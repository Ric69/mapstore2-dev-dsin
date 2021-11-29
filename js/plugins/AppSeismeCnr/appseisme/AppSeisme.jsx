import PropTypes from 'prop-types';

/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import InfoButton from '@mapstore/components/buttons/InfoButton';
import Dialog from '@mapstore/components/misc/Dialog';
import AppSeismeContent from './AppSeismeContent';
import { Message } from '@mapstore/components/I18N/I18N';
import aboutImg from '@mapstore/product/assets/img/Blank.gif';
import assign from 'object-assign';
import { Glyphicon } from 'react-bootstrap';
require('./appseisme.css');
import seismeLogo from './img/Seisme_r.png';
class AppSeisme extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        modalConfig: PropTypes.object,
        withButton: PropTypes.bool,
        enabled: PropTypes.bool,
        onClose: PropTypes.func
    };

    static defaultProps = {
        style: {
            position: "absolute",
            zIndex: 100000,
            bottom: "-8px",
            right: "0px",
            margin: "8px"
        },
        modalConfig: {
            closeGlyph: "1-close"
        },
        withButton: true,
        enabled: false,
        onClose: () => {}
    };

    render() {
        return this.props.withButton ? (
            <InfoButton
                {...this.props.modalConfig}
                image={aboutImg}
                title="Application Séisme"
                btnType="image"
                className="map-logo"
                body={
                    <AppSeismeContent/>
                }/>) : (
            <Dialog
                id="mapstore-appseisme"
                style={assign({}, {zIndex: 1992, display: this.props.enabled ? "block" : "none"})}
                modal
                draggable
            >
                <span role="header">
                    <span className="appseisme-panel-title">
                        <img src={seismeLogo} style={{ display:"inline", margin:"auto", maxWidth:"7%", height:"7%", width:"7%" }} alt="Séisme CNR" />&nbsp;&nbsp;&nbsp;&nbsp;Application Séisme
                    </span>
                    <button onClick={this.props.onClose} className="appseisme-panel-close close">
                        {this.props.modalConfig.closeGlyph ? <Glyphicon glyph={this.props.modalConfig.closeGlyph}/> : <span>×</span>}
                    </button>
                </span>
                <div role="body"><AppSeismeContent/></div>
            </Dialog>);
    }
}

export default AppSeisme;
