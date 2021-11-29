import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { loadData } from '../../actions/sampledata';
import sampleEpics from '../../epics/sampledata';
import sampledata from '../../reducers/sampledata';

class SideEffectComponent extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        onLoad: PropTypes.func
    };

    render() {
        const style = { position: "absolute", top: "50px", left: "250px", width: "120px", zIndex: 1000000, background: "#aaaaaa", color: "#ffffff"};
        return <div style={style}>Text: {this.props.text} <button className="btn btn-danger" data-toggle="tooltip" onClick={this.props.onLoad}>Load</button></div>;
    }
}

const ConnectedSideEffect = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
}, {
        onLoad: loadData // connected action
    })(SideEffectComponent);

export const SideEffectPlugin = ConnectedSideEffect;
export const reducers = {sampledata};
export const epics = sampleEpics;