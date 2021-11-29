import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import assign from 'object-assign';

import sampledata from '../../reducers/sampledata';

class SampleComponent extends React.Component {
    static propTypes = {
        text: PropTypes.string
    };

    render() {
        const style = { position: "absolute", top: "50px", left: "200px", width: "200px", zIndex: 1000000, background: "#ff0c93", color: "#ffffff"};
        return <div style={style}>Text: {this.props.text}</div>;
    }
}

const ConnectedtoSample = connect((state) => {
    return {
        text: get(state, 'sampledata.text')
    };
})(SampleComponent);

export const ContainedPlugin = assign(ConnectedtoSample, {
    // we support the previously defined Container Plugin as a
    // possible container for this plugin
    Container: {
        name: "SampleConnected",
        id: "sample_tool",
        priority: 1
    }
});
export const reducers = {sampledata};