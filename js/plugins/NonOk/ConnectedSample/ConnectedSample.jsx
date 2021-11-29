import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { updateSomething } from '../../actions/sample';
import sample from '../../reducers/sample';

class SampleComponent extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        onUpdate: PropTypes.func
    };

    render() {
        const style = { position: "absolute", top: "200px", left: "70px", width:"120px", width: "120px", zIndex: 1000000, background: "#b6fcd5", color: "#ffffff" };
        return <div style={style}>Text: {this.props.text} <button className="btn btn-info" data-toggle="tooltip" onClick={() => this.props.onUpdate('Updated Text')}>Update</button></div >;
    }
}

const ConnectedSample = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
}, {
        onUpdate: updateSomething // connected action
    })(SampleComponent);

export const ConnectedSamplePlugin = ConnectedSample;
export const reducers = {sample};