/*
 * Copyright 2021, CNR
 * All rights reserved.
*/

import assign from 'object-assign';
import React from 'react';
import { pick, get } from 'lodash';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';

import { toggleControl } from '@mapstore/actions/controls';
import AppSeismeComp from './seisme/AppSeisme';
import { FaJedi } from 'react-icons/fa';
import { createPlugin } from "@mapstore/utils/PluginsUtils";

import ToolsContainer from '@mapstore/plugins/containers/ToolsContainer';


const AppSeisme = connect((state) => ({
    enabled: state.controls && state.controls.appseisme && state.controls.appseisme.enabled || false,
    withButton: false
}), {
    onClose: toggleControl.bind(null, 'appseisme', null)
})(AppSeismeComp);

const Container = connect(() => ({
    noCaret: true,
    pullRight: true,
    bsStyle: "primary",
    title: "Application seisme"
}))(AppSeismeComp);
// export default createPlugin("AppSeisme", {
//     component: AppSeisme,
//     containers: {
//          BurgerMenu: {
//                 name: 'AppSeisme',
//                 position: 3,
//                 text: "Application Seisme",
//                 icon: <Glyphicon glyph="asterisk" />,
//                 action: toggleControl.bind(null, 'appseisme', null),
//                 priority: 1,
//                 alwaysVisible: true,
//                 doNotHide: true
//             },
//             OmniBar: {
//                 name: 'AppSeisme',
//                 position: 10,
//                 tool: true,
//                 icon: <Glyphicon glyph="asterisk" />,
//                 action: toggleControl.bind(null, 'appseisme', null),
//                 priority: 2,
//                 alwaysVisible: true,
//                 doNotHide: true
//             }
//     }
// });

export default createPlugin('AppSeisme',
    {
         component: connect((state) =>({
            controls: state.controls
        }))(AppSeisme),
        containers: {
            OmniBar: {
                name: "appseisme",
                position: 6,
                tool: true,
                icon: <FaJedi color="#3ca9d6" style={{ width: '18px', marginRight: '14px' }}/>,
                priority: 1
            },
            BurgerMenu: {
                name: 'appseisme',
                position: 6,
                text: "Application Seisme",
                icon: <FaJedi color="#3ca9d6" style={{ width: '18px', marginRight: '14px' }}/>,
                action: toggleControl.bind(null, 'appseisme', null),
                priority: 1,
                alwaysVisible: true,
                doNotHide: true
            },
        }
    }
);

// export default {
//     AppSeismePlugin: assign(AppSeisme,
//         {
//             disablePluginIf: "{state('mapType') === 'cesium'}",
//             BurgerMenu: {
//                 name: 'AppSeisme',
//                 position: 3,
//                 text: "Application Seisme",
//                 icon: <FaJedi />,
//                 action: toggleControl.bind(null, 'appseisme', null),
//                 priority: 1,
//                 alwaysVisible: true,
//                 doNotHide: true
//             },
//             OmniBar: {
//                 name: 'AppSeisme',
//                 position: 10,
//                 tool: true,
//                 icon: <FaJedi />,
//                 action: toggleControl.bind(null, 'appseisme', null),
//                 priority: 2,
//                 alwaysVisible: true,
//                 doNotHide: true
//             }
//         }),
//     reducers: {}
// };

// const AppSeismePlugin = {
//     AppSeismePlugin: assign(AppSeisme, {
//         disablePluginIf: "{state('mapType') === 'cesium'}",
//         BurgerMenu: config => {
//             const enabledFormats = get(config, 'cfg.enabledFormats', DEFAULTS);
//             return {
//                 name: 'AppSeisme',
//                 position: 3,
//                 text: "Application Seisme",
//                 icon: <Glyphicon glyph="asterisk" />,
//                 action: toggleControl.bind(null, 'appseisme', null),
//                 priority: 1,
//                 alwaysVisible: true,
//                 doNotHide: true
//             };
//         },
//         OmniBar: config => {
//             const enabledFormats = get(config, 'cfg.enabledFormats', DEFAULTS);
//             return {    
//                 name: 'AppSeisme',
//                 position: 10,
//                 tool: true,
//                 icon: <Glyphicon glyph="asterisk" />,
//                 action: toggleControl.bind(null, 'appseisme', null),
//                 priority: 2,
//                 alwaysVisible: true,
//                 doNotHide: true
//             }
//         }
//     })
//     // reducers: {}
//     // epics: epics
// };
// export default AppSeismePlugin;