/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

// import I18N from '@mapstore/components/I18N/I18N';
// import gsLogo from '@mapstore/assets/img/geosolutions-brand.png';
// import msLogo from '@mapstore/assets/img/mapstore-logo-0.20.png';
// import seismeLogo from '@js/plugins/AppSeisme/seisme/img/Seisme_r.png';
import seismeLogo from './img/Seisme_r.png';
require('./appseisme.css');

import {
    addMarker,
    cancelSelectedItem,
    changeActiveSearchTool,
    changeCoord,
    changeFormat,
    resetSearch,
    resultsPurge,
    searchTextChanged,
    selectSearchItem,
    showGFI,
    textSearch,
    updateResultsStyle,
    zoomAndAddPoint
} from '@mapstore/actions/search';
import { setSearchBookmarkConfig } from '@mapstore/actions/searchbookmarkconfig';
import SearchBarComp from '@mapstore/components/mapcontrols/search/SearchBar';

class AppSeisme extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVald: "",
            inputValm: "",
            inputValla: "",
            inputVallo: ""
            // center: [292539.79, 5840539.79],
            // zoom: 10.5
        };
    };

    onSubmit = (e) => {
        e.preventDefault();
        const z1 = Math.round(Math.pow(10, 0.58 + 0.25 * this.state.inputValm) * 1000 * 10000) / 10000;
        const z2 = Math.round(Math.pow(10, -0.02 + 0.25 * this.state.inputValm) * 1000 * 10000) / 10000;
        const date = this.state.inputVald;
        const magnitude = this.state.inputValm;

        const pos = "{x: " + parseFloat(this.state.inputVallo) + ", y: " + parseFloat(this.state.inputValla) + "}";
        const zoom = 6;
        const crs = "EPSG:4326";
    };   

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    // handleChangeR1 = f => {
    //         this.setState({
    //         f.target.value = ({Math.round(Math.pow(10, 0.58 + 0.25 * this.state.inputValm) * 1000 * 10) / 10000}{" "} kms)
    //     });
    // };

    render() {
        return (
            <div className="AppZonetext">
                <label>Date :</label>
                <input id="seismedat" className="form-control" type="text" name="inputVald" value={this.state.inputVald} onChange={e => this.handleChange(e)} />
                <br />
                <label>Magnitude :</label>
                <input id="seismemag" className="form-control" type="text" name="inputValm" value={this.state.inputValm} onChange={e => this.handleChange(e)} />
                <br />
                <label>Latitude :</label>
                <input id="seismelat" className="form-control" type="text" name="inputValla" value={this.state.inputValla} onChange={e => this.handleChange(e)} />
                <br />
                <label>Coordonnées :</label>
               <SearchBarBase></SearchBarBase>
                <br />
                <label>Longitude :</label>
                <input id="seismelon" className="form-control" type="text" name="inputVallo" value={this.state.inputVallo} onChange={e => this.handleChange(e)} />
                <br />
                <hr />
                <div id="valz1">
                    <b>Rayon Zone 1 : </b>
                    {Math.round(Math.pow(10, 0.58 + 0.25 * this.state.inputValm) * 1000 * 10) / 10000}{" "} kms
                     {/* <input id="seismer1" className="form-control" type="text" name="inputValr1" value={this.state.inputValr1} onChange={f => this.handleChangeR1(f)} /> */}
                </div>
                <br />
                <div id="valz2">
                    <b>Rayon Zone 2 : </b>
                    {Math.round(Math.pow(10, -0.02 + 0.25 * this.state.inputValm) * 1000 * 10) / 10000}{" "} kms
                </div>
                <br />
                <hr />
                <button className="btn btn-success"  id="calseisme" onClick={e => this.onSubmit(e)} ><img src={seismeLogo} style={{ display:"inline", margin:"0", maxWidth:"10%", height:"10%", width:"10%" }} alt="Séisme CNR" />&nbsp;&nbsp;Calcul Séisme!</button>
                {/* <button className="btn btn-danger" onClick={() => this.props.addPointtoMap(ZOOM_ADD_POINT, this.props.addPoint([x,y], 8,"EPSG:4326"))}>ADD POINT</button> */}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" id="listseisme" onClick={e => this.onSubmit2(e)} > Liste Impact ! </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" id="listseisme" onClick={e => this.onSubmit2(e)} > Zoom ! </button>
                <br />
            </div>);
        };
}

export default AppSeisme;
