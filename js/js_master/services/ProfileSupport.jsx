/**
 * @author CapGemini
 */
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import PropTypes from 'prop-types';
import React from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { getCustomStyles } from '@mapstore/components/map/openlayers/LegacyVectorStyle';

class ProfileSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        projection: PropTypes.string,
        profile: PropTypes.object,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        updateOnMouseMove: false,
    };

    constructor(props) {
        super(props);

        this.markerRef = React.createRef();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.profile.position !== this.props.profile.position) {
            this.addMarker();
        }

        if (!newProps.profile.show && !!this.markerRef.current) {
            this.props.map.removeLayer(this.markerRef.current);
        }
    }

    render() {
        return null;
    }

    addMarker = () => {
        const coordinates = [this.props.profile.position.x, this.props.profile.position.y];
        const layerLines = new VectorLayer({
            zIndex: 10000000,
            projection: 'EPSG:4326',
            source: new VectorSource({
                features: [
                    new Feature({
                        geometry: new Point(coordinates),
                        name: 'point',
                    }),
                ],
            }),
            style: getCustomStyles(),
        });

        !!this.markerRef.current && this.props.map.removeLayer(this.markerRef.current);
        this.props.map.addLayer(layerLines);
        this.markerRef.current = layerLines;
    };
}

export default ProfileSupport;
