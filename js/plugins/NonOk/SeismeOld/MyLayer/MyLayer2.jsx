import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ol from 'ol';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Circle from 'ol/geom/Circle';
import Layer from 'ol/layer/Layer';
import VectorSource from 'ol/source/Vector';
import {
    interaction, layer, custom, control, //name spaces
    Interactions, Overlays, Controls,     //group
    Map, Layers, Overlay, Util    //objects
} from "react-openlayers";

var iconFeature = new Feature(new Point([0, 0]));
var source = new VectorSource({features: [iconFeature]});
var marker = new custom.style.MarkerStyle(
//   'https://openlayers.org/en/v4.0.1/examples/data/icon.png'
    './icon/Seisme_r.png'
);

export class Vector extends React.Component<any,any> {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>
                <Layers>
                    <layer.Vector source={source} style={marker.style} zIndex="1"/>
                </Layers>
            </div>
        );
    }
}