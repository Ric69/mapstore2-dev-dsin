import React from 'react';
const {
    createPlugin
} = require('../../../MapStore2/web/client/utils/PluginsUtils');

class MyAmazingTool extends React.Component {
    render() {
        const style = {
            position: "absolute",
            top: "100px",
            left: "100px",
            zIndex: 10000000,
            background: "white"
        };
        return <div style = {
            style
        } > Minimal < /div>;
    }
}

export default createPlugin("MyAmazingTool", {
    component: MyAmazingTool
});
