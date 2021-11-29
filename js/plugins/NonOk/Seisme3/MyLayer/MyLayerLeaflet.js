import React, { Component } from 'react';
import {GeoJSON} from 'react-leaflet';
import axios from 'axios';

import SymfonyRouterContext from './SymfonyRouterContext';

class ServiceGeoJson extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            data: []
        };

        this.geoJsonLayer = React.createRef();
    }

    componentDidMount() {

        const {service, params, zoom, center} = this.props;

        axios.post(this.context.generate(service, params), {zoom, center}).then(({data}) => {
            this.geoJsonLayer.current.leafletElement.clearLayers().addData(data);
            this.setState({data});
        });

    }

    render() {
        return <GeoJSON data={this.state.data} ref={this.geoJsonLayer}/>;
    }

}

ServiceGeoJson.contextType = SymfonyRouterContext;

export default ServiceGeoJson;
