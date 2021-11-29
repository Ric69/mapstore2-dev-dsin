import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { changeZoomLevel } from '@mapstore/actions/map';

class SeismeComponent extends React.Component {
    static propTypes = {
        zoom: PropTypes.number,
        onZoom: PropTypes.func
    };

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };
    render() {
        const style = { position: "absolute", top: "50px", left: "200px", width: "250px", zIndex: 1000000, background: "#3ca9d6", color: "#ffffff"};
        return <div style={style}>
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;
                    Zoom : &nbsp;&nbsp; {this.props.zoom} 
                    <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <label>Date :</label>
                    {/* <input id="seismedat" className="form-control"  type="text" name="inputVald" value={this.state.inputVald} onChange={e => this.handleChange(e)} /> */}
                    <br />
                    {/* 
                    <label>Magnitude :</label>
                    <input id="seismemag" className="form-control" type="text" name="inputValm" value={this.state.inputValm} onChange={e => this.handleChange(e)} />
                    <br />
                    <label>Latitude :</label>
                    <input id="seismelat" className="form-control" type="text" name="inputValla" value={this.state.inputValla} onChange={e => this.handleChange(e)} />
                    <br />
                    <label>Longitude :</label>
                    <input id="seismelon" className="form-control" type="text" name="inputVallo" value={this.state.inputVallo} onChange={e => this.handleChange(e)} />
                    <br />
                    <hr />
                    <span id="valz1">
                        <b>Rayon Zone 1 : </b>
                        {Math.round( Math.pow(10, 0.58 + 0.25 * this.state.inputValm) * 1000 *10) / 10000}{" "}kms
                    </span>
                    <br />
                    <span id="valz2">
                        <b>Rayon Zone 2 : </b>
                        {Math.round( Math.pow(10, -0.02 + 0.25 * this.state.inputValm) * 1000 *  10) / 10000}{" "}kms
                    </span>
                    <br />
                    <hr /> */}
                    <button className="btn btn-info" onClick={() => this.props.onZoom(this.props.zoom + 1)}>Croissant</button>
                    <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button className="btn btn-danger" onClick={() => this.props.onZoom(this.props.zoom - 1)}>Décroissant</button>
                    <br/><br/>
                </div>;
    }
}

const CalculSeisme = connect((state) => {
    return {
        zoom: get(state, 'map.present.zoom')
    };
}, {
        onZoom: changeZoomLevel // connected action
    })(SeismeComponent);

export const CalculSeismePlugin = CalculSeisme;

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