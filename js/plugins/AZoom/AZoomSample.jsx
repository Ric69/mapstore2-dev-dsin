import React from 'react';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { changeZoomLevel, zoomToPoint } from '@mapstore/actions/map';

import { ZOOM_ADD_POINT, addDraw, addMarker, changeCoord, changeDraw, changeProjection, setGeometries, updateResultsStyle, updateTOCStatus, zoomAndAddPoint, } from './actions_azoom';
import {UPDATE_LAYER_FEATURE} from '@mapstore/actions/layers';
import {find} from 'lodash';
// import { zoomAndAddPointEpic } from '../../epics/zoomsample';
// import { ZOOM_ADD_POINT, zoomAndAddPoint } from '@mapstore/actions/search';
// import { zoomAndAddPointEpic } from '@mapstore/epics/search';
import { zoomAndAddPointEpic } from './epics_azoom';
import { mydefaultIconStyle } from './defaultIconZoom';

// import { drawingFeatures, setCurrentStyle } from '@mapstore/actions/draw';
// import { setStyleParameter } from '@mapstore/actions/style';
// import { zoomToPoint } from '@js/actions/appseisme';
let x = 4.813035;
let y = 45.775287;
let mygeoson = '{ "type": "Feature", "geometry": {"type": "Point", "coordinates": ['+x+','+y+']},"properties": {"Nom": "La donnée ajoutée"}}';
let mygeoson2 = '{ "type": "Feature", "geometry": {"type": "Point", "coordinates": ['+x+','+y+']}}';
let mygeom = '{"geometry": {"type": "Point", "coordinates": ['+x+','+y+']}}'
let mystyle = '';


const defaultState = {
    features: [{ id: 1, type: "Feature", geometry: { type : "Point", coordinates: [x, y]}}]
};
// https://mapstore.readthedocs.io/en/latest/developer-guide/writing-actions-reducers/
class AZoomComponent extends React.Component {
    static propTypes = {
        type: ZOOM_ADD_POINT,
        pos:PropTypes.array,
        crs:PropTypes.string,
        zoom: PropTypes.number,
        onZoom: PropTypes.func,
        toZoomPt : PropTypes.func,
        addPoint : PropTypes.func,
        addPointtoMap : PropTypes.func,
        addDraw: PropTypes.func,
        lat:PropTypes.number,
        lon:PropTypes.number,
    };
    
        // pos = [x,y];
        // crs = "EPSG:4326";
        // zoom = 7;

    render() {

        const style = { position: "absolute", top: "10px", left: "290px", width: "230px", zIndex: 1000000, background: "#3ca9d6", color: "#ffffff"};
        const mytype = () => ({type : ZOOM_ADD_POINT });
        return <div style={style}>
                <br/>&nbsp;&nbsp;&nbsp;&nbsp;
                 Zoom : &nbsp;&nbsp; {this.props.zoom} 
                <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-info" onClick={() => this.props.onZoom(this.props.zoom + 1)}>Croissant</button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-warning" onClick={() => this.props.onZoom(this.props.zoom - 1)}>Décroissant</button>
                <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                 <button className="btn btn-success" onClick={() => this.props.toZoomPt([x,y], 6,"EPSG:4326")}>Zoom To</button>
                <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-danger" onClick={() => this.props.addPointtoMap(mygeoson2)}>ADD POINT</button>
                <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <button className="btn btn-warning" onClick={() => this.props.addDraw(defaultState)}>ADD POINT2</button>
                <br/><br/>
            </div>;
    }
}

const AZoomSample = connect((state) => {
    return {
        zoom: get(state, 'map.present.zoom')
    };
}, {
        onZoom: changeZoomLevel,
        toZoomPt: zoomToPoint,
        addPoint: zoomAndAddPoint, 
        addPointtoMap: zoomAndAddPointEpic,
        addDraw: addDraw,
        // connected action
    })(AZoomComponent);

export const AZoomPlugin = AZoomSample;

// import React from 'react';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import {get} from 'lodash';

// import { updateSomething } from '@js/actions/sample';
// import sample from '@js/reducers/sample';

// class SampleComponent extends React.Component {
//     static propTypes = {
//         text: PropTypes.string,
//         onUpdate: PropTypes.func
//     };

//     render() {
//         const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
//         return <div style={style}>Text: {this.props.text} <button onClick={() => this.props.onUpdate('Updated Text')}>Update</button></div >;
//     }
// }

// const ConnectedSample = connect((state) => {
//     return {
//         text: get(state, 'sample.text')
//     };
// }, {
//         onUpdate: updateSomething // connected action
//     })(SampleComponent);

// export const ConnectedSamplePlugin = ConnectedSample;
// export const reducers = {sample};

// https://mapstore.readthedocs.io/en/latest/developer-guide/plugins-howto/