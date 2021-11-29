
import React from 'react';
import { Glyphicon } from "react-bootstrap";

let x = 4.813035;
let y = 45.775287;
class SampleComponent extends React.Component {
    render() {
        const style = {position: "absolute", top: "10px", left: "100px", background: "#55006A", color: "#ffffff", zIndex: 1000000};
      
        return (
            <div style={style}>
                <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="zoomseisme" title="zoom emprise carte" onClick={() => console.log('je suis passé dans la fonction! - x: '+x+' - y: '+y)} >
                    &nbsp;Mon Bouton plugin perso&nbsp;
                </button>
            </div>
        );
    }
}

export const SamplePlugin = SampleComponent;
// the Plugin postfix is mandatory, avoid bugs by calling all your descriptors
// <Something>Plugin