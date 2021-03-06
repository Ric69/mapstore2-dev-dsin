
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM, Vector as VectorSource} from 'ol/source.js';
import { GeoJSON, KML } from 'ol/format.js';
import { defaults as defaultInteractions, DragAndDrop } from 'ol/interaction.js';
import { Vector as VectorLayer } from 'ol/layer.js';

class MapComponent extends Component {

    static defaultProps = {
        currentLocation: PropTypes.array,
        features: PropTypes.array,
        onUploadFeature: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.mapRef = null;
        this.olMap = null;
        this.setMapRef = element => {
            this.mapRef = element;
        };

        this.dragAndDropInteraction = new DragAndDrop({
            formatConstructors: [
                GeoJSON,
                KML
            ]
        });
        this.uploadFeatsSrc = new VectorSource({
            features: this.props.features
        });
        this.uploadLayer = new VectorLayer({
            source: this.uploadFeatsSrc,
            name: 'uploadLayer'
        });
    }

    
      
    render() {
        const styles = { height: '50%', width: '50%'}
        return(
            <div style={styles} ref={this.setMapRef}></div>
        )
    }

    componentWillUpdate(nextProps) {
      if (nextProps.currentLocation !== this.props.currentLocation) {
        const mapView = this.olMap.getView();
        mapView.animate({
          center: nextProps.currentLocation,
          duration: 2000
        });
      }
    }


    componentDidMount() {
        const mapDOMNode = ReactDOM.findDOMNode(this.mapRef);
        this.olMap = new Map({
            interactions: defaultInteractions().extend([this.dragAndDropInteraction]),
            target: mapDOMNode,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                this.uploadLayer
            ],
            view: new View({
                center: this.props.currentLocation,
                zoom: 8
            })
        });

        this.dragAndDropInteraction.on('addfeatures', (event) => {
            const eventFeature = event.features[0];
            const featureCentre = this.calculateCentre(eventFeature.getGeometry().getExtent())
            eventFeature.setProperties({"centre": featureCentre})
            const GeoJSONFeature = new GeoJSON().writeFeature(eventFeature);
            this.props.onUploadFeature(GeoJSONFeature);
        });
    }

    calculateCentre(extent) {
        const x = extent[0] + (extent[2]-extent[0])/2;
        const y = extent[1] + (extent[3]-extent[1])/2;
        return [x, y];
    }

    if (nextProps.features !== this.props.features) {
        this.uploadLayer.getSource().clear();
        const olFeats = []
        nextProps.features.forEach(element => {
            olFeats.push(new GeoJSON().readFeature(element));
        });
        this.uploadFeatsSrc = new VectorSource({
            features: olFeats
        });
        this.uploadLayer.setSource(this.uploadFeatsSrc);
        this.uploadLayer.getSource().refresh();
    }
    
}

export default MapComponent;