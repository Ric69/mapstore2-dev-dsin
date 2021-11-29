import React, { Component } from 'react';
// import {
//     interaction, layer, custom, control, //name spaces
//     Interactions, Overlays, Controls,     //group
//     Map, Layers, Overlay, Util    //objects
//   } from "react-openlayers";

import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';

import VectorLayer from 'ol/layer';
import VectorSource from 'ol/source';

class GeoJsonOl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lat : '',
            lon : '',
            magnitude : '',
            center: { lat: 44.5082, lng: 4.5784 },
            zoom: 10.5,
            mylayer:null

        };

        this.olmap = new Map({
            target: null,
            layers: [
                // new OlLayerTile({
                //     source: new OlSourceOSM()
                // })
                this.state.mylayer
            ],
            view: new View({
                center: this.state.center,
                zoom: this.state.zoom
            })
        });
    }

    const epicentre = new Feature({
        geometry: new Point(fromLonLat([this.state.lon, this.state.lat]))
    });
    
    epicentre.setStyle(new Style({
        image: new Icon({
            color : [113, 140, 0],
            crossOrigin : 'anonymous',
            src : './icon/Seisme_r.png'
        })
    }));

    const vectorSource = new VectorSource({
        features : [epicentre]
      });

    
    this.state.mylayer = new VectorLayer({
      source : vectorSource,
      style : styleFunction
    });
    


}

export default GeoJsonOl;