import React, {Component} from 'react';

import { Glyphicon } from "react-bootstrap";
import { FaJedi } from 'react-icons/fa';

// import {SeismeZoom, ZoomSeismePlugin} from "./SeismeAction";

require('./Seisme.css');
const PropTypes = require('prop-types');
// const zoomToPoint = require('../../actions/seisme');
// import { ZOOM_TO_POINT, zoomToPoint } from '../../actions/seisme';
// import seisme from '../../reducers/seisme';

class AppZonetext extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVald : '',
            inputValm : '',
            inputValla : '',
            inputVallo : ''


        };

    }
    
    onSubmit = (e) => {

        e.preventDefault();
        
        const z1 = (Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const z2 = (Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const date = this.state.inputVald;
        const magnitude = this.state.inputValm;

        const pos = "{x: " + parseFloat( this.state.inputVallo ) + ", y: " + parseFloat( this.state.inputValla ) + "}";
        const zoom = 6;
        const crs = "EPSG:4326";


        return alert( pos + ' - ' + zoom +' - '+ crs +' - '+ z1 +' - '+ z2 +' - '+ date +' - '+ magnitude );


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

        console.log('Clik sur Calcul !');

        
    }

    onEffacer = (e) => {
        e.preventDefault();
        this.setState({
            inputVald : '',
            inputValm : '',
            inputValla : '',
            inputVallo : ''
        });

    }

    onSubmit2 = (e) => {
        const z1 = (Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const z2 = (Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        console.log('Click sur Liste !');
        return alert( z1 + ' - ' + z2 + ' - ' + this.state.inputVald + ' - ' + this.state.inputValm + ' - ' + this.state.inputValla + ' - ' + this.state.inputVallo); 
        
    }

    zoom = () => {
        // const extent = bbox(this.props.feature);
        // this.props.onZoom(extent, 'EPSG:4326', this.props.maxZoom);
    }

    onZoom = (e) => {
        e.preventDefault();
        
                // const z1 = (Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        // const z2 = (Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        console.log('Click sur Zoom !');
        // return alert( z1 + ' - ' + z2 + ' - ' + this.state.inputVald + ' - ' + this.state.inputValm + ' - ' + this.state.inputValla + ' - ' + this.state.inputVallo); 
        
        const p = "{x: " + parseFloat( this.state.inputVallo ) + ", y: " + parseFloat( this.state.inputValla ) + "}";
        const z = 13;
        const c = "EPSG:4326";

         console.log('Click sur Zoom !'+ p.toString() + ' - '+ z.toString() + ' - ' + c);
        // zoomToPoint(pos, zoom, crs); 
        // const r = zoomToPoint(p , z, c);
        // console.log('Click sur Zoom !' + r);
        // const extent = bbox(this.props.feature);
        // this.props.onZoom(extent, 'EPSG:4326', this.props.maxZoom);
        // this.props.onZoomTo(p , z, c);
    //    <zoomToPoint pos={p} zoom={z} crs={c} />
    }

    render() {
        // this.updateMap();
        // const charZ1 = this.state.useInputmagn.split('').map((z1, index) => {
        //     return (<Zonetextz1 character={z1} key={index} />); console.log(this.state.useInputmagn);
        // });
        // const charZ2 = this.state.useInputmagn.split('').map((z2, index) => {
        //     return (<Zonetextz2 character={z2} key={index} />); console.log(this.state.useInputmagn);
        // });
        const p = "{x: " + parseFloat( this.state.inputVallo ) + ", y: " + parseFloat( this.state.inputValla ) + "}";
        const z = 6;
        const c = "EPSG:4326";
        return ( 
            <div className = "AppZonetext">
                <label>Date du séisme :</label>
                <input id = "seismedat"
                    className = "form-control"
                    type = "text"
                    name="inputVald"
                    value={this.state.inputVald}
                    onChange={e => this.handleChange(e)}
                    placeholder="Saisir une date de type --> dd/mm/yyyy" />
                <br />
                <label>Magnitude :</label>
                <input id = "seismemag"
                    className = "form-control"
                    type = "text"
                    name="inputValm"
                    value={this.state.inputValm}
                    onChange={e => this.handleChange(e)}/>
                <br />
                <label>Latitude :</label>
                <input id = "seismelat"
                    className = "form-control"
                    type = "text"
                    name="inputValla"
                    value={this.state.inputValla}
                    onChange={e => this.handleChange(e)}/>
                <br />
                <label>Longitude :</label>
                <input id = "seismelon"
                    className = "form-control"
                    type = "text"
                    name="inputVallo"
                    value={this.state.inputVallo}
                    onChange={e => this.handleChange(e)}/>
                <br />
                <hr />
                <div id="valz1"><b>Rayon Zone 1 : </b>{(Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10) / 10000)} kms</div>
                <br />
                <div id="valz2"><b>Rayon Zone 2 : </b>{(Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10) / 10000)} kms</div>
                <br />
                <hr />
                <button className="btn btn-success" data-toggle="tooltip" data-placement="top" id="calseisme" title="Calcul de l'impact du séisme sur les ouvrages impactés" onClick={(e) => this.onSubmit(e)}>
                    <Glyphicon glyph="thumbs-up" />&nbsp; Calcul &nbsp;&nbsp;<Glyphicon glyph="eye-open" />
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="listseisme" title="liste des ouvrages impactés" onClick={(e) => this.onSubmit2(e)}>
                    &nbsp;<Glyphicon glyph="list-alt" />&nbsp;
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                {/* <ZoomSeismePlugin pos={p} zoom={z} crs={c} /> */}
                <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="zoomseisme" title="zoom emprise carte" onClick={(e) => this.onZoom(e)}>
                    &nbsp;<Glyphicon glyph="globe" />&nbsp;
                </button>
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-danger" data-toggle="tooltip" data-placement="top" id="supseisme" title="effacer les paramètres" onClick={(e) => this.onEffacer(e)}>
                    &nbsp;<Glyphicon glyph="trash" />&nbsp;
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button type="button" id="georef" class="square-button btn btn-primary" title="Se rendre sur GeoRef CNRMAPS"  onClick={(e) => { e.preventDefault(); window.open('https://www.cnr.tm.fr/', '_blank'); }} > <FaJedi /></button>
            
                <br />
            </div>
        );
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

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
