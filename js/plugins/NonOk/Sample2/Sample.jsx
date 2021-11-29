import React from "react";
import { Glyphicon } from "react-bootstrap";
import { toggleControl } from "@mapstore/actions/controls";
import { createPlugin } from "@mapstore/utils/PluginsUtils";

class Sample extends React.Component {
    render() {
        const style = {
            position: "absolute",
            top: "100px",
            left: "100px",
            zIndex: 10000000
        };
        return <div style={style}>Sample</div>;
    }
}

// export const SamplePlugin = SampleComponent;
// the Plugin postfix is mandatory, avoid bugs by calling all your descriptors
// <Something>Plugin

export default createPlugin("Sample", {
    component: Sample,
    containers: {
        BurgerMenu: {
            name: "sample",
            position: 1700,
            text: "Sample",
            icon: <Glyphicon glyph="wrench" />,
            action: toggleControl.bind(null, "sample", null),
            priority: 1,
            doNotHide: true
        }
    }
});
