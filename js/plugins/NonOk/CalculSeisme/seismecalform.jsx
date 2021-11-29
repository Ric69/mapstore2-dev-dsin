import React, { Component } from "react";
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';

import {
    FormControl,
    FormGroup,
    Alert,
    Pagination,
    Panel,
    Form,
    InputGroup,
    ControlLabel,
    Glyphicon
} from 'react-bootstrap';

class AppZonetext extends React.Component {
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

        // this.olmap = new Map({
        //     target: null,
        //     layers: [
        //         // new OlLayerTile({
        //         //     source: new OlSourceOSM()
        //         // })
        //         // this.state.mylayer
        //     ],
        //     view: new View({
        //         center: this.state.center,
        //         zoom: this.state.zoom
        //     })
        // });
    }

    // componentDidMount() {
    //     this.olmap.setTarget("map");

    //     // Listen to map changes
    //     this.olmap.on("moveend", () => {
    //         let center = this.olmap.getView().getCenter();
    //         let zoom = this.olmap.getView().getZoom();
    //         this.setState({ center, zoom });
    //     });

    //     this.updateMap(); // Update map on did mount?
    // }
    // componentDidUpdate() {
    //     this.updateMap();
    // }

    onSubmit = (e) => {
        e.preventDefault();

        const z1 = Math.round(Math.pow(10, 0.58 + 0.25 * this.state.inputValm) * 1000 * 10000) / 10000;
        const z2 = Math.round(Math.pow(10, -0.02 + 0.25 * this.state.inputValm) * 1000 * 10000) / 10000;
        const date = this.state.inputVald;
        const magnitude = this.state.inputValm;

        const pos = "{x: " + parseFloat(this.state.inputVallo) + ", y: " + parseFloat(this.state.inputValla) + "}";
        const zoom = 6;
        const crs = "EPSG:4326";

        // console.log("Clik sur Calcul !");
        // return alert(pos + " - " + zoom + " - " + crs + " - " + z1 +" - " + z2 + " - " + date + " - " + magnitude);

        // const pt = new Point([ 4.5, 44.6 ],);

        // const cir = new Circle([4.5,44.6],1000000);

        // // Features
        // const pointFeature = new Feature(pt);
        // const circleFeature = new Feature(cir);

        // // // Source and vector layer
        // const vectorSource = new VectorSource({
        //     projection: 'EPSG:4326'
        // });
        // vectorSource.addFeatures([pointFeature, circleFeature]);

        // const vectorLayer = new Layer({
        //     source: vectorSource
        // });

        // const ptfeature = new ol.Feature(point);

        // const circleFeature = new ol.Feature(circle);

        // const map = this.olmap.setTarget("map");

        // map.addLayer(vectorLayer);

        // const featureOverlay = new ol.FeatureOverlay({
        //     map: map,
        //     features: [circleFeature,pointFeature],
        //     style: new ol.style.Style({
        //         fill: new ol.style.Fill({
        //             color: 'rgba(100, 210, 50, 0.3)'
        //         }),
        //         stroke: new ol.style.Stroke({
        //             width: 4,
        //             color: 'rgba(100, 200, 50, 0.8)'
        //         })
        //     })
        // });

        // return map.addLayer(vectorLayer);
        // map.addLayers([ol_wms, jpl_wms]);
        // this.olmap.addLayer([vectorLayer]);

        // this.setState({
        //     inputVald: "",
        //     inputValm: "",
        //     inputValla: "",
        //     inputVallo: ""
        // });
    }

    onSubmit2 = (e) => {
        e.preventDefault();
        const z1 = Math.round( Math.pow(10, 0.58 + 0.25 * this.state.inputValm) * 1000 * 10000 ) / 10000;
        const z2 = Math.round( Math.pow(10, -0.02 + 0.25 * this.state.inputValm) * 1000 * 10000 ) / 10000;
        // console.log("Click sur Liste !");
        // return alert( z1 + " - " + z2 + " - " + this.state.inputVald + " - " + this.state.inputValm +" - " + this.state.inputValla + " - " + this.state.inputVallo);
    }

    render() {
        // this.updateMap();

        return (
            <div className="AppZonetext">
                <label>Date :</label>
                <input
                    id="seismedat"
                    className="form-control"
                    type="text"
                    name="inputVald"
                    value={this.state.inputVald}
                    onChange={e => this.handleChange(e)}
                />
                <br />
                <label>Magnitude :</label>
                <input
                    id="seismemag"
                    className="form-control"
                    type="text"
                    name="inputValm"
                    value={this.state.inputValm}
                    onChange={e => this.handleChange(e)}
                />
                <br />
                <label>Latitude :</label>
                <input
                    id="seismelat"
                    className="form-control"
                    type="text"
                    name="inputValla"
                    value={this.state.inputValla}
                    onChange={e => this.handleChange(e)}
                />
                <br />
                <label>Longitude :</label>
                <input
                    id="seismelon"
                    className="form-control"
                    type="text"
                    name="inputVallo"
                    value={this.state.inputVallo}
                    onChange={e => this.handleChange(e)}
                />
                <br />
                <hr />
                <div id="valz1">
                    <b>Rayon Zone 1 : </b>
                    {Math.round(
                        Math.pow(10, 0.58 + 0.25 * this.state.inputValm) *
                            1000 *
                            10
                    ) / 10000}{" "}
                    kms
                </div>
                <br />
                <div id="valz2">
                    <b>Rayon Zone 2 : </b>
                    {Math.round(
                        Math.pow(10, -0.02 + 0.25 * this.state.inputValm) *
                            1000 *
                            10
                    ) / 10000}{" "}
                    kms
                </div>
                <br />
                <hr />
                <button
                    className="btn btn-success"
                    id="calseisme"
                    onClick={e => this.onSubmit(e)}
                >
                    Calcul !
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                    className="btn btn-info"
                    id="listseisme"
                    onClick={e => this.onSubmit2(e)}
                >
                    Liste Impact !
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button
                    className="btn btn-info"
                    id="listseisme"
                    onClick={e => this.onSubmit2(e)}
                >
                    Zoom !
                </button>
                <br />
            </div>
        );
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    // updateMap() {
    //     this.olmap.getView().setCenter(this.state.center);
    //     this.olmap.getView().setZoom(this.state.zoom);
    // }

    // userAction() {
    //     this.olmap.setState({ center: [292539.79, 5840539.79 ], zoom: 10 });
    //     // this.olmap.setTarget("map");
    //     // this.olmap.setTarget("map").getView().setZoom(this.olmap.setTarget("map").getView().getZoom() + 1);
    //     // console.log('Clik sur Zoom !');
    //     console.log('Clik sur Zoom !');
    //     // return
    // }
}
export default AppZonetext;
