import React from 'react';
import { connect, Provider } from "react-redux";
// import { combineReducers } from 'redux';

import PropTypes from 'prop-types';
import {get} from 'lodash';

import { Glyphicon } from "react-bootstrap";
import { FaJedi } from 'react-icons/fa';

// import { zoomToPoint } from '../../actions/zoomptseisme';
// import zoomptseisme from '../../reducers/zoomptseisme';

// const store = require('../../Store/myappstore');
// import {SeismeZoom, ZoomSeismePlugin} from "./SeismeAction";

// import seismeReducer from '../../reducers/seismecombine';
// import { ZOOM_TO_POINT, zoomToPoint } from '../../actions/seisme';
// import map from '../../reducers/zoomseisme2';

require('./Seisme.css');

import {zoomToPoint} from '@mapstore/actions/map';
import zoomptseisme from '@mapstore/reducers/map';
// import {mapSelector} from '../../../MapStore2/web/client/selectors/map';
import {mapInfoSelector} from '@mapstore/selectors/map';

import {ZOOM_ADD_POINT, zoomAndAddPoint} from '@mapstore/actions/search';
// import {zoomAndAddPointEpic} from '../../../MapStore2/web/client/epics/search';
// import {ZOOM_ADD_POINT_PERSO, zoomAndAddPointPerso} from '../../actions/zoomaddptseisme';

// import {zoomAndAddPointEpic} from '../../epics/seismeEpics';
// import {zoomAndAddPointEpicPerso} from '../../epics/seismeAddEpics';

// var assign = require('object-assign');
// var MapUtils = require('../../../MapStore2/web/client/utils/MapUtils');
// var CoordinatesUtils = require('../../../MapStore2/web/client/utils/CoordinatesUtils');
// import {panTo, PAN_TO} from '../../actions/zoomseisme.js';
// var p3;
class SeismeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVald : '',
            inputValde : '',
            inputValm : '',
            inputValla : '',
            inputVallo : '',
            pos:[],
            zoom:13,
            crs:'EPSG:4326'
        };
   
    }

    static propTypes = {
        pos: PropTypes.object,
        zoom: PropTypes.number,
        crs: PropTypes.string,
        rayon1:PropTypes.number,
        rayon2:PropTypes.number,
        even: PropTypes.string,
        magnitude: PropTypes.string,
        date: PropTypes.string,
        onZoom: PropTypes.func,
        onZoomAddPt: PropTypes.func,
        onZoomAddPtPerso: PropTypes.func,
    };
   
    onSubmit = (e) => {

        e.preventDefault();
        const des = this.state.inputValde;
        const z1 = (Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const z2 = (Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const date = this.state.inputVald;
        const magnitude = this.state.inputValm;

        const pos = "{x: " + parseFloat( this.state.inputVallo ) + ", y: " + parseFloat( this.state.inputValla ) + "}";
        const zoom = 6;
        const crs = "EPSG:4326";


        return alert( pos + ' - ' + zoom +' - '+ crs +' - '+ z1 +' - '+ z2 +' - '+ date +' - '+ magnitude + des);


        console.log('Clik sur Calcul !');

        
    }

    onEffacer = (e) => {
        e.preventDefault();
        this.setState({
            inputVald : '',
            inputValde : '',
            inputValm : '',
            inputValla : '',
            inputVallo : ''
        });
        const inf = mapInfoSelector;
         return alert(inf.toString());
    };

    onSubmit2 = (e) => {
        const z1 = (Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const z2 = (Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        console.log('Click sur Liste !');
        return alert( z1 + ' - ' + z2 + ' - ' + this.state.inputVald + ' - ' + this.state.inputValm + ' - ' + this.state.inputValla + ' - ' + this.state.inputVallo); 
        
    };

    onSubmit3 = (e) => {
        e.preventDefault();
        // const p = {x: parseFloat( this.state.inputVallo ) , y: parseFloat( this.state.inputValla ) };
        // const z = 13;
        // const c = "EPSG:4326";
        const p = [parseFloat( this.state.inputVallo ), parseFloat( this.state.inputValla )];
        this.state.pos.push(parseFloat( this.state.inputVallo ));
        this.state.pos.push(parseFloat( this.state.inputValla ));
        // this.state.pos.push(p);
        const z = this.state.zoom;
        const c =  this.state.crs;


        // const myz = map(this.state, zoomToPoint(this.state.pos, z, c));
        // const myz = (pos, z, c) => map({type: 'ZOOM_TO_POINT', pos:this.state.pos, zoom:z, crs:c});
        // const state = map({}, panTo(center));
        // pos = p; 
        // zoom = z;
        // crs = c;
        console.log('Click sur Zoom --> '+ this.state.pos.toString() + ' - '+ this.state.zoom.toString() + ' - ' + this.state.crs);
        // console.log(zoomToPoint);
        // seismeReducer('ZOOM_TO_POINT',<zoomToPoint pos={p} zoom={z} crs={c} />);
        // return zoomToPoint(pos, zoom, crs); 
        // const retval = zoomToPoint(centerz, z, c);
        console.log('Click sur Zoom --> zoomToPoint dépassé');
        // return map('ZOOM_TO_POINT', zoomToPoint(pos, zoom, crs){pos:this.state.pos, zoom:this.state.zoom, crs:this.state.crs});
        // <zoomToPoint pos={p} zoom={this.state.zoom} crs={this.state.crs} />
        // this.props.onZoom(,,this.props.crs)
        // const extent = bbox(this.props.feature);
        // this.props.onZoom(extent, 'EPSG:4326', this.props.maxZoom);
         
    };

    render() {

        const p3 = {x: parseFloat( this.state.inputVallo ), y: parseFloat( this.state.inputValla )};
        const z1 = (Math.round(((Math.pow(10, (0.58 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const z2 = (Math.round(((Math.pow(10, (-0.02 + (0.25 * this.state.inputValm)))) * 1000) * 10000) / 10000);
        const m = this.state.inputValm;
        const ev = this.state.inputValde;
        const da = this.state.inputVald;
        // const p3 = [parseFloat( this.state.inputVallo ), parseFloat( this.state.inputValla )];

        return ( 
            // <Provider store={store}>
            <div className = "SeismeContenu">
                <label>Date du traitement :</label>
                <input id = "seismedat"
                    className = "form-control"
                    type = "text"
                    name="inputVald"
                    // value={this.state.inputVald}
                    value={new Date().toLocaleDateString()}
                    onChange={e => this.handleChange(e)}
                    />
                <br />
                 <label>Description du séisme :</label>
                <input id = "seismedes"
                    className = "form-control"
                    type = "text"
                    name="inputValde"
                    value={this.state.inputValde}
                    onChange={e => this.handleChange(e)}
                    />
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
                <button className="btn btn-success" data-toggle="tooltip" data-placement="top" id="calseisme" title="Calcul de l'impact du séisme sur les ouvrages impactés" onClick={(ZOOM_ADD_POINT_PERSO) => this.props.onZoomAddPtPerso(p3, 13, 'EPSG:4326', z1, z2, ev, m, da)}>
                    <Glyphicon glyph="thumbs-up" />&nbsp; Calcul &nbsp;&nbsp;<Glyphicon glyph="eye-open" />
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                 <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="listseisme" title="liste des ouvrages impactés" onClick={(ZOOM_ADD_POINT) => this.props.onZoomAddPt(p3, 13, 'EPSG:4326')} >
                    &nbsp;<Glyphicon glyph="list-alt" />&nbsp;
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="zoomseisme" title="zoom emprise carte" onClick={() => this.props.onZoom(p3, 13, 'EPSG:4326')} >
                    &nbsp;<Glyphicon glyph="globe" />&nbsp;
                </button>
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-danger" data-toggle="tooltip" data-placement="top" id="supseisme" title="effacer les paramètres" onClick={(e) => this.onEffacer(e)}>
                    &nbsp;<Glyphicon glyph="trash" />&nbsp;
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button type="button" id="georef" className="square-button btn btn-primary" title="Se rendre sur GeoRef CNRMAPS"  onClick={(e) => { e.preventDefault(); window.open('https://www.cnr.tm.fr/', '_blank'); }} > <FaJedi /></button>
                <br />
            </div>
            // </Provider> 
        );
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

}

const SeismeActionZoom = connect((state) => {
        return {
            pos: get(state, zoomptseisme.pos),
            zoom: get(state, zoomptseisme.zoom),
            crs: get(state, zoomptseisme.crs)
        };
    }, {
            onZoom: zoomToPoint, // connected action
        })(SeismeComponent);

const SeismeActionList = connect((state) => {
        return {
            pos: get(state, zoomAndAddPointEpic.pos),
            zoom: get(state, zoomAndAddPointEpic.zoom),
            crs: get(state, zoomAndAddPointEpic.crs)
        };
    }, {
            onZoomAddPt: zoomAndAddPoint, // connected action
        })(SeismeActionZoom);

// const SeismeActionListP = connect((state) => {
//         return {
//             pos: get(state, zoomAndAddPointEpicPerso.pos),
//             zoom: get(state, zoomAndAddPointEpicPerso.zoom),
//             crs: get(state, zoomAndAddPointEpicPerso.crs),
//             rayon1: get(state, zoomAndAddPointEpicPerso.rayon1),
//             rayon2: get(state, zoomAndAddPointEpicPerso.rayon2),
//             even: get(state, zoomAndAddPointEpicPerso.even),
//             magnitude: get(state, zoomAndAddPointEpicPerso.magnitude),
//             date: get(state, zoomAndAddPointEpicPerso.date)
//         };
//     }, {
//             onZoomAddPtPerso: zoomAndAddPointPerso, // connected action
//         })(SeismeActionList);
// try {
// try {
//   if (props.pos === true) {
//     status = 'Member'
//   }
// } catch (err) {
//   console.log(err)
// }
// export default SeismeContenu;
// export const SeismePlugin = {SeismeActionZoom, SeismeActionList};
export const SeismePlugin = SeismeActionList;
// export const SeismePlugin2 = SeismeActionZoom;
// export const SeismePlugin = SeismeComponent;
// export const reducers = {ZOOM_TO_POINT};
// export default SeismeAction;
// export const reducers = {zoomptseisme};
// export const SeismePlugin = SeismeComponent;

// const myreducer = require('../../reducers/rootseisme');
// export default {
//     SeismeAction,
//     myreducer
// };

// module.default.exports = {
//    Seismeplugin: {SeismeAction},
//    reducers: {seisme}
// };