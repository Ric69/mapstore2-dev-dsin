/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
// const { createPlugin } = require('../../MapStore2/web/client/utils/PluginsUtils');
const { createPlugin } = require('@mapstore/utils/PluginsUtils');
// const { createPlugin } = require('@mapstore/web/client/utils/PluginsUtils');

class MinimalPlugin extends React.Component {
    render() {
        const mystyle = {
            position: 'absolute',
            top: '150px',
            left: '100px',
            zIndex: 10000000,
            background: 'white',
            // border-radius:'5px',
            // border-width: '3px',
            // border-style:solid,
            width:'200px',
            height:'60px'

        };
        return <div style = { mystyle } > Minimal Plugin </div>;
    }
}

/**
 * Smallest plugin you can imagine.
 * A "Sample" div fixed on the screen
 * Here you can see the minimal structure of a plugin.
 * You can add it to (desktop) entry of the "plugins" configuration in localConfig.json
 * ```
 * {
 *    "plugins": {
 *        "desktop": [
 *            // plugins ...
 *           "Minimal",
 *           // other plugins
 *        ]
 *    }
 * }
 * ```
 */
export default createPlugin('Minimal', {
    component: MinimalPlugin
});
