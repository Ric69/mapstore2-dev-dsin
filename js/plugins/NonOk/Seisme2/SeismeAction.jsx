import React from "react";
import { connect } from "react-redux";

import PropTypes from 'prop-types';
import {get} from 'lodash';

import { ZOOM_TO_POINT } from '../../../MapStore2/web/client/actions/map';
import seisme from '../../reducers/seisme';

import { Glyphicon } from "react-bootstrap";
import { FaJedi } from 'react-icons/fa';

class SeismeZoom extends React.Component {
    static propTypes = {
        pos: PropTypes.object,
        zoom: PropTypes.number,
        crs: PropTypes.string,
        onZoom: PropTypes.func
    };

    render() {
        // const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
        // return <div style={style}>Text: {this.props.text} <button onClick={() => this.props.onUpdate('ZOOM_TO_POINT')}>Update</button></div >;
        return  <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="zoomseisme" title="zoom emprise carte" onClick={() => this.props.onZoom(this.props.pos,this.props.zoom,this.props.crs)}>
                    &nbsp;<Glyphicon glyph="globe" />&nbsp;
                </button>
    }
}

const SeismeAction = connect((state) => {
    return {
        pos: get(state, 'seisme.pos'),
        zoom: get(state, 'seisme.zoom'),
        crs: get(state, 'seisme.crs')
    };
}, {
        onZoom: ZOOM_TO_POINT // connected action
    })(SeismeZoom);

export const ZoomSeismePlugin = SeismeAction;
export const reducers = {seisme};
